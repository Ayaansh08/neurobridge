import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { SessionRecord } from '../shared/types';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const bedrockClient = new BedrockRuntimeClient({
  maxAttempts: 2,
});

const SESSIONS_TABLE = process.env.SESSIONS_TABLE_NAME || '';
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'global.amazon.nova-2-lite-v1:0';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
};

export type DimensionRating = 'strong' | 'developing' | 'needs practice';

export interface FeedbackDimension {
  rating: DimensionRating;
  note: string;
}

export interface FeedbackEvaluation {
  dimensions: {
    clarity: FeedbackDimension;
    tone: FeedbackDimension;
    responsiveness: FeedbackDimension;
    composure: FeedbackDimension;
  };
  whatWentWell: string;
  tryImproving: string;
  encouragement: string;
}

const FALLBACK_EVALUATION: FeedbackEvaluation = {
  dimensions: {
    clarity: {
      rating: 'strong',
      note: 'Your responses were clear and easy to follow.',
    },
    tone: {
      rating: 'developing',
      note: 'A steady and professional tone helped anchor the exchange.',
    },
    responsiveness: {
      rating: 'strong',
      note: 'You actively engaged with the conversation points.',
    },
    composure: {
      rating: 'developing',
      note: 'You stayed involved throughout the rehearsal dialogue.',
    },
  },
  whatWentWell: 'You stepped into the scenario with clear intent and kept the conversation moving forward constructively. Your points were stated directly without hesitation.',
  tryImproving: 'Practice pausing before answering difficult pushback to give yourself space to formulate composed, collaborative responses.',
  encouragement: 'Every practice session strengthens your real-world communication reflexes—great job showing up.',
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
    const recentMessages = session.messages ? session.messages.slice(-10) : [];
    const transcript = recentMessages
      .map((msg) => `${msg.role === 'ai' ? 'AI' : 'User'}: ${msg.content}`)
      .join('\n');

    // 3. Formulate Prompt
    const systemPrompt = `You are an expert communication coach evaluating a user's roleplay conversation in a realistic social simulation.
Review the provided transcript. Evaluate the User's communication across 4 key dimensions.

Core Coaching Principles:
- Do not judge or shame the user. This is a judgment-free practice tool.
- Even if the user said something rude, hostile, or the conversation went poorly, frame feedback constructively — e.g., "Handling a rude or dismissive tone in a real scenario would end things quickly — this is exactly the kind of moment worth rehearsing a calmer response for" rather than "the user was disrespectful".
- Base ratings and notes on the actual transcript content, be specific to what the user said rather than generic advice.
- Absolutely NO numeric scores, NO percentages, and NO letter grades anywhere in the output.

Output exactly and only a valid JSON object matching this schema, with no markdown fences and no extra text:
{
  "dimensions": {
    "clarity": {
      "rating": "strong" | "developing" | "needs practice",
      "note": "<1 sentence, specific to what the user actually said>"
    },
    "tone": {
      "rating": "strong" | "developing" | "needs practice",
      "note": "<1 sentence on tone and interpersonal dynamic>"
    },
    "responsiveness": {
      "rating": "strong" | "developing" | "needs practice",
      "note": "<1 sentence on whether they addressed what the character said/asked>"
    },
    "composure": {
      "rating": "strong" | "developing" | "needs practice",
      "note": "<1 sentence on how they handled pressure, difficulty, or pushback>"
    }
  },
  "whatWentWell": "<2-3 sentences, specific and genuine, not generic praise>",
  "tryImproving": "<2-3 sentences, specific and actionable, framed as practice guidance not criticism>",
  "encouragement": "<1 short closing sentence, warm, forward-looking>"
}`;

    // 4. Invoke Bedrock via Converse API
    const converseCmd = new ConverseCommand({
      modelId: MODEL_ID,
      system: [{ text: systemPrompt }],
      messages: [
        {
          role: 'user',
          content: [{ text: `<transcript>\n${transcript || 'No messages recorded.'}\n</transcript>\nProvide the JSON evaluation.` }],
        },
      ],
      inferenceConfig: {
        maxTokens: 500,
        temperature: 0.2,
      },
    });

    const bedrockResponse = await bedrockClient.send(converseCmd);
    const outputMessage = bedrockResponse.output?.message;
    let aiResponseText = '';
    if (outputMessage?.content && outputMessage.content.length > 0) {
      aiResponseText = outputMessage.content
        .filter((c) => typeof c.text === 'string')
        .map((c) => c.text || '')
        .join('')
        .trim();
    }

    let evaluation: FeedbackEvaluation = FALLBACK_EVALUATION;
    try {
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.dimensions && parsed.whatWentWell && parsed.tryImproving && parsed.encouragement) {
          evaluation = parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse Bedrock response as JSON:', aiResponseText, e);
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
