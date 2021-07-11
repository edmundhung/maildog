#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MailDogStack } from '../lib/maildog-stack';
import config from '../maildog.config.json';

const app = new cdk.App();

new MailDogStack(app, 'MailDog', {
  config,
  stackName: `MailDog-${process.env.ENVIRONMENT_NAME}`,
});
