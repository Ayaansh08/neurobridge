import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import {
  BedrockRuntimeClient,
  ConverseCommand,
  Message as BedrockMessage,
  SystemContentBlock,
} from '@aws-sdk/client-bedrock-runtime';
import { RuleRecord, SessionMessage, SessionRecord } from '../shared/types';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Cost guardrails & Configuration:
// Model: Amazon Nova 2 Lite via the global inference profile from ap-south-1.
const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID || 'global.amazon.nova-2-lite-v1:0';
const bedrockClient = new BedrockRuntimeClient({
  maxAttempts: 2, // Maximum 1 retry (2 total attempts) to prevent retry storms burning calls
});

const SESSIONS_TABLE = process.env.SESSIONS_TABLE_NAME || '';
const RULES_TABLE = process.env.RULES_TABLE_NAME || '';

// Hard limits for cost control
const MAX_SESSION_MESSAGES = 30; // Hard session cap to prevent runaway loops
const MAX_HISTORY_MESSAGES = 10; // Last 10 messages sent to Bedrock (5 exchanges)
const MAX_OUTPUT_TOKENS = 300;   // Short conversational turns only

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
};

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  try {
    const sessionId = event.pathParameters?.sessionId;
    if (!sessionId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'sessionId path parameter is required' }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const { message } = JSON.parse(event.body);
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'A non-empty string "message" is required in request body' }),
      };
    }

    // 1. Fetch current session
    const sessionRes = await docClient.send(
      new GetCommand({
        TableName: SESSIONS_TABLE,
        Key: { sessionId },
      })
    );

    if (!sessionRes.Item) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: `Session not found for id ${sessionId}` }),
      };
    }

    const session = sessionRes.Item as SessionRecord;

    if (session.status === 'completed') {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Session is already completed' }),
      };
    }

    // 2. Cost Guardrail: Enforce hard per-session message cap (30 messages)
    if (session.messages.length >= MAX_SESSION_MESSAGES) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'session limit reached',
          message: `This practice session has reached the hard limit of ${MAX_SESSION_MESSAGES} messages to preserve usage limits. Please start a new session.`,
        }),
      };
    }

    // 3. Append user message to local history
    const now = new Date().toISOString();
    const userMsg: SessionMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: now,
    };
    const updatedMessages = [...session.messages, userMsg];

    // 4. Fetch scenario rules & system prompt from RulesTable
    const ruleRes = await docClient.send(
      new GetCommand({
        TableName: RULES_TABLE,
        Key: { scenarioType: session.scenarioType },
      })
    );

    const rule = ruleRes.Item as RuleRecord | undefined;
    let systemPrompt = 'You are a realistic roleplay character. Stay strictly in character at all times, respond naturally in 1-3 sentences, and match the difficulty level without breaking character or acting as a generic helpful AI.';
    
    if (rule?.systemPromptTemplate) {
      systemPrompt = rule.systemPromptTemplate;
      const diffInfo = rule.difficultyLevels?.find((d) => d.level === session.difficultyLevel);
      if (diffInfo) {
        systemPrompt += `\n\n[Active Difficulty Level: ${diffInfo.level}]\n${diffInfo.description}`;
      }
    }

    // 5. Build Bedrock Converse API payload
    // KNOWN LIMITATION: We truncate conversation history to the last 10 messages (5 exchanges)
    // and intentionally drop older messages without summarization to minimize input token costs.
    const recentMessages = updatedMessages.slice(-MAX_HISTORY_MESSAGES);

    // Bedrock Converse API expects role 'user' | 'assistant'
    const bedrockMessages: BedrockMessage[] = recentMessages.map((m) => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: [{ text: m.content }],
    }));

    // Bedrock Converse API requires the first message in the array to have role 'user'.
    if (bedrockMessages.length > 0 && bedrockMessages[0].role === 'assistant') {
      bedrockMessages.shift(); // Drop leading assistant turn to satisfy user-first requirement
    }

    const systemPromptBlocks: SystemContentBlock[] = [
      {
        text: systemPrompt,
      },
    ];

    let aiReplyText = '';
    try {
      const converseCmd = new ConverseCommand({
        modelId: BEDROCK_MODEL_ID,
        system: systemPromptBlocks,
        messages: bedrockMessages,
        inferenceConfig: {
          maxTokens: MAX_OUTPUT_TOKENS,
          temperature: 0.7,
        },
      });

      const bedrockResponse = await bedrockClient.send(converseCmd);

      // Log token usage to CloudWatch for visibility without needing AWS Cost Explorer
      const usage = bedrockResponse.usage;
      console.log(
        JSON.stringify({
          metric: 'BedrockTokenUsage',
          sessionId,
          scenarioType: session.scenarioType,
          modelId: BEDROCK_MODEL_ID,
          inputTokens: usage?.inputTokens || 0,
          outputTokens: usage?.outputTokens || 0,
          totalTokens: usage?.totalTokens || 0,
          timestamp: new Date().toISOString(),
        })
      );

      const outputMessage = bedrockResponse.output?.message;
      if (outputMessage?.content && outputMessage.content.length > 0) {
        aiReplyText = outputMessage.content
          .filter((c) => typeof c.text === 'string')
          .map((c) => c.text || '')
          .join('')
          .trim();
      }

      if (!aiReplyText) {
        aiReplyText = '...';
      }
    } catch (bedrockErr: any) {
      console.error('Bedrock Converse error:', bedrockErr);
      return {
        statusCode: 503,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'AI service temporarily unavailable',
          message: 'The conversation partner service is temporarily busy or unavailable. Please try again in a moment.',
        }),
      };
    }

    // 6. Append AI message to session and persist to DynamoDB
    const aiMsg: SessionMessage = {
      role: 'ai',
      content: aiReplyText,
      timestamp: new Date().toISOString(),
    };

    const finalSession: SessionRecord = {
      ...session,
      messages: [...updatedMessages, aiMsg],
      updatedAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: SESSIONS_TABLE,
        Item: finalSession,
      })
    );

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(finalSession),
    };
  } catch (error: any) {
    console.error('Unexpected error in send-message handler:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error', message: error.message }),
    };
  }
};
