#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MailDogStack } from '../lib/maildog-stack';
import config from '../maildog.config.json';

const environmentName = process.env.ENVIRONMENT_NAME;

if (!environmentName) {
  throw new Error('process.env.ENVIRONMENT_NAME must be provided');
}

const app = new cdk.App();

new MailDogStack(app, 'MailDog', {
  config,
  stackName: `MailDog-${environmentName}`,
});
