import { SynthUtils } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { MailDogStack } from '../lib/maildog-stack';

test('Stack Snapshot', () => {
  const app = new cdk.App();
  const stack = new MailDogStack(app, 'ExampleStack', {
    config: {
      domains: {
        'example.com': {
          fallbackEmails: ['example@gmail.com'],
        },
        'maildog.xyz': {
          enabled: true,
          fromEmail: 'noreply',
          scanEnabled: true,
          tlsEnforced: true,
          forwardingEmail: {
            foo: {
              to: ['example@gmail.com'],
            },
            bar: {
              description: 'Optional description',
              to: ['baz@mail.com', 'bar@example.com'],
            },
          },
        },
      },
    },
  });

  expect(SynthUtils.toCloudFormation(stack)).toMatchInlineSnapshot(`
    Object {
      "Parameters": Object {
        "AssetParameters0d42b6f88af3322322d1fe8400651c02fd47dfc61f7919ac05a61b201c715719ArtifactHashC1AE5293": Object {
          "Description": "Artifact hash for asset \\"0d42b6f88af3322322d1fe8400651c02fd47dfc61f7919ac05a61b201c715719\\"",
          "Type": "String",
        },
        "AssetParameters0d42b6f88af3322322d1fe8400651c02fd47dfc61f7919ac05a61b201c715719S3BucketF34BDC85": Object {
          "Description": "S3 bucket for asset \\"0d42b6f88af3322322d1fe8400651c02fd47dfc61f7919ac05a61b201c715719\\"",
          "Type": "String",
        },
        "AssetParameters0d42b6f88af3322322d1fe8400651c02fd47dfc61f7919ac05a61b201c715719S3VersionKey98806A7D": Object {
          "Description": "S3 key for asset version \\"0d42b6f88af3322322d1fe8400651c02fd47dfc61f7919ac05a61b201c715719\\"",
          "Type": "String",
        },
        "AssetParameters3c4c5bf6ccd5d8f78177458a9f4838d6502a822accd99c12b4beb1c705848b01ArtifactHashCB808D06": Object {
          "Description": "Artifact hash for asset \\"3c4c5bf6ccd5d8f78177458a9f4838d6502a822accd99c12b4beb1c705848b01\\"",
          "Type": "String",
        },
        "AssetParameters3c4c5bf6ccd5d8f78177458a9f4838d6502a822accd99c12b4beb1c705848b01S3Bucket3702998F": Object {
          "Description": "S3 bucket for asset \\"3c4c5bf6ccd5d8f78177458a9f4838d6502a822accd99c12b4beb1c705848b01\\"",
          "Type": "String",
        },
        "AssetParameters3c4c5bf6ccd5d8f78177458a9f4838d6502a822accd99c12b4beb1c705848b01S3VersionKeyB621FC29": Object {
          "Description": "S3 key for asset version \\"3c4c5bf6ccd5d8f78177458a9f4838d6502a822accd99c12b4beb1c705848b01\\"",
          "Type": "String",
        },
        "AssetParameters40880c7969e68b44e0c4f0705d830dd8d4158cc7735a6d1affbe71abc750f86fArtifactHashF0B40986": Object {
          "Description": "Artifact hash for asset \\"40880c7969e68b44e0c4f0705d830dd8d4158cc7735a6d1affbe71abc750f86f\\"",
          "Type": "String",
        },
        "AssetParameters40880c7969e68b44e0c4f0705d830dd8d4158cc7735a6d1affbe71abc750f86fS3BucketB8D31A7B": Object {
          "Description": "S3 bucket for asset \\"40880c7969e68b44e0c4f0705d830dd8d4158cc7735a6d1affbe71abc750f86f\\"",
          "Type": "String",
        },
        "AssetParameters40880c7969e68b44e0c4f0705d830dd8d4158cc7735a6d1affbe71abc750f86fS3VersionKey7E5F5AC3": Object {
          "Description": "S3 key for asset version \\"40880c7969e68b44e0c4f0705d830dd8d4158cc7735a6d1affbe71abc750f86f\\"",
          "Type": "String",
        },
      },
      "Resources": Object {
        "Bucket83908E77": Object {
          "DeletionPolicy": "Retain",
          "Properties": Object {
            "LifecycleConfiguration": Object {
              "Rules": Array [
                Object {
                  "ExpirationInDays": 365,
                  "Status": "Enabled",
                  "Transitions": Array [
                    Object {
                      "StorageClass": "STANDARD_IA",
                      "TransitionInDays": 30,
                    },
                    Object {
                      "StorageClass": "GLACIER",
                      "TransitionInDays": 90,
                    },
                  ],
                },
              ],
            },
          },
          "Type": "AWS::S3::Bucket",
          "UpdateReplacePolicy": "Retain",
        },
        "BucketPolicyE9A3008A": Object {
          "Properties": Object {
            "Bucket": Object {
              "Ref": "Bucket83908E77",
            },
            "PolicyDocument": Object {
              "Statement": Array [
                Object {
                  "Action": "s3:PutObject",
                  "Condition": Object {
                    "StringEquals": Object {
                      "aws:Referer": Object {
                        "Ref": "AWS::AccountId",
                      },
                    },
                  },
                  "Effect": "Allow",
                  "Principal": Object {
                    "Service": "ses.amazonaws.com",
                  },
                  "Resource": Object {
                    "Fn::Join": Array [
                      "",
                      Array [
                        Object {
                          "Fn::GetAtt": Array [
                            "Bucket83908E77",
                            "Arn",
                          ],
                        },
                        "/example.com/*",
                      ],
                    ],
                  },
                },
                Object {
                  "Action": "s3:PutObject",
                  "Condition": Object {
                    "StringEquals": Object {
                      "aws:Referer": Object {
                        "Ref": "AWS::AccountId",
                      },
                    },
                  },
                  "Effect": "Allow",
                  "Principal": Object {
                    "Service": "ses.amazonaws.com",
                  },
                  "Resource": Object {
                    "Fn::Join": Array [
                      "",
                      Array [
                        Object {
                          "Fn::GetAtt": Array [
                            "Bucket83908E77",
                            "Arn",
                          ],
                        },
                        "/maildog.xyz/*",
                      ],
                    ],
                  },
                },
              ],
              "Version": "2012-10-17",
            },
          },
          "Type": "AWS::S3::BucketPolicy",
        },
        "DeadLetterQueue9F481546": Object {
          "DeletionPolicy": "Delete",
          "Properties": Object {
            "MessageRetentionPeriod": 1209600,
          },
          "Type": "AWS::SQS::Queue",
          "UpdateReplacePolicy": "Delete",
        },
        "DeadLetterQueuePolicyB1FB890C": Object {
          "Properties": Object {
            "PolicyDocument": Object {
              "Statement": Array [
                Object {
                  "Action": "sqs:SendMessage",
                  "Condition": Object {
                    "ArnEquals": Object {
                      "aws:SourceArn": Object {
                        "Ref": "MailFeedF42B1B20",
                      },
                    },
                  },
                  "Effect": "Allow",
                  "Principal": Object {
                    "Service": "sns.amazonaws.com",
                  },
                  "Resource": Object {
                    "Fn::GetAtt": Array [
                      "DeadLetterQueue9F481546",
                      "Arn",
                    ],
                  },
                },
              ],
              "Version": "2012-10-17",
            },
            "Queues": Array [
              Object {
                "Ref": "DeadLetterQueue9F481546",
              },
            ],
          },
          "Type": "AWS::SQS::QueuePolicy",
        },
        "DispatcherAllowInvokeExampleStackMailFeedEF88B62C5E5A79A7": Object {
          "Properties": Object {
            "Action": "lambda:InvokeFunction",
            "FunctionName": Object {
              "Fn::GetAtt": Array [
                "DispatcherD4A12972",
                "Arn",
              ],
            },
            "Principal": "sns.amazonaws.com",
            "SourceArn": Object {
              "Ref": "MailFeedF42B1B20",
            },
          },
          "Type": "AWS::Lambda::Permission",
        },
        "DispatcherD4A12972": Object {
          "DependsOn": Array [
            "DispatcherServiceRoleDefaultPolicyDA413007",
            "DispatcherServiceRole904BCD09",
          ],
          "Properties": Object {
            "Code": Object {
              "S3Bucket": Object {
                "Ref": "AssetParameters3c4c5bf6ccd5d8f78177458a9f4838d6502a822accd99c12b4beb1c705848b01S3Bucket3702998F",
              },
              "S3Key": Object {
                "Fn::Join": Array [
                  "",
                  Array [
                    Object {
                      "Fn::Select": Array [
                        0,
                        Object {
                          "Fn::Split": Array [
                            "||",
                            Object {
                              "Ref": "AssetParameters3c4c5bf6ccd5d8f78177458a9f4838d6502a822accd99c12b4beb1c705848b01S3VersionKeyB621FC29",
                            },
                          ],
                        },
                      ],
                    },
                    Object {
                      "Fn::Select": Array [
                        1,
                        Object {
                          "Fn::Split": Array [
                            "||",
                            Object {
                              "Ref": "AssetParameters3c4c5bf6ccd5d8f78177458a9f4838d6502a822accd99c12b4beb1c705848b01S3VersionKeyB621FC29",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                ],
              },
            },
            "DeadLetterConfig": Object {
              "TargetArn": Object {
                "Fn::GetAtt": Array [
                  "DeadLetterQueue9F481546",
                  "Arn",
                ],
              },
            },
            "Environment": Object {
              "Variables": Object {
                "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1",
              },
            },
            "Handler": "index.handler",
            "MemorySize": 128,
            "Role": Object {
              "Fn::GetAtt": Array [
                "DispatcherServiceRole904BCD09",
                "Arn",
              ],
            },
            "Runtime": "nodejs14.x",
            "Timeout": 5,
          },
          "Type": "AWS::Lambda::Function",
        },
        "DispatcherMailFeed5E0BDAD7": Object {
          "Properties": Object {
            "Endpoint": Object {
              "Fn::GetAtt": Array [
                "DispatcherD4A12972",
                "Arn",
              ],
            },
            "Protocol": "lambda",
            "RedrivePolicy": Object {
              "deadLetterTargetArn": Object {
                "Fn::GetAtt": Array [
                  "DeadLetterQueue9F481546",
                  "Arn",
                ],
              },
            },
            "TopicArn": Object {
              "Ref": "MailFeedF42B1B20",
            },
          },
          "Type": "AWS::SNS::Subscription",
        },
        "DispatcherServiceRole904BCD09": Object {
          "Properties": Object {
            "AssumeRolePolicyDocument": Object {
              "Statement": Array [
                Object {
                  "Action": "sts:AssumeRole",
                  "Effect": "Allow",
                  "Principal": Object {
                    "Service": "lambda.amazonaws.com",
                  },
                },
              ],
              "Version": "2012-10-17",
            },
            "ManagedPolicyArns": Array [
              Object {
                "Fn::Join": Array [
                  "",
                  Array [
                    "arn:",
                    Object {
                      "Ref": "AWS::Partition",
                    },
                    ":iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
                  ],
                ],
              },
            ],
          },
          "Type": "AWS::IAM::Role",
        },
        "DispatcherServiceRoleDefaultPolicyDA413007": Object {
          "Properties": Object {
            "PolicyDocument": Object {
              "Statement": Array [
                Object {
                  "Action": Array [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents",
                  ],
                  "Effect": "Allow",
                  "Resource": "arn:aws:logs:*:*:*",
                },
                Object {
                  "Action": "ses:SendRawEmail",
                  "Effect": "Allow",
                  "Resource": "*",
                },
                Object {
                  "Action": Array [
                    "s3:GetObject",
                    "s3:PutObject",
                  ],
                  "Effect": "Allow",
                  "Resource": Object {
                    "Fn::Join": Array [
                      "",
                      Array [
                        Object {
                          "Fn::GetAtt": Array [
                            "Bucket83908E77",
                            "Arn",
                          ],
                        },
                        "/*",
                      ],
                    ],
                  },
                },
                Object {
                  "Action": "sqs:SendMessage",
                  "Effect": "Allow",
                  "Resource": Object {
                    "Fn::GetAtt": Array [
                      "DeadLetterQueue9F481546",
                      "Arn",
                    ],
                  },
                },
              ],
              "Version": "2012-10-17",
            },
            "PolicyName": "DispatcherServiceRoleDefaultPolicyDA413007",
            "Roles": Array [
              Object {
                "Ref": "DispatcherServiceRole904BCD09",
              },
            ],
          },
          "Type": "AWS::IAM::Policy",
        },
        "MailAlarmC718F8ED": Object {
          "DeletionPolicy": "Delete",
          "Properties": Object {
            "ComparisonOperator": "GreaterThanOrEqualToThreshold",
            "Dimensions": Array [
              Object {
                "Name": "QueueName",
                "Value": Object {
                  "Fn::GetAtt": Array [
                    "DeadLetterQueue9F481546",
                    "QueueName",
                  ],
                },
              },
            ],
            "EvaluationPeriods": 1,
            "MetricName": "ApproximateNumberOfMessagesVisible",
            "Namespace": "AWS/SQS",
            "Period": 300,
            "Statistic": "Average",
            "Threshold": 1,
            "TreatMissingData": "notBreaching",
          },
          "Type": "AWS::CloudWatch::Alarm",
          "UpdateReplacePolicy": "Delete",
        },
        "MailFeedF42B1B20": Object {
          "Type": "AWS::SNS::Topic",
        },
        "ReceiptRuleSetD3CCC994": Object {
          "DeletionPolicy": "Delete",
          "Type": "AWS::SES::ReceiptRuleSet",
          "UpdateReplacePolicy": "Delete",
        },
        "ReceiptRuleSetDropSpamRule1C768923": Object {
          "Properties": Object {
            "Rule": Object {
              "Actions": Array [
                Object {
                  "LambdaAction": Object {
                    "FunctionArn": Object {
                      "Fn::GetAtt": Array [
                        "SingletonLambda224e77f9a32e4b4dac32983477abba164533EA15",
                        "Arn",
                      ],
                    },
                    "InvocationType": "RequestResponse",
                  },
                },
              ],
              "Enabled": true,
              "ScanEnabled": true,
            },
            "RuleSetName": Object {
              "Ref": "ReceiptRuleSetD3CCC994",
            },
          },
          "Type": "AWS::SES::ReceiptRule",
        },
        "ReceiptRuleSetRule01CA7709C": Object {
          "DependsOn": Array [
            "BucketPolicyE9A3008A",
          ],
          "Properties": Object {
            "Rule": Object {
              "Actions": Array [
                Object {
                  "S3Action": Object {
                    "BucketName": Object {
                      "Ref": "Bucket83908E77",
                    },
                    "ObjectKeyPrefix": "example.com/",
                    "TopicArn": Object {
                      "Ref": "MailFeedF42B1B20",
                    },
                  },
                },
              ],
              "Enabled": true,
              "Recipients": Array [
                "example.com",
              ],
              "TlsPolicy": "Optional",
            },
            "RuleSetName": Object {
              "Ref": "ReceiptRuleSetD3CCC994",
            },
          },
          "Type": "AWS::SES::ReceiptRule",
        },
        "ReceiptRuleSetRule1636DD081": Object {
          "DependsOn": Array [
            "BucketPolicyE9A3008A",
          ],
          "Properties": Object {
            "After": Object {
              "Ref": "ReceiptRuleSetRule01CA7709C",
            },
            "Rule": Object {
              "Actions": Array [
                Object {
                  "S3Action": Object {
                    "BucketName": Object {
                      "Ref": "Bucket83908E77",
                    },
                    "ObjectKeyPrefix": "maildog.xyz/",
                    "TopicArn": Object {
                      "Ref": "MailFeedF42B1B20",
                    },
                  },
                },
              ],
              "Enabled": true,
              "Recipients": Array [
                "foo@maildog.xyz",
                "bar@maildog.xyz",
              ],
              "ScanEnabled": true,
              "TlsPolicy": "Require",
            },
            "RuleSetName": Object {
              "Ref": "ReceiptRuleSetD3CCC994",
            },
          },
          "Type": "AWS::SES::ReceiptRule",
        },
        "ReceiptRuleSetRule22D448221": Object {
          "Properties": Object {
            "After": Object {
              "Ref": "ReceiptRuleSetRule1636DD081",
            },
            "Rule": Object {
              "Actions": Array [
                Object {
                  "BounceAction": Object {
                    "Message": "Mailbox does not exist",
                    "Sender": "noreply@maildog.xyz",
                    "SmtpReplyCode": "550",
                    "StatusCode": "5.1.1",
                  },
                },
              ],
              "Enabled": true,
              "Recipients": Array [
                "maildog.xyz",
              ],
            },
            "RuleSetName": Object {
              "Ref": "ReceiptRuleSetD3CCC994",
            },
          },
          "Type": "AWS::SES::ReceiptRule",
        },
        "SchedulerCFE73206": Object {
          "DependsOn": Array [
            "SchedulerServiceRoleDefaultPolicyFA0D8235",
            "SchedulerServiceRole62CDA70C",
          ],
          "Properties": Object {
            "Code": Object {
              "S3Bucket": Object {
                "Ref": "AssetParameters40880c7969e68b44e0c4f0705d830dd8d4158cc7735a6d1affbe71abc750f86fS3BucketB8D31A7B",
              },
              "S3Key": Object {
                "Fn::Join": Array [
                  "",
                  Array [
                    Object {
                      "Fn::Select": Array [
                        0,
                        Object {
                          "Fn::Split": Array [
                            "||",
                            Object {
                              "Ref": "AssetParameters40880c7969e68b44e0c4f0705d830dd8d4158cc7735a6d1affbe71abc750f86fS3VersionKey7E5F5AC3",
                            },
                          ],
                        },
                      ],
                    },
                    Object {
                      "Fn::Select": Array [
                        1,
                        Object {
                          "Fn::Split": Array [
                            "||",
                            Object {
                              "Ref": "AssetParameters40880c7969e68b44e0c4f0705d830dd8d4158cc7735a6d1affbe71abc750f86fS3VersionKey7E5F5AC3",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                ],
              },
            },
            "DeadLetterConfig": Object {
              "TargetArn": Object {
                "Fn::GetAtt": Array [
                  "DeadLetterQueue9F481546",
                  "Arn",
                ],
              },
            },
            "Environment": Object {
              "Variables": Object {
                "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1",
                "SNS_TOPIC_ARN": Object {
                  "Ref": "MailFeedF42B1B20",
                },
                "SQS_QUEUE_URL": Object {
                  "Ref": "DeadLetterQueue9F481546",
                },
              },
            },
            "Handler": "index.handler",
            "MemorySize": 128,
            "Role": Object {
              "Fn::GetAtt": Array [
                "SchedulerServiceRole62CDA70C",
                "Arn",
              ],
            },
            "Runtime": "nodejs14.x",
            "Timeout": 5,
          },
          "Type": "AWS::Lambda::Function",
        },
        "SchedulerServiceRole62CDA70C": Object {
          "Properties": Object {
            "AssumeRolePolicyDocument": Object {
              "Statement": Array [
                Object {
                  "Action": "sts:AssumeRole",
                  "Effect": "Allow",
                  "Principal": Object {
                    "Service": "lambda.amazonaws.com",
                  },
                },
              ],
              "Version": "2012-10-17",
            },
            "ManagedPolicyArns": Array [
              Object {
                "Fn::Join": Array [
                  "",
                  Array [
                    "arn:",
                    Object {
                      "Ref": "AWS::Partition",
                    },
                    ":iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
                  ],
                ],
              },
            ],
          },
          "Type": "AWS::IAM::Role",
        },
        "SchedulerServiceRoleDefaultPolicyFA0D8235": Object {
          "Properties": Object {
            "PolicyDocument": Object {
              "Statement": Array [
                Object {
                  "Action": Array [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents",
                  ],
                  "Effect": "Allow",
                  "Resource": "arn:aws:logs:*:*:*",
                },
                Object {
                  "Action": Array [
                    "sqs:receiveMessage",
                    "sqs:deleteMessageBatch",
                  ],
                  "Effect": "Allow",
                  "Resource": Object {
                    "Fn::GetAtt": Array [
                      "DeadLetterQueue9F481546",
                      "Arn",
                    ],
                  },
                },
                Object {
                  "Action": "sns:publish",
                  "Effect": "Allow",
                  "Resource": Object {
                    "Ref": "MailFeedF42B1B20",
                  },
                },
                Object {
                  "Action": "sqs:SendMessage",
                  "Effect": "Allow",
                  "Resource": Object {
                    "Fn::GetAtt": Array [
                      "DeadLetterQueue9F481546",
                      "Arn",
                    ],
                  },
                },
              ],
              "Version": "2012-10-17",
            },
            "PolicyName": "SchedulerServiceRoleDefaultPolicyFA0D8235",
            "Roles": Array [
              Object {
                "Ref": "SchedulerServiceRole62CDA70C",
              },
            ],
          },
          "Type": "AWS::IAM::Policy",
        },
        "SingletonLambda224e77f9a32e4b4dac32983477abba164533EA15": Object {
          "DependsOn": Array [
            "SingletonLambda224e77f9a32e4b4dac32983477abba16ServiceRole3037F5B4",
          ],
          "Properties": Object {
            "Code": Object {
              "S3Bucket": Object {
                "Ref": "AssetParameters0d42b6f88af3322322d1fe8400651c02fd47dfc61f7919ac05a61b201c715719S3BucketF34BDC85",
              },
              "S3Key": Object {
                "Fn::Join": Array [
                  "",
                  Array [
                    Object {
                      "Fn::Select": Array [
                        0,
                        Object {
                          "Fn::Split": Array [
                            "||",
                            Object {
                              "Ref": "AssetParameters0d42b6f88af3322322d1fe8400651c02fd47dfc61f7919ac05a61b201c715719S3VersionKey98806A7D",
                            },
                          ],
                        },
                      ],
                    },
                    Object {
                      "Fn::Select": Array [
                        1,
                        Object {
                          "Fn::Split": Array [
                            "||",
                            Object {
                              "Ref": "AssetParameters0d42b6f88af3322322d1fe8400651c02fd47dfc61f7919ac05a61b201c715719S3VersionKey98806A7D",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                ],
              },
            },
            "Handler": "index.handler",
            "Role": Object {
              "Fn::GetAtt": Array [
                "SingletonLambda224e77f9a32e4b4dac32983477abba16ServiceRole3037F5B4",
                "Arn",
              ],
            },
            "Runtime": "nodejs14.x",
          },
          "Type": "AWS::Lambda::Function",
        },
        "SingletonLambda224e77f9a32e4b4dac32983477abba16AllowSesB42DF904": Object {
          "Properties": Object {
            "Action": "lambda:InvokeFunction",
            "FunctionName": Object {
              "Fn::GetAtt": Array [
                "SingletonLambda224e77f9a32e4b4dac32983477abba164533EA15",
                "Arn",
              ],
            },
            "Principal": "ses.amazonaws.com",
            "SourceAccount": Object {
              "Ref": "AWS::AccountId",
            },
          },
          "Type": "AWS::Lambda::Permission",
        },
        "SingletonLambda224e77f9a32e4b4dac32983477abba16ServiceRole3037F5B4": Object {
          "Properties": Object {
            "AssumeRolePolicyDocument": Object {
              "Statement": Array [
                Object {
                  "Action": "sts:AssumeRole",
                  "Effect": "Allow",
                  "Principal": Object {
                    "Service": "lambda.amazonaws.com",
                  },
                },
              ],
              "Version": "2012-10-17",
            },
            "ManagedPolicyArns": Array [
              Object {
                "Fn::Join": Array [
                  "",
                  Array [
                    "arn:",
                    Object {
                      "Ref": "AWS::Partition",
                    },
                    ":iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
                  ],
                ],
              },
            ],
          },
          "Type": "AWS::IAM::Role",
        },
      },
    }
  `);
});
