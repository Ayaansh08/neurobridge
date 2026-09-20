# Known Issues

These are P2 issues triaged from the Phase 1 Bug Hunt, logged here to keep the demo path prioritized.

## Architecture & Safety
- **No API Authorizer**: The API Gateway methods have no authorizer attached (`infra/lib/neurobridge-stack.ts`, lines 299-346).
- **CORS Allow-All**: API Gateway is configured with `allowOrigins: apigateway.Cors.ALL_ORIGINS` (`infra/lib/neurobridge-stack.ts`, line 285), and Lambda endpoints return `Access-Control-Allow-Origin: '*'` (e.g., `backend/lambdas/ping/index.ts`, line 4).
- **No API Throttling**: There is no throttling limit or usage plan configured on the API stage (`infra/lib/neurobridge-stack.ts`, lines 276-291).
- **Stateful Resource Deletion**: The `RemovalPolicy` on Cognito User Pool, DynamoDB tables, and S3 Bucket is set to `DESTROY` (`infra/lib/neurobridge-stack.ts`, lines 63, 67, 86).
- **Cognito Default Email**: Cognito uses its default email sender, which is subject to a strict daily sending cap (`infra/lib/neurobridge-stack.ts`, line 61).
- **Client-Side Progress Storage**: Progress, XP, display names, and the unfinished sessions list are stored entirely in the browser's `localStorage` (`src/services/userProgressService.ts`, lines 16, 98).
- **In-Memory Login Tokens**: Authentication tokens live only in application memory and are not persisted (`src/services/authService.ts`, line 72).
- **Feedback Fallback**: If Bedrock fails or times out, the backend returns a fallback evaluation with "Not rated" dimensions, and the frontend gracefully handles it without awarding XP (`backend/lambdas/generate-feedback/index.ts`, line 149; `src/components/dashboard/PracticeView.tsx`, line 538).
- **No React Error Boundary**: Unhandled render errors will crash to a white screen instead of a safe fallback UI.
- **LocalStorage Corruption**: If the progress JSON in localStorage gets corrupted, it silently drops all progress on parse.
- **PII in Console Logs**: Some console.error calls log raw error objects that might contain user emails or message content. Should move to a scrubbed structured logger.
- **Large JS Bundle**: Main chunk exceeds 500kB. Need to implement React.lazy + Suspense for code-splitting (e.g. PracticeView).

## User Experience (Edge Cases)
- **503 Retry UI**: If Bedrock hits a 503 capacity limit, the frontend shows an error but lacks an automatic exponential backoff retry flow.
- **Web Speech API Transcripts**: Interim vs Final voice transcripts are visually identical in the input field, which can confuse users watching it transcribe in real time.
- **Accessibility**: Animations (like the Aurora background) do not respect the @media (prefers-reduced-motion) OS preference.
