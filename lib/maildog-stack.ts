import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import * as ses from '@aws-cdk/aws-ses';
import * as actions from '@aws-cdk/aws-ses-actions';
import * as path from 'path';

interface MailDogConfig {
  domain: string;
  emailKeyPrefix: string;
  fromEmail?: string;
  forwardMapping: Record<string, string[]>;
}

interface MailDogStackProps extends cdk.StackProps {
  config: MailDogConfig;
}

export class MailDogStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: MailDogStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const bucket = new s3.Bucket(this, 'MailDogBucket');
    const dispatcherFunction = new lambda.NodejsFunction(
      this,
      'MailDogDispatcher',
      {
        entry: path.resolve(__dirname, './maildog-stack.dispatcher.ts'),
        bundling: {
          minify: true,
          sourceMap: false,
          define: {
            'process.env.CONFIG': JSON.stringify(props.config),
          },
        },
        environment: {
          EMAIL_BUCKET: bucket.bucketName,
        },
        timeout: cdk.Duration.seconds(5),
        memorySize: 128,
      },
    );
    const policy = new iam.Policy(this, 'MailDogPolicy', {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: ['arn:aws:logs:*:*:*'],
          actions: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
          ],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: ['*'],
          actions: ['ses:SendRawEmail'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: [`${bucket.bucketArn}/*`],
          actions: ['s3:GetObject', 's3:PutObject'],
        }),
      ],
    });
    new ses.ReceiptRuleSet(this, 'MailDogReceiptRuleSet', {
      dropSpam: true,
      rules: [
        {
          enabled: true,
          actions: [
            new actions.S3({
              bucket,
              objectKeyPrefix: props.config.emailKeyPrefix,
            }),
            new actions.Lambda({
              function: dispatcherFunction,
            }),
          ],
        },
      ],
    });

    dispatcherFunction.role?.attachInlinePolicy(policy);
  }
}
