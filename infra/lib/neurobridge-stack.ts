import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class NeuroBridgeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // =========================================================================
    // Cost & Dev note: RemovalPolicy.DESTROY is set across stateful resources
    // (DynamoDB tables and S3 bucket) because this is a Phase 1 hackathon/dev stack.
    // =========================================================================

    // -------------------------------------------------------------------------
    // 1. Cognito User Pool & App Client
    // -------------------------------------------------------------------------
    const userPool = new cognito.UserPool(this, 'NeuroBridgeUsers', {
      userPoolName: 'NeuroBridgeUsers',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: false,
      },
      mfa: cognito.Mfa.OFF, // Dev-speed: No MFA for Phase 1
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'NeuroBridgeAppClient', {
      userPool,
      userPoolClientName: 'NeuroBridgeAppClient',
      generateSecret: false, // Public SPA client: no client secret
      authFlows: {
        userPassword: true, // USER_PASSWORD_AUTH flow enabled
      },
    });

    // -------------------------------------------------------------------------
    // 2. DynamoDB Tables (All PAY_PER_REQUEST / on-demand for cost minimization)
    // -------------------------------------------------------------------------
    const sessionsTable = new dynamodb.Table(this, 'SessionsTable', {
      tableName: 'Sessions',
      partitionKey: {
        name: 'sessionId',
        type: dynamodb.AttributeType.STRING,
      },
      timeToLiveAttribute: 'expiresAt',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Phase 1 dev choice
    });

    const rulesTable = new dynamodb.Table(this, 'RulesTable', {
      tableName: 'RulesTable',
      partitionKey: {
        name: 'scenarioType',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Phase 1 dev choice
    });

    const progressTable = new dynamodb.Table(this, 'ProgressTable', {
      tableName: 'Progress',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Phase 1 dev choice
    });

    // -------------------------------------------------------------------------
    // 3. S3 Bucket
    // -------------------------------------------------------------------------
    const assetsBucket = new s3.Bucket(this, 'NeuroBridgeAssetsBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED, // SSE-S3 encryption
      versioned: false, // Cost minimization: no versioning
      lifecycleRules: [
        {
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Phase 1 dev choice
      autoDeleteObjects: true,
    });

    // -------------------------------------------------------------------------
    // 4. Lambda Functions
    // Least privilege: outside VPC, 128MB, ARM64 Graviton architecture
    // -------------------------------------------------------------------------
    // 4a. neurobridge-ping
    const pingHandler = new lambdaNodejs.NodejsFunction(this, 'NeurobridgePingFunction', {
      functionName: 'neurobridge-ping',
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambda/ping/index.ts'),
      handler: 'handler',
      memorySize: 128, // Minimum memory for cost minimization
      architecture: lambda.Architecture.ARM_64, // Graviton
      timeout: cdk.Duration.seconds(10),
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node20',
      },
    });

    // 4b. create-session: POST /sessions
    const createSessionHandler = new lambdaNodejs.NodejsFunction(this, 'CreateSessionFunction', {
      functionName: 'neurobridge-create-session',
      runtime: lambda.Runtime.NODEJS_20_X,
      projectRoot: path.join(__dirname, '../../'),
      entry: path.join(__dirname, '../../backend/lambdas/create-session/index.ts'),
      handler: 'handler',
      memorySize: 128,
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(10),
      environment: {
        RULES_TABLE_NAME: rulesTable.tableName,
        SESSIONS_TABLE_NAME: sessionsTable.tableName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node20',
      },
    });

    // Least privilege for create-session:
    // Only dynamodb:GetItem on RulesTable, and dynamodb:PutItem on Sessions.
    createSessionHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:GetItem'],
        resources: [rulesTable.tableArn],
      })
    );
    createSessionHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:PutItem'],
        resources: [sessionsTable.tableArn],
      })
    );

    // 4c. get-session: GET /sessions/{sessionId}
    const getSessionHandler = new lambdaNodejs.NodejsFunction(this, 'GetSessionFunction', {
      functionName: 'neurobridge-get-session',
      runtime: lambda.Runtime.NODEJS_20_X,
      projectRoot: path.join(__dirname, '../../'),
      entry: path.join(__dirname, '../../backend/lambdas/get-session/index.ts'),
      handler: 'handler',
      memorySize: 128,
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(10),
      environment: {
        SESSIONS_TABLE_NAME: sessionsTable.tableName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node20',
      },
    });

    // Least privilege for get-session:
    // Only dynamodb:GetItem on Sessions table.
    getSessionHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:GetItem'],
        resources: [sessionsTable.tableArn],
      })
    );

    // 4d. send-message: POST /sessions/{sessionId}/messages
    const sendMessageHandler = new lambdaNodejs.NodejsFunction(this, 'SendMessageFunction', {
      functionName: 'neurobridge-send-message',
      runtime: lambda.Runtime.NODEJS_20_X,
      projectRoot: path.join(__dirname, '../../'),
      entry: path.join(__dirname, '../../backend/lambdas/send-message/index.ts'),
      handler: 'handler',
      memorySize: 256, // Sufficient for Bedrock runtime handling
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(30), // Bedrock invocation safety timeout
      environment: {
        SESSIONS_TABLE_NAME: sessionsTable.tableName,
        RULES_TABLE_NAME: rulesTable.tableName,
        BEDROCK_MODEL_ID: 'global.amazon.nova-2-lite-v1:0',
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node20',
        externalModules: [],
      },
    });

    // Least privilege for send-message:
    // 1. DynamoDB: GetItem on Sessions & RulesTable, PutItem on Sessions
    sendMessageHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
        resources: [sessionsTable.tableArn],
      })
    );
    sendMessageHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:GetItem'],
        resources: [rulesTable.tableArn],
      })
    );

    // 2. Bedrock: InvokeModel scoped to Nova 2 Lite via its ap-south-1 global inference profile.
    sendMessageHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['bedrock:InvokeModel'],
        resources: [
          `arn:aws:bedrock:${this.region}:${this.account}:inference-profile/global.amazon.nova-2-lite-v1:0`,
          `arn:aws:bedrock:${this.region}::foundation-model/amazon.nova-2-lite-v1:0`,
        ],
      })
    );

    // 4e. generate-feedback: POST /sessions/{sessionId}/feedback
    const generateFeedbackHandler = new lambdaNodejs.NodejsFunction(this, 'GenerateFeedbackFunction', {
      functionName: 'neurobridge-generate-feedback',
      runtime: lambda.Runtime.NODEJS_20_X,
      projectRoot: path.join(__dirname, '../../'),
      entry: path.join(__dirname, '../../backend/lambdas/generate-feedback/index.ts'),
      handler: 'handler',
      memorySize: 256,
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(30),
      environment: {
        SESSIONS_TABLE_NAME: sessionsTable.tableName,
        BEDROCK_MODEL_ID: 'global.amazon.nova-2-lite-v1:0',
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node20',
        externalModules: [],
      },
    });

    generateFeedbackHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
        resources: [sessionsTable.tableArn],
      })
    );

    generateFeedbackHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['bedrock:InvokeModel'],
        resources: [
          `arn:aws:bedrock:${this.region}:${this.account}:inference-profile/global.amazon.nova-2-lite-v1:0`,
          `arn:aws:bedrock:${this.region}::foundation-model/amazon.nova-2-lite-v1:0`,
        ],
      })
    );

    // -------------------------------------------------------------------------
    // 5. API Gateway: REST API
    // Cost minimization: No custom domain, no caching enabled.
    // -------------------------------------------------------------------------
    const api = new apigateway.RestApi(this, 'NeuroBridgeApi', {
      restApiName: 'NeuroBridge API',
      description: 'API Gateway for NeuroBridge Phase 1, 2 & 3',
      defaultCorsPreflightOptions: {
        // NOTE: Allow-Origin is set to '*' for dev/hackathon convenience.
        // This should be tightened to the actual frontend origin before production.
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
      deployOptions: {
        stageName: 'prod',
        cachingEnabled: false, // Cost minimization: no API Gateway caching
      },
    });

    // Route: POST /ping
    const pingResource = api.root.addResource('ping');
    pingResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(pingHandler, {
        proxy: true,
      })
    );

    // Route: POST /sessions
    const sessionsResource = api.root.addResource('sessions');
    sessionsResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(createSessionHandler, {
        proxy: true,
      })
    );

    // Route: GET /sessions/{sessionId}
    const singleSessionResource = sessionsResource.addResource('{sessionId}');
    singleSessionResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getSessionHandler, {
        proxy: true,
      })
    );

    // Route: POST /sessions/{sessionId}/messages
    const messagesResource = singleSessionResource.addResource('messages');
    messagesResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(sendMessageHandler, {
        proxy: true,
      })
    );

    // Route: POST /sessions/{sessionId}/feedback
    const feedbackResource = singleSessionResource.addResource('feedback');
    feedbackResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(generateFeedbackHandler, {
        proxy: true,
      })
    );

    // -------------------------------------------------------------------------
    // 6. Stack Outputs
    // -------------------------------------------------------------------------
    new cdk.CfnOutput(this, 'CognitoUserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: 'NeuroBridgeUserPoolId',
    });

    new cdk.CfnOutput(this, 'CognitoAppClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito App Client ID',
      exportName: 'NeuroBridgeAppClientId',
    });

    new cdk.CfnOutput(this, 'ApiGatewayInvokeUrl', {
      value: api.url,
      description: 'API Gateway Invoke URL',
      exportName: 'NeuroBridgeApiInvokeUrl',
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: assetsBucket.bucketName,
      description: 'NeuroBridge Assets S3 Bucket Name',
      exportName: 'NeuroBridgeAssetsBucketName',
    });
  }
}
