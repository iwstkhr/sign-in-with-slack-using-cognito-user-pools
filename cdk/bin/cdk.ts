#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();
new CdkStack(app, 'CdkStack', {
  slackSecretArn: process.env.SLACK_SECRET_ARN ?? '',
  cognitoDomainPrefix: process.env.COGNITO_DOMAIN_PREFIX ?? '',
});
