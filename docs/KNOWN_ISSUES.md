# Known Issues & Tech Debt

_Bugs, shortcuts, and things to fix._

## Security / Auth
- **No API auth:** API Gateway has no Cognito authorizer. Anyone with the URL can create sessions. Frontend doesn't send auth tokens. Fix before production.
- **In-memory tokens:** Refreshing the page logs you out. Acceptable for hackathon.
- **CORS open to `*`:** Fine for dev, restrict to actual domain before production.

## Data
- **Progress is client-only:** XP, streaks, levels live in localStorage. The DynamoDB `Progress` table exists but nothing reads/writes it.

## Scenarios
- All current scenarios have seed data and frontend cards.

## Frontend
- **`VITE_API_GATEWAY_URL` must be set:** Practice view shows an error banner if missing. No graceful offline/demo mode.

## Infrastructure
- All CDK resources are fully configured for `RemovalPolicy.DESTROY`.
