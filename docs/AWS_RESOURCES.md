# AWS Resources

_What's in the stack, what it costs, and how to clean up._

## Account & Region
- **AWS Account:** 993191529588 (new AWS experience, social provider signup)
- **Region:** `ap-south-1` (Mumbai)
- **Stack name:** `NeuroBridgeStack`
- **Profile:** `vermagaurav23`

## Resources Created by CDK

| Resource | Name / ID | Purpose |
|----------|-----------|---------|
| Cognito User Pool | `NeuroBridgeUsers` | User authentication |
| Cognito App Client | `NeuroBridgeAppClient` | Frontend auth (no client secret, USER_PASSWORD_AUTH) |
| API Gateway REST API | `NeuroBridge API` | 4 routes: ping, sessions CRUD, messages |
| Lambda: ping | `neurobridge-ping` | Health check (128MB, ARM64) |
| Lambda: create-session | `neurobridge-create-session` | Creates sessions (128MB, ARM64) |
| Lambda: get-session | `neurobridge-get-session` | Fetches sessions (128MB, ARM64) |
| Lambda: send-message | `neurobridge-send-message` | AI roleplay via Bedrock (256MB, ARM64) |
| DynamoDB: Sessions | Partition key: `sessionId` | Practice session data |
| DynamoDB: RulesTable | Partition key: `scenarioType` | AI prompts and difficulty levels |
| DynamoDB: Progress | Partition key: `userId` | User progress (not yet used) |
| S3 Bucket | auto-named | Private assets bucket (empty) |

## CDK Output → Env Var Mapping

| CDK Output | Env Variable | Used by |
|------------|-------------|---------|
| `CognitoUserPoolId` | `VITE_COGNITO_USER_POOL_ID` | Frontend auth |
| `CognitoAppClientId` | `VITE_COGNITO_APP_CLIENT_ID` | Frontend auth |
| `ApiGatewayInvokeUrl` | `VITE_API_GATEWAY_URL` | Frontend API calls |
| `S3BucketName` | _(not used yet)_ | — |

## Estimated Cost
All resources are **serverless / pay-per-request**. At hackathon usage levels:
- **DynamoDB:** Free tier covers 25 read/write units. Effectively $0.
- **Lambda:** Free tier covers 1M requests/month. Effectively $0.
- **API Gateway:** Free tier covers 1M calls/month for 12 months. Effectively $0.
- **Bedrock Nova 2 Lite:** ~$0.06/1M input tokens, ~$0.24/1M output tokens. A full 30-message session costs < $0.01.
- **Cognito:** Free for first 50,000 monthly active users.
- **S3:** Empty bucket, $0.
- **Total estimate for hackathon:** Under $1.

## Cleanup
```bash
cd infra
npx cdk destroy
```
⚠️ `RemovalPolicy.DESTROY` is set on ALL stateful resources. This **permanently deletes** Cognito users, all DynamoDB data, and the S3 bucket.

## Tags
All resources tagged: `Project=NeuroBridge`, `Phase=1`.
