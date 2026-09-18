# Glossary

_Every technical term in this project, explained simply._

| Term | What it means |
|------|---------------|
| **API Gateway** | An AWS service that creates a public URL for your backend. Requests from the browser hit this URL, and it routes them to the right Lambda function. |
| **Bedrock** | AWS's service for using AI models (like Nova) without managing servers. You send text in, get AI text back. |
| **CDK (Cloud Development Kit)** | A tool that lets you define AWS infrastructure (databases, APIs, etc.) in TypeScript code instead of clicking through the AWS console. |
| **Cognito** | AWS's user authentication service. Handles sign-up, email verification, sign-in, and password rules so you don't build auth from scratch. |
| **CORS** | Cross-Origin Resource Sharing — a browser security rule. Our API says "allow requests from any website" (`*`) which is fine for dev but should be locked down for production. |
| **DynamoDB** | AWS's NoSQL database. Stores data as JSON-like items. We have three tables: Sessions, RulesTable, Progress. |
| **Lambda** | AWS's serverless compute. You upload a function, and AWS runs it only when someone calls it. You pay per call, not per hour. |
| **Nova 2 Lite** | Amazon's lightweight AI model on Bedrock. We use it for roleplay conversations because it's cheap and fast. |
| **Partition Key** | The main lookup key for a DynamoDB table. Like a primary key in a regular database. |
| **React Context** | A way to share data (like "is the user logged in?") across all components without passing it through every level. |
| **RemovalPolicy.DESTROY** | Tells CDK that when you delete the stack, delete the resource too (including its data). Opposite of RETAIN. |
| **S3** | AWS's file/object storage. We have a private bucket for future assets (not used yet). |
| **Scenario / ScenarioType** | A practice situation (e.g., `job-interview`, `set-boundary`). Each has AI prompts, difficulty levels, and opening lines. |
| **Seed data** | Pre-written scenario rules loaded into DynamoDB so the AI knows how to roleplay each scenario. |
| **Vite** | A fast build tool for frontend projects. Runs the dev server and bundles the app for production. |
| **VITE_ prefix** | Environment variables starting with `VITE_` get embedded into the browser bundle — so they're public. Never put secrets in them. |
| **Web Speech API** | A browser-built-in feature for speech-to-text (voice input) and text-to-speech (reading text aloud). No AWS cost. |
| **XP** | Experience points — a gamification number that goes up when you complete practice sessions. Tracked in localStorage. |
