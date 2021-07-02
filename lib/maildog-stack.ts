import * as cdk from '@aws-cdk/core';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import * as ses from '@aws-cdk/aws-ses';
import * as sesActions from '@aws-cdk/aws-ses-actions';
import * as sns from '@aws-cdk/aws-sns';
import * as snsSubscriptions from '@aws-cdk/aws-sns-subscriptions';
import * as sqs from '@aws-cdk/aws-sqs';
import * as path from 'path';
import { DispatcherConfig } from './maildog-stack.dispatcher';
interface MailDogForwardingRule {
  description?: string;
  to: string[];
}

interface MailDogDomainRule {
  enabled?: boolean;
  fromEmail?: string;
  scanEnabled?: boolean;
  tlsEnforced?: boolean;
  fallbackEmails?: string[];
  forwardingEmail?: Record<string, MailDogForwardingRule>;
}

interface MailDogConfig {
  domains: Record<string, MailDogDomainRule>;
}

interface MailDogStackProps extends cdk.StackProps {
  config: MailDogConfig;
}

export class MailDogStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: MailDogStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const { domains } = props.config;
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
    const alarm = new cloudwatch.Alarm(this, 'MailAlarm', {
      metric: deadLetterQueue.metricApproximateNumberOfMessagesVisible({
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    const dispatcher = new lambda.NodejsFunction(this, 'Dispatcher', {
      entry: path.resolve(__dirname, './maildog-stack.dispatcher.ts'),
      bundling: {
        minify: true,
        sourceMap: false,
        define: {
          'process.env.CONFIG_PER_KEY_PREFIX': JSON.stringify(
            Object.entries(domains).reduce((result, [domain, rule]) => {
              result[`${domain}/`] = {
                fromEmail: rule.fromEmail
                  ? `${rule.fromEmail}@${domain}`
                  : null,
                forwardMapping: Object.entries(rule.forwardingEmail ?? {})
                  .concat(
                    rule.fallbackEmails
                      ? [['', { to: rule.fallbackEmails }]]
                      : [],
                  )
                  .reduce((mapping, [prefix, entry]) => {
                    mapping[`${prefix}@${domain}`] = entry.to;

                    return mapping;
                  }, {} as Record<string, string[]>),
              };

              return result;
            }, {} as Record<string, DispatcherConfig>),
          ),
        },
      },
      timeout: cdk.Duration.seconds(5),
      memorySize: 128,
      retryAttempts: 0,
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
      rules: Object.entries(domains).flatMap(([domain, rule]) => {
        const maxRecipientsPerRule = 100;
        const recipients = rule.fallbackEmails
          ? [domain]
          : Object.keys(rule.forwardingEmail ?? {}).map(
              (prefix) => `${prefix}@${domain}`,
            );
        const rules = recipients
          .reduce((chunks, _, i, list) => {
            if (i % maxRecipientsPerRule === 0) {
              chunks.push(list.slice(i, i + maxRecipientsPerRule));
            }

            return chunks;
          }, [] as string[][])
          .map<ses.ReceiptRuleOptions>((recipients) => ({
            enabled: rule.enabled,
            recipients: recipients,
            scanEnabled: rule.scanEnabled,
            tlsPolicy: rule.tlsEnforced
              ? ses.TlsPolicy.REQUIRE
              : ses.TlsPolicy.OPTIONAL,
            actions: [
              new sesActions.S3({
                bucket,
                objectKeyPrefix: `${domain}/`,
                topic: mailFeed,
              }),
              new sesActions.Stop(),
            ],
          }));

        if (!recipients.includes(domain)) {
          rules.push({
            enabled: rule.enabled,
            recipients: [domain],
            actions: [
              new sesActions.Bounce({
                template: sesActions.BounceTemplate.MAILBOX_DOES_NOT_EXIST,
                sender: `${rule.fromEmail ?? 'noreply'}@${domain}`,
              }),
            ],
          });
        }

        return rules;
      }),
    });

    new lambda.NodejsFunction(this, 'Scheduler', {
      entry: path.resolve(__dirname, './maildog-stack.scheduler.ts'),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        SQS_QUEUE_URL: deadLetterQueue.queueUrl,
        SNS_TOPIC_ARN: mailFeed.topicArn,
      },
      timeout: cdk.Duration.seconds(5),
      memorySize: 128,
      retryAttempts: 0,
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
          resources: [deadLetterQueue.queueArn],
          actions: ['sqs:ReceiveMessage', 'sqs:DeleteMessage'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: [mailFeed.topicArn],
          actions: ['sns:Publish'],
        }),
      ],
    });

    alarm.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    ruleset.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    mailFeed.addSubscription(
      new snsSubscriptions.LambdaSubscription(dispatcher, {
        deadLetterQueue,
      }),
    );
  }
}
