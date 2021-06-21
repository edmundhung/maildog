import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import * as ses from '@aws-cdk/aws-ses';
import * as sesActions from '@aws-cdk/aws-ses-actions';
import * as sns from '@aws-cdk/aws-sns';
import * as snsSubscriptions from '@aws-cdk/aws-sns-subscriptions';
import * as sqs from '@aws-cdk/aws-sqs';
import * as path from 'path';

interface MailDogConfig {
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
    const bucket = new s3.Bucket(this, 'Bucket', {
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(365),
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
      ],
    });
    const mailFeed = new sns.Topic(this, 'MailFeed');
    const deadLetterQueue = new sqs.Queue(this, 'DeadLetterQueue', {
      retentionPeriod: cdk.Duration.days(14),
    });
    const dispatcher = new lambda.NodejsFunction(this, 'Dispatcher', {
      entry: path.resolve(__dirname, './maildog-stack.dispatcher.ts'),
      bundling: {
        minify: true,
        sourceMap: false,
        define: {
          'process.env.CONFIG': JSON.stringify(props.config),
        },
      },
      timeout: cdk.Duration.seconds(5),
      memorySize: 128,
      deadLetterQueue,
      initialPolicy: [
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
    const ruleset = new ses.ReceiptRuleSet(this, 'ReceiptRuleSet', {
      dropSpam: true,
      rules: [
        {
          enabled: true,
          actions: [
            new sesActions.S3({
              bucket,
              objectKeyPrefix: 'emails/',
              topic: mailFeed,
            }),
          ],
        },
      ],
    });

    ruleset.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    mailFeed.addSubscription(
      new snsSubscriptions.LambdaSubscription(dispatcher, {
        deadLetterQueue,
      }),
    );
  }
}
