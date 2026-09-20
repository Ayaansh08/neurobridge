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
  summary: string;
  dimensions: {
    clarity: FeedbackDimension;
    tone: FeedbackDimension;
    responsiveness: FeedbackDimension;
    composure: FeedbackDimension;
  };
  whatWentWell: string;
  tryImproving: string;
  encouragement: string;
  fallback?: boolean;
}

const FALLBACK_EVALUATION: FeedbackEvaluation = {
  summary: 'We could not generate personalized feedback this time. You can try finishing the session again.',
  dimensions: {
    clarity: {
      rating: 'developing',
      note: 'Not enough information to rate this yet.',
    },
    tone: {
      rating: 'developing',
      note: 'Not enough information to rate this yet.',
    },
    responsiveness: {
      rating: 'developing',
      note: 'Not enough information to rate this yet.',
    },
    composure: {
      rating: 'developing',
      note: 'Not enough information to rate this yet.',
    },
  },
  whatWentWell: 'N/A',
  tryImproving: 'N/A',
  encouragement: 'N/A',
  fallback: true,
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
- Directly address the user as "you" in EVERY field, including the dimension notes (e.g., "You responded clearly when...").
- The summary must explicitly align and agree with the ratings given.
- Base EVERY rating and note on what the user actually wrote and be specific to it.
- "whatWentWell" MUST be based exclusively on the user's actual typed/spoken words. If the user typed gibberish or very little, be honest and kindly state that there wasn't enough to evaluate. Do NOT praise the AI partner's behavior as if it were the user's.
- Never rate a dimension "strong" if the user did not actually demonstrate that skill in the transcript.
- If the user input is gibberish or too short to assess, you MUST rate all dimensions as "needs practice" and explain that more input is needed.
- If the user was rude, hostile, or ended abruptly, frame it constructively as a moment worth rehearsing a calmer response for. NEVER say "the user was disrespectful or unprofessional".
- Do not judge or shame the user. This is a judgment-free practice tool.
- Never diagnose, pathologize, or label the user (e.g., no medical or psychological claims).
- Absolutely NO numeric scores, NO percentages, and NO letter grades anywhere in the output.

Output exactly and only a valid JSON object matching this schema, with no markdown fences and no extra text:
{
  "summary": "<2-3 sentences: warm, specific to what THIS user said, strengths first, one main thing to try next time. Must agree with the ratings.>",
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
  "whatWentWell": "<2-3 sentences, specific to the user's words. If gibberish/empty, honestly say so kindly.>",
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

    let evaluation: FeedbackEvaluation = FALLBACK_EVALUATION;
    try {
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

      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.summary && parsed.dimensions && parsed.whatWentWell && parsed.tryImproving && parsed.encouragement) {
          evaluation = parsed;
        }
      }
    } catch (error: any) {
      console.error('Bedrock error, timeout, or parsing failure:', error);
      // evaluation remains FALLBACK_EVALUATION
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
