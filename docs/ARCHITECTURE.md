# Architecture

_How the pieces connect. BUILT = working today. PLANNED = not yet implemented._

## System Diagram

```mermaid
flowchart LR
    User --> Frontend["React + Vite (localhost:5173)"]
    Frontend -->|sign up / sign in| Cognito["Amazon Cognito"]
    Frontend -->|POST /sessions, GET, POST messages, POST feedback| APIGW["API Gateway (REST)"]
    APIGW --> Ping["ping Lambda"]
    APIGW --> CreateSession["create-session Lambda"]
    APIGW --> GetSession["get-session Lambda"]
    APIGW --> SendMessage["send-message Lambda"]
    APIGW --> GenerateFeedback["generate-feedback Lambda"]
    CreateSession -->|GetItem| RulesTable["DynamoDB: RulesTable"]
    CreateSession -->|PutItem| Sessions["DynamoDB: Sessions"]
    GetSession -->|GetItem| Sessions
    SendMessage -->|Get/PutItem| Sessions
    SendMessage -->|GetItem| RulesTable
    SendMessage -->|Converse API| Bedrock["Bedrock: Nova 2 Lite"]
    GenerateFeedback -->|Get/PutItem| Sessions
    GenerateFeedback -->|Converse API| Bedrock
    CDK["AWS CDK v2"] -.->|defines| Cognito & APIGW & Sessions & RulesTable & Progress & S3

    style Bedrock fill:#f9f,stroke:#333
    style Cognito fill:#bbf,stroke:#333
```

## Components

| Component | Tech | Status |
|-----------|------|--------|
| Frontend SPA | React 19 + TypeScript + Vite | ✅ BUILT |
| Auth | Cognito (email/password, USER_PASSWORD_AUTH) | ✅ BUILT |
| API | API Gateway REST, 5 routes | ✅ BUILT |
| Session logic | 3 Node.js 20 Lambdas (ARM64, 128MB) | ✅ BUILT |
| AI roleplay | Bedrock Converse API, Nova 2 Lite, 256MB Lambda | ✅ BUILT |
| AI feedback | Bedrock Converse API, Multi-dimensional coaching, 256MB Lambda | ✅ BUILT |
| Data | DynamoDB (Sessions with TTL, RulesTable) | ✅ BUILT |
| Progress data | DynamoDB Progress table | PLANNED (exists, unused) |
| Progress tracking | localStorage XP/streaks (+100 XP per completion) | ✅ BUILT (client-only) |
| Voice I/O | Browser Web Speech API | ✅ BUILT |
| Assets bucket | S3 (private, encrypted, autoDeleteObjects) | ✅ BUILT (empty) |
| API auth | Cognito authorizer on API Gateway | PLANNED |
| Google OAuth | Cognito Hosted UI | PLANNED |
| Scenario UI | Difficulty picker in frontend | ✅ BUILT |

## Data Flow
1. User signs up/in → Cognito returns JWT tokens → stored in React state (memory only).
2. User picks a scenario → frontend calls `POST /sessions` → Lambda looks up rules from RulesTable, creates session with AI opening line in Sessions table.
3. User types or speaks a message → frontend calls `POST /sessions/{id}/messages` → Lambda fetches session + rules, sends last 10 messages to Bedrock via Converse API, appends AI reply, saves to Sessions.
4. User clicks "Complete & Save" → frontend calls `POST /sessions/{id}/feedback` → Lambda analyzes transcript via Bedrock Converse API, returns structured 4-dimension qualitative breakdown (Clarity, Tone, Responsiveness, Composure) with specific guidance, marks session completed, and records completion XP in localStorage.
