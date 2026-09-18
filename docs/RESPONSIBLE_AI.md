# Responsible AI & User Data

> **NeuroBridge is a practice tool, not therapy or professional advice.**

## What user data we store

| Data | Where | Who can see it |
|------|-------|----------------|
| Email + password hash | Cognito (AWS-managed) | Only AWS Cognito; we never see passwords |
| Session messages (practice conversations) | DynamoDB `Sessions` table | Anyone with AWS console access to the account |
| Scenario rules and prompts | DynamoDB `RulesTable` | Same |
| XP, streaks, session history | Browser localStorage | Only the user's own browser |
| Progress (planned) | DynamoDB `Progress` table | Not yet written to |

## Data retention
- DynamoDB has no automatic expiry configured. Sessions persist until manually deleted or the stack is destroyed.
- `RemovalPolicy.DESTROY` means `cdk destroy` deletes ALL data permanently.
- localStorage persists until the user clears browser data.

## Content guardrails
- AI characters stay in character and respond realistically to hostility (they push back, not accommodate).
- System prompts include explicit boundaries: characters may disengage but never become abusive or threatening.
- Hard session cap: 30 messages max per session (cost + safety guardrail).
- Output capped at 300 tokens per AI turn (prevents runaway responses).

## Privacy rules for developers
- **Never** log message contents or email addresses to console/CloudWatch.
- **Never** use real personal data in seeds, tests, or documentation.
- **Never** put secrets in `VITE_` environment variables (they're bundled into public browser code).

## Disclaimer
NeuroBridge is an educational practice tool for building communication confidence. It is **not** a substitute for therapy, counseling, or professional advice. Users should seek qualified professionals for mental health support.
