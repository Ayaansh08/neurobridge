# Tasks

_Single source of truth for work. Now / Next / Later / Done._

## 🔴 Now (before Sept 20 deadline)
- [ ] Deploy stack to AWS (`cdk deploy`)
- [ ] Seed scenario data (`npm run seed`)
- [ ] Record 3-minute demo video
- [ ] Test full flow end-to-end: sign up → pick scenario → practice → complete

## 🟡 Next
- [ ] Login loading state, plus error/loading polish
- [ ] Add seed data for `handle-conflict` scenario and frontend card
- [ ] Replace fake scoring with real AI-generated feedback

## 🔵 Later
- [ ] Add session expiry / TTL to DynamoDB
- [ ] Set `autoDeleteObjects: true` on S3 bucket
- [ ] Production error handling and loading states

## ✂️ Cut / post-hackathon
- `group-conversation` scenario: Focus purely on 1-on-1 conversations for the demo.
- Cognito authorizer + token sending: Not critical for the demo flow since the backend only runs practice data.
- Connect DynamoDB `Progress` table to replace localStorage: LocalStorage is sufficient for the short demo.
- Google OAuth via Cognito Hosted UI: Standard email/password works well enough for demo.
- Tighten CORS to actual frontend domain: Can be done before an actual production release.
- Persist auth tokens (refresh token flow): Hard reload drops state but isn't required for the golden path.
- Personalized practice recommendations: Out of scope for a 3-minute demo timeline.

## ✅ Done
- [x] Remove orphaned `mockData.ts`
- [x] Cognito auth (sign up, verify, sign in, sign out)
- [x] Dashboard UI (scenarios, progress, settings)
- [x] Backend Lambda endpoints (ping, create-session, get-session, send-message)
- [x] AI roleplay via Bedrock Nova 2 Lite
- [x] Frontend connected to backend API
- [x] Voice input/output (Web Speech API)
- [x] Scenario seed data (7 of 9 types)
- [x] XP/progress tracking (localStorage)
- [x] Cost guardrails (30 msg cap, 300 token output, 10 msg history window)
- [x] Documentation setup
