# Decisions Log

_Date — decision — why — what else we considered._

| Date | Decision | Reason | Alternatives considered |
|------|----------|--------|------------------------|
| Pre-docs | Amazon Bedrock Nova 2 Lite for AI | Cheapest on Bedrock (~$0.06/1M input), good enough for short roleplay turns, available in ap-south-1 via global inference profile | Claude (more expensive), GPT (not on Bedrock), Nova Micro (less capable) |
| Pre-docs | In-memory auth tokens (no localStorage/cookies) | Avoids XSS token theft; acceptable for hackathon since page refresh = re-login | localStorage (XSS risk), httpOnly cookies (needs backend proxy) |
| Pre-docs | PAY_PER_REQUEST DynamoDB billing | Zero cost when idle, no capacity planning needed | Provisioned (cheaper at scale but costs when idle) |
| Pre-docs | RemovalPolicy.DESTROY on all stateful resources | Hackathon stack — easy cleanup, no orphaned resources | RETAIN (safer but leaves resources after `cdk destroy`) |
| Pre-docs | CORS open to all origins (`*`) | Dev speed during hackathon | Restrict to localhost + deployed domain (do before production) |
| Pre-docs | XP/progress in localStorage, not DynamoDB | Fast to build, no extra API calls | DynamoDB Progress table exists but unused — migrate later |
| 2026-09-18 | Keep `handle-conflict` and `group-conversation` as planned | Will implement seed data and frontend cards when time allows | Remove from types (cleaner but loses planned work) |
