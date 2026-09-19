## [Unreleased]
### Added
- Practice sessions are now auto-saved and restored upon browser refresh, preventing data loss.
- Sessions finished or disconnected correctly reset the active session state.
### Changed
- Redesigned the Scenarios 'Recommended' card into a compact top banner with a primary call to action.
- Adjusted Scenarios list layout to display as a balanced two-column grid on wide screens.
- Sidebar 'Practice' tab now only appears when an active session is in progress.

## [Unreleased]
### Fixed
- Recomputed Streak and XP tracking using strict local calendar dates.
- Re-wired SettingsView to link to Comfort modal properly.
### Removed
- Removed fake AI Response Length and Coaching Tone settings that were non-functional.
### Changed
- Dashboard stats section is now hidden until a user finishes their first session.
- Re-routed last session row in Dashboard to link directly to Progress view.

# Changelog

## 2026-09-19 - "Quiet Night" UI Redesign
- **Auth Screens**: Removed disabled Google button for cleaner UI.
- **Distinctive UI**: Added soft gradient tokens, unified card border radii to a single scale, and implemented a CSS 3D tilted hero card on the desktop dashboard. for Hackathon UI Prize Track
- **Design System**: Established "Quiet Night" foundation with warm charcoal `#16151A`, subtle elevated surfaces `#1F1E24`/`#232228`, jewel-tone plum `#A85C8C`, sage green `#6E9B7D`/`#79D193`, and editorial `Fraunces` serif headings.
- **Auth Screens**: Unified `LoginPage.tsx` and `SignupPage.tsx` into subtle card layouts with logo mark, wordmark, accessible password show/hide toggle, live password rule feedback (8+ chars, numbers, uppercase), 6-digit confirmation step, and required medical disclaimer footer ("NeuroBridge is a practice tool, not a clinical therapy service").
- **Aurora Background**: Shifted WebGL Aurora to warm muted plum tones (`['#18121D', '#3D1C34', '#7A3D63']`) with reduced-motion fallbacks and WebGL context safety.
- **Practice View**:
  - Persona header badge with character initials, character name & professional role (e.g., "Taylor Â· Engineering Hiring Manager").
  - "Your Goal" focus prompt and collapsible "Scenario Tips & Guidance" accordion.
  - Scenario switcher modal replacing raw `<select>` dropdown.
  - Conversational pacing delay (relaxed 1.2s, moderate 0.6s, instant 0s) integrated into message delivery with "{Character} is thinking..." indicator.
  - Session turn counter ("Turn X of 30").
  - Confirmation dialog on "Finish and get feedback" to prevent accidental early session termination.
  - Complete Rehearsal Insights breakdown with 4 dimension cards (Clarity, Tone, Responsiveness, Composure) and executive summary.
- **Sensory Comfort Mode**: Added floating/sidebar-accessible `ComfortPanel` and `settingsService` with persistent `data-text-size="large"`, `data-contrast="high"`, and `data-motion="reduced"` attributes applied directly to `<html>`.
- **Scenario Cards & Icons**: Hand-drawn bespoke SVG icons for all 7 scenarios with 2-line title wrapping and WCAG AA compliant difficulty badge contrast.
- **Settings View**: Redesigned with grouped cards, conversational pacing explanations, AI response length toggles, coaching tone options, accessibility toggles, and default reset.

## 2026-09-19 - Add Executive Summary to feedback
- Added a summary field (max 50 words) to FeedbackEvaluation to provide a concise, high-level overview of the user's practice session.
- Updated Bedrock prompt to generate the summary, enforcing non-medical and judgment-free constraints.
- Updated PracticeView.tsx to display the 'Executive Summary' at the top of the insights screen.
- Added graceful fallbacks for legacy sessions missing the summary field.
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

## 2026-09-18 Ã¢â‚¬â€ Triage and mockData cleanup
- Implemented real AI feedback using Bedrock. Added `generate-feedback` Lambda and wired `PracticeView.tsx` to call it, replacing fake Math.random() scoring.
- Optional infrastructure cleanup: Added DynamoDB TTL (`expiresAt`) to Sessions table and enabled `autoDeleteObjects` on S3 bucket.
- Added `handle-conflict` scenario (Riley the stressed co-founder) to seed data and frontend dashboard.
- Polished login/signup UI: disabled inputs during network requests and verified loading spinner functionality.
- Removed orphaned `mockData.ts` and its exports to clear tech debt.
- Updated docs to reflect triage cuts for Sept 20 demo (cut group-conversation, Cognito authorizer, Google OAuth, Progress DB, etc.).

## 2026-09-18 Ã¢â‚¬â€ Documentation setup
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





