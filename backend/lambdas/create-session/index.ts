import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { RuleRecord, ScenarioType, SessionRecord } from '../shared/types';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const RULES_TABLE = process.env.RULES_TABLE_NAME || '';
const SESSIONS_TABLE = process.env.SESSIONS_TABLE_NAME || '';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
};

const VALID_SCENARIOS: ScenarioType[] = [
  'job-interview',
  'talk-to-professor',
  'meet-someone-new',
  'phone-call',
  'group-conversation',
  'handle-conflict',
  'ask-for-help',
  'talk-to-manager',
  'set-boundary',
];

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const { userId, scenarioType, difficultyLevel } = JSON.parse(event.body);

    if (!userId || typeof userId !== 'string') {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Valid userId is required' }),
      };
    }

    if (!scenarioType || !VALID_SCENARIOS.includes(scenarioType as ScenarioType)) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: `Valid scenarioType is required. Must be one of: ${VALID_SCENARIOS.join(', ')}` }),
      };
    }

    const numericDifficulty = Number(difficultyLevel);
    if (isNaN(numericDifficulty) || numericDifficulty <= 0) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Valid positive difficultyLevel is required' }),
      };
    }

    // Lookup RulesTable for scenario rule and AI opening line
    const ruleResult = await docClient.send(
      new GetCommand({
        TableName: RULES_TABLE,
        Key: {
          scenarioType,
        },
      })
    );

    const rule = ruleResult.Item as RuleRecord | undefined;
    let aiOpeningLine = 'Hello! How can I help you today?';

    if (rule?.difficultyLevels && Array.isArray(rule.difficultyLevels)) {
      const match = rule.difficultyLevels.find((d) => d.level === numericDifficulty);
      if (match?.aiOpeningLine) {
        aiOpeningLine = match.aiOpeningLine;
      } else if (rule.difficultyLevels[0]?.aiOpeningLine) {
        aiOpeningLine = rule.difficultyLevels[0].aiOpeningLine;
      }
    }

    const now = new Date().toISOString();
    const sessionId = randomUUID();
    const expiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours TTL

    const newSession: SessionRecord = {
      sessionId,
      userId,
      scenarioType,
      difficultyLevel: numericDifficulty,
      messages: [
        {
          role: 'ai',
          content: aiOpeningLine,
          timestamp: now,
        },
      ],
      status: 'active',
      createdAt: now,
      updatedAt: now,
      expiresAt,
    };

    // Save new session to Sessions table
    await docClient.send(
      new PutCommand({
        TableName: SESSIONS_TABLE,
        Item: newSession,
      })
    );

    return {
      statusCode: 201,
      headers: CORS_HEADERS,
      body: JSON.stringify(newSession),
    };
  } catch (error: any) {
    console.error('Error creating session:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error', message: error.message }),
    };
  }
};
