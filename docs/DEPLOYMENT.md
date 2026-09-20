# Deployment Runbook

## 1. Get changes onto GitHub main
```
cd C:\neurobridge
git status
npm run lint
npm run build
git add <the files you changed>
git commit -m "fix: short description"
git fetch origin
git merge origin/main
npm run lint
npm run build
git push origin HEAD:main
```
- Stage named files, not `git add .`, so `.env` files, zips and scratch folders never get in.
- The merge and second build catch teammates' changes before they reach `main`.
- If the push is rejected, fetch and merge again. Never use `--force`.
- If `main` is protected or you get a 403, run `git push origin HEAD` and open a pull request on the GitHub website.

## 2. Decide what to deploy
| What you changed | What to do |
|---|---|
| `src/`, `public/`, `index.html` | Frontend (3A) |
| `backend/lambdas/`, `infra/` | Backend (3B) |
| Scenario prompts (`seed-scenarios.ts`) | Seed (3B) |
| Docs only | Push only |

If a frontend change needs a backend change, deploy the backend first, check it works, then the frontend.

## 3A. Frontend
```
cd C:\neurobridge
npm run build
Select-String -Path .\dist\assets\*.js -Pattern "[a-z0-9]+\.execute-api\.[a-z0-9-]+\.amazonaws\.com" -AllMatches | ForEach-Object { $_.Matches.Value } | Sort-Object -Unique
Select-String -Path .\dist\assets\*.js -Pattern "localhost" -List
git rev-parse --short HEAD
```
- Expect exactly one API address (`39tk0hqx2a...`) and no `localhost` output. Note the commit hash.
- `.env.production` must exist. It is gitignored and never committed. On a new machine, recreate it from the stack outputs: `aws cloudformation describe-stacks --stack-name NeuroBridgeStack --region ap-south-1 --profile neurobridge-deploy --query "Stacks[0].Outputs"`.
- Open `dist`, press Ctrl+A, right-click, Send to, Compressed folder. Name it `neurobridge-<hash>.zip`. `index.html` must be visible at the top of the zip.
- Open the Amplify console (region Mumbai), then the app `neurobridge`, then the branch `production`. Upload the new zip using the deploy/upload button on that page. Labels change over time, so tell me if you can't find it.
- Test in a private window with Ctrl+F5, then refresh on `/app/progress`. The refresh rule lives in Amplify and stays in place between uploads.

## 3B. Backend
```
cd C:\neurobridge\infra
$env:AWS_ACCESS_KEY_ID = $null; $env:AWS_SECRET_ACCESS_KEY = $null; $env:AWS_SESSION_TOKEN = $null
aws sts get-caller-identity --profile neurobridge-deploy
npx cdk diff --profile neurobridge-deploy --region ap-south-1
```
- The account in `get-caller-identity` must end in 7948, the leader's account, not your own.
- **Fine in the diff:** `[~]` lines on Lambda code (`S3Key`), or small permission or environment changes.
- **Stop and paste it to me:** `[-]`, "replace" or "destroy" next to the Cognito user pool, a DynamoDB table, the S3 bucket or the REST API, or every resource shown as `[+]`. CDK does not ask for confirmation before replacing a table, so your reading of the diff is the safety check.
- If the diff is clean, run `npx cdk deploy --profile neurobridge-deploy --region ap-south-1`. Success is `✅ NeuroBridgeStack` plus the outputs. If you see `ROLLBACK`, copy the error and stop.
- Then run `curl.exe -i -X POST https://39tk0hqx2a.execute-api.ap-south-1.amazonaws.com/prod/ping`. You want `200`.
- **Seed:** only if scenario prompts changed. Dry-run first with `npm run seed:build`, then `node backend/scripts/seed.cjs --dry-run`. The real seed overwrites the whole RulesTable, and needs `$env:AWS_PROFILE="neurobridge-deploy"` and `$env:AWS_REGION="ap-south-1"` set.

## 4. Verify and record
- On the live URL, run the full path: sign up, practice, finish, insights, progress, and a refresh on Progress.
- Write the deployed commit hash and date into `docs/AWS_RESOURCES.md`. No keys and no account ID.
- Tag it: `git tag -a live-YYYYMMDD-<hash> <hash> -m "Live"`, then `git push origin <tag-name>`. Don't move or delete `known-good`.

## Rollback
- **Frontend:** upload the previous zip. Keep the last 2 or 3.
- **Backend:** check out the last good commit on a temporary branch, run `cdk diff`, then `cdk deploy`. CloudFormation restores the old version if a deploy fails midway. A replaced table or user pool cannot be brought back.

## Rules to keep
- One deployer at a time, and tell the leader before each deploy.
- No `--force` pushes, and no `cdk destroy` until results are announced.
- Never commit `.env.production`, zips or keys.
- Near the deadline, make your last deploy well before the cutoff, run the full smoke test after it, and keep the last good zip ready.

I can also put this in a `.md` file for `docs/DEPLOYMENT.md`. Give me the submission cutoff and I'll help you set a freeze time.
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
