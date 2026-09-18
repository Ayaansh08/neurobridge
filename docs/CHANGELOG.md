# Changelog

_Newest first. What changed and why._

## 2026-09-18 — Triage and mockData cleanup
- Added `handle-conflict` scenario (Riley the stressed co-founder) to seed data and frontend dashboard.
- Polished login/signup UI: disabled inputs during network requests and verified loading spinner functionality.
- Removed orphaned `mockData.ts` and its exports to clear tech debt.
- Updated docs to reflect triage cuts for Sept 20 demo (cut group-conversation, Cognito authorizer, Google OAuth, Progress DB, etc.).

## 2026-09-18 — Documentation setup
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
