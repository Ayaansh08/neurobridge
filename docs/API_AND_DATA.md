# API & Data Contract

_The agreement between frontend and backend. If you change a shape, update this doc and both sides._

## Endpoints

Base URL: `VITE_API_GATEWAY_URL` (from CDK output `ApiGatewayInvokeUrl`).
Auth: **None currently** (no Cognito authorizer — see KNOWN_ISSUES.md).

### POST /ping
Health check. No body required.
```json
// Response 200
{ "message": "pong" }
```

### POST /sessions
Create a new practice session.
```json
// Request body
{
  "userId": "user@example.com",
  "scenarioType": "job-interview",   // see ScenarioType enum below
  "difficultyLevel": 1               // positive integer
}
// Response 201
{
  "sessionId": "uuid",
  "userId": "user@example.com",
  "scenarioType": "job-interview",
  "difficultyLevel": 1,
  "messages": [{ "role": "ai", "content": "Hi there, welcome!...", "timestamp": "ISO" }],
  "status": "active",
  "createdAt": "ISO",
  "updatedAt": "ISO"
}
```

### GET /sessions/{sessionId}
Fetch an existing session.
```json
// Response 200 — same shape as SessionRecord above
// Response 404 — { "error": "Session not found for id ..." }
```

### POST /sessions/{sessionId}/messages
Send a user message, get AI reply. **This calls Bedrock.**
```json
// Request body
{ "message": "your text here" }
// Response 200 — full SessionRecord with appended user + ai messages
// Response 400 — session limit reached (30 messages)
// Response 503 — AI service temporarily unavailable
```

## ScenarioType Enum
`job-interview` | `talk-to-professor` | `meet-someone-new` | `phone-call` | `group-conversation` | `handle-conflict` | `ask-for-help` | `talk-to-manager` | `set-boundary`

## DynamoDB Tables

| Table | Partition Key | Purpose |
|-------|--------------|----------|
| Sessions | `sessionId` (String) | Stores each practice session: messages, scenario, difficulty, status |
| RulesTable | `scenarioType` (String) | AI system prompts, difficulty levels, and opening lines per scenario |
| Progress | `userId` (String) | User progress/XP (exists but not yet used — currently in localStorage) |

## Key Types (from `backend/lambdas/shared/types.ts`)

```typescript
interface SessionRecord {
  sessionId: string;
  userId: string;
  scenarioType: ScenarioType;
  difficultyLevel: number;
  messages: SessionMessage[];
  status: 'active' | 'completed';
  createdAt: string;  // ISO
  updatedAt: string;  // ISO
}

interface SessionMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;  // ISO
}

interface RuleRecord {
  scenarioType: ScenarioType;
  systemPromptTemplate: string;
  difficultyLevels: DifficultyLevel[];
}
```
