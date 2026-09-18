import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { SessionRecord } from '../shared/types';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'ap-south-1',
});

const SESSIONS_TABLE = process.env.SESSIONS_TABLE_NAME || '';
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'global.amazon.nova-2-lite-v1:0';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
};

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  try {
    const sessionId = event.pathParameters?.sessionId;
    if (!sessionId) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'sessionId is required' }) };
    }

    // 1. Fetch Session
    const sessionResult = await docClient.send(
      new GetCommand({
        TableName: SESSIONS_TABLE,
        Key: { sessionId },
      })
    );

    const session = sessionResult.Item as SessionRecord | undefined;
    if (!session) {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Session not found' }) };
    }

    // 2. Extract last 10 messages for context
    const recentMessages = session.messages.slice(-10);
    const transcript = recentMessages
      .map((msg) => `${msg.role === 'ai' ? 'AI' : 'User'}: ${msg.content}`)
      .join('\n');

    // 3. Formulate Prompt
    const systemPrompt = `You are an expert communication coach evaluating a user's roleplay conversation.
Review the provided transcript. Evaluate the User's tone, pacing, professionalism, and ability to handle the scenario.
Output exactly and only a JSON object with this schema, no markdown, no other text:
{
  "score": <numeric score from 0.0 to 10.0, higher is better>,
  "feedback": "<2 sentences max actionable feedback>"
}`;

    const payload = {
      system: [{ text: systemPrompt }],
      messages: [
        {
          role: 'user',
          content: [{ text: `<transcript>\n${transcript}\n</transcript>\nProvide the JSON evaluation.` }],
        },
      ],
      inferenceConfig: {
        maxTokens: 300,
        temperature: 0.2,
      },
    };

    // 4. Invoke Bedrock
    const invokeCommand = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(invokeCommand);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    let aiResponseText = responseBody.output?.message?.content?.[0]?.text || '{}';
    
    // Attempt to clean markdown if present
    aiResponseText = aiResponseText.replace(/^```json\n/, '').replace(/\n```$/, '').trim();

    let evaluation = { score: 8.0, feedback: "Good effort, but try to be more specific in your responses." };
    try {
      evaluation = JSON.parse(aiResponseText);
    } catch (e) {
      console.error('Failed to parse Bedrock response as JSON:', aiResponseText);
    }

    // 5. Update Session Status
    session.status = 'completed';
    session.updatedAt = new Date().toISOString();
    
    await docClient.send(
      new PutCommand({
        TableName: SESSIONS_TABLE,
        Item: session,
      })
    );

    // 6. Return Evaluation
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(evaluation),
    };
  } catch (error: any) {
    console.error('Error generating feedback:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error', message: error.message }),
    };
  }
};
