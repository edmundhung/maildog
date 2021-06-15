#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MailDogStack } from '../lib/maildog-stack';

const { CONFIG } = process.env;

if (!CONFIG) {
  throw new Error(
    'Config not found; Please make sure CONFIG is passed through environment variables',
  );
}

const app = new cdk.App();
new MailDogStack(app, 'MailDog', {
  config: JSON.parse(CONFIG),
});
