# Known Issues & Tech Debt

_Bugs, shortcuts, and things to fix._

## Security / Auth
- **No API auth:** API Gateway has no Cognito authorizer. Anyone with the URL can create sessions. Frontend doesn't send auth tokens. Fix before production.
- **In-memory tokens:** Refreshing the page logs you out. Acceptable for hackathon.
- **CORS open to `*`:** Fine for dev, restrict to actual domain before production.

## Data
- **Progress is client-only:** XP, streaks, levels live in localStorage. The DynamoDB `Progress` table exists but nothing reads/writes it.
- **Fake scoring:** `handleFinishPractice()` generates a random score (7.8–10.0). No real conversation analysis.
- **No session expiry:** DynamoDB sessions persist forever until stack is destroyed.

## Scenarios
- **2 scenarios have no seed data:** `handle-conflict` and `group-conversation` are valid types in code but have no rules in `seed-scenarios.ts` and no frontend cards. Creating a session with them falls back to a generic opening.
- **`mockData.ts` is orphaned:** Dashboard now uses real `userProgressService` + API calls. Mock file is unused.

## Frontend
- **`VITE_API_GATEWAY_URL` must be set:** Practice view shows an error banner if missing. No graceful offline/demo mode.
- **No loading state on auth:** Login button doesn't show a spinner during Cognito round-trip.

## Infrastructure
- **`autoDeleteObjects: false`** on S3 bucket: `cdk destroy` will fail if objects are ever uploaded. Change to `true` before uploading anything.
