# Tasks

_Single source of truth for work. Now / Next / Later / Done._

## Backend batch
- Run `cdk deploy neurobridge-stack --require-approval never` to apply the generate-feedback prompt fixes.

## Ã°Å¸â€Â´ Now (before Sept 20 deadline)
- [ ] Record 3-minute demo video
- [x] Test full flow end-to-end: sign up Ã¢â€ â€™ pick scenario Ã¢â€ â€™ practice Ã¢â€ â€™ complete

## Ã°Å¸Å¸Â¡ Next
_No critical tasks pending._

## Ã°Å¸â€Âµ Later
- [ ] Production error handling and loading states
- [ ] Tune AI Partner prompts based on real test sessions (Phase 4)

## Ã¢Å“â€šÃ¯Â¸Â Cut / post-hackathon
- `group-conversation` scenario: Focus purely on 1-on-1 conversations for the demo.
- Cognito authorizer + token sending: Not critical for the demo flow since the backend only runs practice data.
- Connect DynamoDB `Progress` table to replace localStorage: LocalStorage is sufficient for the short demo.
- Google OAuth via Cognito Hosted UI: Standard email/password works well enough for demo.
- Tighten CORS to actual frontend domain: Can be done before an actual production release.
- Persist auth tokens (refresh token flow): Hard reload drops state but isn't required for the golden path.
- Personalized practice recommendations: Out of scope for a 3-minute demo timeline.

## âœ… Done
- [x] Quiet Night UI redesign for First Commit "Best UI" prize track (charcoal foundation `#16151A`, muted plum `#A85C8C`, `Fraunces` serif headings)
- [x] Auth screens visual unification (subtle cards, password toggle, live password rule feedback, confirmation code step, disclaimer footer)
- [x] Practice view redesign (persona avatar badge, role metadata, goal banner, collapsible tips accordion, scenario switcher modal)
- [x] Conversational pacing delay integration (relaxed 1.2s, moderate 0.6s, instant 0s) with thinking indicator
- [x] Sensory Comfort mode panel & persistent data hooks (text size, high contrast, reduced motion)
- [x] Hand-drawn bespoke icons for all 7 rehearsal scenarios with WCAG AA compliant difficulty pills
- [x] Settings view rewrite with structured cards, pacing descriptions, comfort controls, and reset options
- [x] Multi-dimension qualitative coaching feedback (Clarity, Tone, Responsiveness, Composure) & UI redesign
- [x] Fix generate-feedback Bedrock IAM permissions and Converse API upgrade
- [x] Strengthen scenario system prompts (anti-genericization, hostile handling, few-shot examples) & reduce Bedrock temperature to 0.4
- [x] Fix send-message Bedrock IAM 503 (`AccessDeniedException`)
- [x] Deploy stack to AWS (`cdk deploy`)
- [x] Seed scenario data (`npm run seed`)
- [x] Replace fake scoring with real AI-generated feedback
- [x] Add session expiry / TTL to DynamoDB
- [x] Set `autoDeleteObjects: true` on S3 bucket
- [x] Add seed data for `handle-conflict` scenario and frontend card
- [x] Login loading state, plus error/loading polish
- [x] Remove orphaned `mockData.ts`
- [x] Cognito auth (sign up, verify, sign in, sign out)
- [x] Dashboard UI (scenarios, progress, settings)
- [x] Backend Lambda endpoints (ping, create-session, get-session, send-message, generate-feedback)
- [x] AI roleplay via Bedrock Nova 2 Lite
- [x] Frontend connected to backend API
- [x] Voice input/output (Web Speech API)
- [x] Scenario seed data (7 of 9 types)
- [x] XP/progress tracking (localStorage)
- [x] Cost guardrails (30 msg cap, 300 token output, 10 msg history window)
- [x] Documentation setup

## dY" Done
- [x] Added summary field to end-of-session qualitative feedback






