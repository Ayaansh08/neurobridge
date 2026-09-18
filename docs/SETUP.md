# Setup Guide

_Copy-pasteable steps to run locally._

## Prerequisites
- Node.js 20+
- npm
- AWS CLI + CDK CLI (only for deploying)

## 1. Clone and install
```bash
git clone <repo-url>
cd neurobridge
npm install
```

## 2. Environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in values from CDK deploy output:
- `VITE_COGNITO_USER_POOL_ID` — from CDK output `CognitoUserPoolId`
- `VITE_COGNITO_APP_CLIENT_ID` — from CDK output `CognitoAppClientId`
- `VITE_API_GATEWAY_URL` — from CDK output `ApiGatewayInvokeUrl`
- `VITE_AWS_REGION` — already set to `ap-south-1`

## 3. Run locally
```bash
npm run dev
```
Open http://localhost:5173. Routes: `/login`, `/signup`, `/app`.

## 4. Lint and build
```bash
npm run lint    # Oxlint
npm run build   # TypeScript check + Vite production build
```

## 5. Deploy infrastructure (AWS — leader only)
```bash
cd infra
npm install
npx cdk synth       # preview what will be created
npx cdk deploy      # creates all AWS resources
```
Copy the 3 CDK outputs into your root `.env` file.

## 6. Seed scenario data (requires deployed stack)
```bash
npm run seed            # writes to DynamoDB RulesTable
npm run seed:build && node backend/scripts/seed.cjs --dry-run   # preview only
```

## 7. Destroy (deletes ALL data)
```bash
cd infra
npx cdk destroy
```
⚠️ This permanently deletes Cognito users, DynamoDB data, and the S3 bucket.
