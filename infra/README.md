# NeuroBridge Infrastructure (Phase 1)

AWS CDK v2 TypeScript infrastructure for the NeuroBridge Phase 1 stack.

## Prerequisites

Ensure you have installed:
- **Node.js**: v20.x or higher (tested on v22.x)
- **npm**: v10.x or higher
- **AWS CLI**: v2.x (configured with credentials having permissions to manage CloudFormation, IAM, Lambda, API Gateway, DynamoDB, Cognito, and S3 when deploying)
- **AWS CDK CLI**: v2.1142.0 or higher (`npm install -g aws-cdk` or use local `npx cdk`)

---

## Setup & Deployment Commands

Run all commands from within the `/infra` directory:

```bash
cd infra
```

### 1. Install Dependencies

Install required CDK libraries, TypeScript, and esbuild for Lambda bundling:

```bash
npm install
```

### 2. CDK Bootstrap

> **Note**: `cdk bootstrap` sets up the modern CDK bootstrap stack (Amazon S3 bucket and IAM roles) required by AWS CDK in your target AWS account and region to store deployment assets. **This requires real AWS credentials and should be run when you are ready to deploy to your AWS account.**

```bash
npx cdk bootstrap aws://<YOUR_AWS_ACCOUNT_ID>/ap-south-1
```

*(Or set `AWS_PROFILE` / AWS environment credentials and run `npx cdk bootstrap`)*

### 3. Local Synthesis Validation

Synthesize CloudFormation templates locally without deploying or connecting to AWS:

```bash
npx cdk synth
```

### 4. Deploy Stack

Deploy the stack to your configured AWS account:

```bash
npx cdk deploy
```

---

## Phase 1 Architecture & Design Decisions

- **Region**: `ap-south-1` (configurable via `CDK_DEFAULT_REGION` or `AWS_REGION`).
- **Cost Minimization**:
  - DynamoDB tables (`Sessions`, `RulesTable`, `Progress`) use on-demand billing (`PAY_PER_REQUEST`).
  - Lambda (`neurobridge-ping`) runs on ARM64 (Graviton) architecture with minimum 128MB memory. Kept outside VPC.
  - S3 asset bucket: unversioned, multipart upload abort rule after 7 days, SSE-S3 encryption.
  - API Gateway: REST API, no custom domain, caching disabled.
  - Resource Tagging: Stack-level tags `Project=NeuroBridge` and `Phase=1`.
- **Hackathon / Dev Mode**:
  - `RemovalPolicy.DESTROY` is configured on all stateful resources (DynamoDB and S3) for easy clean-up.
  - CORS on API Gateway is open to `*` for rapid frontend iteration (tighten before production).
- **Excluded in Phase 1**: Bedrock, Step Functions, EventBridge, voice functionality, VPC, WAF, custom domains.
