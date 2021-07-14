#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as fs from 'fs';
import { parse } from 'jsonc-parser';
import { MailDogStack } from '../lib/maildog-stack';

const app = new cdk.App();
const config = parse(fs.readFileSync('./maildog.config.json').toString());

new MailDogStack(app, 'MailDog', {
  config,
  stackName: `MailDog-${process.env.ENVIRONMENT_NAME}`,
});
