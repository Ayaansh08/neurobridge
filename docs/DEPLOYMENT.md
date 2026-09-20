# Deployment Runbook

## 1. Frontend Build
Build the frontend using `.env.production` populated exclusively from the stack outputs.
```bash
npm ci
npm run lint
npm run build
```

## 2. Pre-zip Check
Check that the `dist/` folder contains exactly one API host (the expected API Gateway URL) and does **not** contain the word "localhost".

## 3. Zip the Build
Zip the CONTENTS of the `dist/` folder so that `index.html` is at the zip root (not nested inside a `dist/` folder).

## 4. AWS Amplify Upload
In the AWS Amplify console, open the app, navigate to the branch `production`, and upload the new zip file.

## 5. Single-Page-App Rewrite Rule
The single-page-app rewrite rule is stored in Amplify under **Hosting > Rewrites and redirects**:
- **Status:** 200
- **Target:** `/index.html`
- **Source:** The regular expression from AWS's "Redirects for single page web apps (SPA)" example at [https://docs.aws.amazon.com/amplify/latest/userguide/redirect-rewrite-examples.html](https://docs.aws.amazon.com/amplify/latest/userguide/redirect-rewrite-examples.html).
  
> **Note:** Do not paste the regex yourself; always refer to the AWS page. In the JSON editor, the backslash before the dot must be doubled (`\\.`), otherwise the editor reports "Bad escaped character". Make sure to add any file types your app serves that the example does not list.

## 6. Smoke-Test Checklist
After deploying, manually verify the following path:
- [ ] Sign up
- [ ] Practice
- [ ] Finish
- [ ] Summary
- [ ] Insights
- [ ] Progress
- [ ] Refresh the page on `/app/progress` to test deep linking

## 7. Backend Changes (AWS CDK)
- Run `npx cdk diff` **first**. 
- **STOP** on any replace or destroy of the Cognito user pool, a DynamoDB table, the S3 bucket, or the REST API. CDK does not ask for confirmation on replacements by default.
- Check that your shell resolves to the leader's AWS account (wrong-account guard).
- The seed command (`npm run seed`) overwrites the `RulesTable`. Run the dry run (`npm run seed:build && node backend/scripts/seed.cjs --dry-run`) and count first to verify safety.
