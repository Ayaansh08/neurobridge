# Demo Script (3-minute video)

_The judges see ONLY the video. No live demo._

## Before recording
1. Ensure stack is deployed and `VITE_API_GATEWAY_URL` is set in `.env`.
2. Run `npm run seed` to populate scenario data.
3. Create a test account (use a throwaway email, not a real one).
4. Do one test conversation to confirm Bedrock is responding.
5. Clear localStorage to reset XP/progress for a clean demo.

## Script (~3 minutes)

| Time | Show | Say |
|------|------|-----|
| 0:00–0:30 | Landing page → Sign up flow | "NeuroBridge lets you practice difficult conversations before they happen. Sign up, verify email, and you're in." |
| 0:30–1:00 | Dashboard with scenario cards | "Choose a scenario — job interview, setting boundaries, asking for a raise. Each has difficulty levels." |
| 1:00–2:00 | Live practice session (job interview) | "The AI stays in character as Taylor, a hiring manager. Watch how it responds naturally — and pushes back if I'm rude." Send 3–4 messages. |
| 2:00–2:20 | Complete session → score | "When you're done, you get a score and XP. Your progress tracks across sessions." |
| 2:20–2:50 | Architecture slide or code | "Built on AWS: Cognito for auth, API Gateway + Lambda for the backend, DynamoDB for data, and Bedrock Nova 2 Lite for AI — all serverless, all pay-per-use." |
| 2:50–3:00 | Wrap | "NeuroBridge: practice hard conversations so the real one goes better." |

## Fallback plan
- **If Bedrock is down:** Record the practice session in advance and splice it in.
- **If Cognito is down:** Skip sign-up, start from a pre-authenticated dashboard.
- **If everything is down:** Screen-record the local dev server with mock data.
