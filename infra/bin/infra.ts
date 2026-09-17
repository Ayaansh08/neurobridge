#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NeuroBridgeStack } from '../lib/neurobridge-stack';

const app = new cdk.App();

// Target region: ap-south-1 via env/config, not hardcoded in resource logic
const targetRegion = process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'ap-south-1';
const targetAccount = process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID;

const stack = new NeuroBridgeStack(app, 'NeuroBridgeStack', {
  env: {
    account: targetAccount,
    region: targetRegion,
  },
  description: 'NeuroBridge Phase 1 infrastructure stack',
});

// All resources tagged Project=NeuroBridge, Phase=1 for cost tracking
cdk.Tags.of(stack).add('Project', 'NeuroBridge');
cdk.Tags.of(stack).add('Phase', '1');
