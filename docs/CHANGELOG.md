# Changelog

## 2026-09-19 - Merged origin/main and fixed frontend TS errors
- Merged latest updates from origin/main.
- Fixed TypeScript build errors in `ProgressView.tsx` and `userProgressService.ts` caused by the transition from numeric scores to qualitative feedback evaluations.
- Rebuilt `seed.cjs` auto-generated file.
## 2026-09-19 - Multi-dimension qualitative feedback redesign
- Replaced numeric score ("Score: X/10") with a 4-dimension qualitative breakdown (`clarity`, `tone`, `responsiveness`, `composure` with ratings `strong` | `developing` | `needs practice` and transcript-specific notes) in `backend/lambdas/generate-feedback/index.ts`.
- Structured feedback into "What Went Well", "Practice Focus", and a warm "Encouragement" closing sentence.
- Instructed Bedrock to provide constructive, non-judgmental coaching even on rude/hostile dialogue.
- Redesigned session completion UI in `PracticeView.tsx` with bespoke cards, badges, and neutral tone-shift colors matching the charcoal/plum aesthetic without judgmental red/green grading.

## 2026-09-19 - generate-feedback Bedrock IAM and Converse API upgrade
- Fixed `neurobridge-generate-feedback` Bedrock `AccessDeniedException` by adding `arn:aws:bedrock:::foundation-model/amazon.nova-2-lite-v1:0` to `GenerateFeedbackFunction`'s IAM policy in `neurobridge-stack.ts`.
- Upgraded `generate-feedback/index.ts` from `InvokeModelCommand` with raw JSON decoding to `ConverseCommand`, aligning it with `send-message/index.ts` and adding robust JSON parsing for the coach evaluation.

## 2026-09-19 - Scenario prompt strengthening & temperature tuning
- Strengthened system prompt templates in `seed-scenarios.ts` with anti-genericization preambles, persona-specific hostile reaction guidance, few-shot examples, and character reminders.
- Lowered Bedrock inference temperature to `0.4` in `send-message/index.ts`.

## 2026-09-19 - send-message Bedrock IAM fix
- Fixed `neurobridge-send-message` Bedrock access by adding the global Nova 2 Lite foundation-model ARN reported by CloudWatch to the Lambda IAM policy.
- Confirmed the deployed `BEDROCK_MODEL_ID` is `global.amazon.nova-2-lite-v1:0`; the 503 root cause was `AccessDeniedException`, not a stale model ID.

_Newest first. What changed and why._

## 2026-09-18 â€” Triage and mockData cleanup
- Implemented real AI feedback using Bedrock. Added `generate-feedback` Lambda and wired `PracticeView.tsx` to call it, replacing fake Math.random() scoring.
- Optional infrastructure cleanup: Added DynamoDB TTL (`expiresAt`) to Sessions table and enabled `autoDeleteObjects` on S3 bucket.
- Added `handle-conflict` scenario (Riley the stressed co-founder) to seed data and frontend dashboard.
- Polished login/signup UI: disabled inputs during network requests and verified loading spinner functionality.
- Removed orphaned `mockData.ts` and its exports to clear tech debt.
- Updated docs to reflect triage cuts for Sept 20 demo (cut group-conversation, Cognito authorizer, Google OAuth, Progress DB, etc.).

## 2026-09-18 â€” Documentation setup
- Created `docs/` folder with project docs, architecture, API contracts, setup guide, and agent rules.
- Added `AGENTS.md` with standing rules for AI pair-programming.

## Pre-docs (existing work)
- Cognito auth (sign up, verify, sign in, sign out) fully working.
- Dashboard UI with scenarios, practice view, progress, settings.
- Backend: 4 Lambda endpoints (ping, create-session, get-session, send-message).
- AI roleplay via Amazon Bedrock Nova 2 Lite with cost guardrails.
- Voice input/output via browser Web Speech API.
- Scenario seed data for 7 of 9 scenario types.
- XP/progress tracking in localStorage.

