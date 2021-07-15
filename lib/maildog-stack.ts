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

interface MailDogAliasRule {
  description: string;
  to: string[];
}

interface MailDogDomainRule {
  enabled: boolean;
  fromEmail: string;
  scanEnabled: boolean;
  tlsEnforced: boolean;
  fallbackEmails: string[];
  alias: Record<string, Partial<MailDogAliasRule>>;
}

interface MailDogConfig {
  domains: Record<string, Partial<MailDogDomainRule>>;
}

interface MailDogStackProps extends cdk.StackProps {
  config: MailDogConfig;
}

export class MailDogStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: MailDogStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const domainRuleEntries = Object.entries(props.config.domains).map<
      [string, MailDogDomainRule]
    >(([domain, rule]) => [
      domain,
      {
        enabled: rule.enabled ?? true,
        fromEmail: rule.fromEmail ?? 'noreply',
        scanEnabled: rule.scanEnabled ?? true,
        tlsEnforced: rule.tlsEnforced ?? false,
        fallbackEmails: rule.fallbackEmails ?? [],
        alias: rule.alias ?? {},
      },
    ]);
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
            Object.fromEntries(
              domainRuleEntries.map<[string, DispatcherConfig]>(
                ([domain, rule]) => [
                  `${domain}/`,
                  {
                    fromEmail: `${rule.fromEmail}@${domain}`,
                    forwardMapping: Object.fromEntries(
                      Object.entries(rule.alias)
                        .concat(
                          rule.fallbackEmails.length > 0
                            ? [['', { to: rule.fallbackEmails }]]
                            : [],
                        )
                        .map(([alias, entry]) => [
                          `${alias}@${domain}`,
                          entry.to ?? [],
                        ]),
                    ),
                  },
                ],
              ),
            ),
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
    const spamFilter = new lambda.NodejsFunction(this, 'SpamFilter', {
      entry: path.resolve(__dirname, './maildog-stack.spam-filter.ts'),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      timeout: cdk.Duration.seconds(3),
      memorySize: 128,
      retryAttempts: 0,
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
      ],
    });
    const ruleset = new ses.ReceiptRuleSet(this, 'ReceiptRuleSet', {
      receiptRuleSetName: `${props.stackName ?? 'MailDog'}-ReceiptRuleSet`,
      dropSpam: false, // maybe a bug, it is not added as first rule
      rules: domainRuleEntries.flatMap(([domain, rule]) => {
        const maxRecipientsPerRule = 100;
        const recipients =
          rule.fallbackEmails.length > 0
            ? [domain]
            : Object.entries(rule.alias)
                .filter(([_, entry]) => {
                  if (
                    typeof entry.to === 'undefined' ||
                    entry.to.length === 0
                  ) {
                    console.warn(
                      '[maildog] Alias with no forwarding email addresses found; It will be disabled if no fallback emails are set',
                    );
                    return false;
                  }

                  return true;
                })
                .map(([alias]) => `${alias}@${domain}`);
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
              new sesActions.Lambda({
                invocationType:
                  sesActions.LambdaInvocationType.REQUEST_RESPONSE,
                function: spamFilter,
              }),
              new sesActions.S3({
                bucket,
                objectKeyPrefix: `${domain}/`,
                topic: mailFeed,
              }),
            ],
          }));

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
