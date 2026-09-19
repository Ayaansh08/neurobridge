# Known Issues

These are P2 issues triaged from the Phase 1 Bug Hunt, logged here to keep the demo path prioritized.

## Architecture & Safety
- **No React Error Boundary**: Unhandled render errors will crash to a white screen instead of a safe fallback UI.
- **LocalStorage Corruption**: If the progress JSON in localStorage gets corrupted, it silently drops all progress on parse.
- **PII in Console Logs**: Some console.error calls log raw error objects that might contain user emails or message content. Should move to a scrubbed structured logger.
- **Large JS Bundle**: Main chunk exceeds 500kB. Need to implement React.lazy + Suspense for code-splitting (e.g. PracticeView).

## User Experience (Edge Cases)
- **503 Retry UI**: If Bedrock hits a 503 capacity limit, the frontend shows an error but lacks an automatic exponential backoff retry flow.
- **Web Speech API Transcripts**: Interim vs Final voice transcripts are visually identical in the input field, which can confuse users watching it transcribe in real time.
- **Accessibility**: Animations (like the Aurora background) do not respect the @media (prefers-reduced-motion) OS preference.
