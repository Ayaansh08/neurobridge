# Tasks

_Single source of truth for work. Now / Next / Later / Done._

## 🔴 Now (before Sept 20 deadline)
- [ ] Deploy stack to AWS (`cdk deploy`)
- [ ] Seed scenario data (`npm run seed`)
- [ ] Record 3-minute demo video
- [ ] Test full flow end-to-end: sign up → pick scenario → practice → complete

## 🟡 Next
- [ ] Add Cognito authorizer to API Gateway (auth on backend)
- [ ] Send auth token from frontend in API calls
- [ ] Replace fake scoring with real AI-generated feedback
- [ ] Add seed data for `handle-conflict` scenario
- [ ] Add seed data for `group-conversation` scenario
- [ ] Add frontend cards for missing scenarios
- [ ] Connect DynamoDB `Progress` table to replace localStorage

## 🔵 Later
- [ ] Google OAuth via Cognito Hosted UI
- [ ] Tighten CORS to actual frontend domain
- [ ] Add session expiry / TTL to DynamoDB
- [ ] Persist auth tokens (refresh token flow)
- [ ] Set `autoDeleteObjects: true` on S3 bucket
- [ ] Remove orphaned `mockData.ts`
- [ ] Production error handling and loading states
- [ ] Personalized practice recommendations

## ✅ Done
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
