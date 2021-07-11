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
          alias: {
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
        "AssetParameters660b50b0fe61d45a80f5d22101cce4d442d90d4270c49d02097537bae09750aaArtifactHashCA298FB1": Object {
          "Description": "Artifact hash for asset \\"660b50b0fe61d45a80f5d22101cce4d442d90d4270c49d02097537bae09750aa\\"",
          "Type": "String",
        },
        "AssetParameters660b50b0fe61d45a80f5d22101cce4d442d90d4270c49d02097537bae09750aaS3Bucket52249DB7": Object {
          "Description": "S3 bucket for asset \\"660b50b0fe61d45a80f5d22101cce4d442d90d4270c49d02097537bae09750aa\\"",
          "Type": "String",
        },
        "AssetParameters660b50b0fe61d45a80f5d22101cce4d442d90d4270c49d02097537bae09750aaS3VersionKey4D826DB7": Object {
          "Description": "S3 key for asset version \\"660b50b0fe61d45a80f5d22101cce4d442d90d4270c49d02097537bae09750aa\\"",
          "Type": "String",
        },
        "AssetParametersca8674af2868d9931918a5aee74ec64978ec3f5baba1b392bdfb306204b15f59ArtifactHashCFA7ACFB": Object {
          "Description": "Artifact hash for asset \\"ca8674af2868d9931918a5aee74ec64978ec3f5baba1b392bdfb306204b15f59\\"",
          "Type": "String",
        },
        "AssetParametersca8674af2868d9931918a5aee74ec64978ec3f5baba1b392bdfb306204b15f59S3Bucket12822632": Object {
          "Description": "S3 bucket for asset \\"ca8674af2868d9931918a5aee74ec64978ec3f5baba1b392bdfb306204b15f59\\"",
          "Type": "String",
        },
        "AssetParametersca8674af2868d9931918a5aee74ec64978ec3f5baba1b392bdfb306204b15f59S3VersionKey01F69698": Object {
          "Description": "S3 key for asset version \\"ca8674af2868d9931918a5aee74ec64978ec3f5baba1b392bdfb306204b15f59\\"",
          "Type": "String",
        },
        "AssetParametersf43ff010f656880b070bbc161ff1f52c0c9dc514b60991c97d31eba8466c4406ArtifactHash4823FBF7": Object {
          "Description": "Artifact hash for asset \\"f43ff010f656880b070bbc161ff1f52c0c9dc514b60991c97d31eba8466c4406\\"",
          "Type": "String",
        },
        "AssetParametersf43ff010f656880b070bbc161ff1f52c0c9dc514b60991c97d31eba8466c4406S3Bucket3EF97734": Object {
          "Description": "S3 bucket for asset \\"f43ff010f656880b070bbc161ff1f52c0c9dc514b60991c97d31eba8466c4406\\"",
          "Type": "String",
        },
        "AssetParametersf43ff010f656880b070bbc161ff1f52c0c9dc514b60991c97d31eba8466c4406S3VersionKeyADCC52F6": Object {
          "Description": "S3 key for asset version \\"f43ff010f656880b070bbc161ff1f52c0c9dc514b60991c97d31eba8466c4406\\"",
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
                "Ref": "AssetParameters660b50b0fe61d45a80f5d22101cce4d442d90d4270c49d02097537bae09750aaS3Bucket52249DB7",
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
                              "Ref": "AssetParameters660b50b0fe61d45a80f5d22101cce4d442d90d4270c49d02097537bae09750aaS3VersionKey4D826DB7",
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
                              "Ref": "AssetParameters660b50b0fe61d45a80f5d22101cce4d442d90d4270c49d02097537bae09750aaS3VersionKey4D826DB7",
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
        "DispatcherEventInvokeConfigE9191C1C": Object {
          "Properties": Object {
            "FunctionName": Object {
              "Ref": "DispatcherD4A12972",
            },
            "MaximumRetryAttempts": 0,
            "Qualifier": "$LATEST",
          },
          "Type": "AWS::Lambda::EventInvokeConfig",
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
          "Properties": Object {
            "RuleSetName": "MailDog-ReceiptRuleSet",
          },
          "Type": "AWS::SES::ReceiptRuleSet",
          "UpdateReplacePolicy": "Delete",
        },
        "ReceiptRuleSetRule01CA7709C": Object {
          "DependsOn": Array [
            "BucketPolicyE9A3008A",
            "SpamFilterAllowSes2CDBB160",
          ],
          "Properties": Object {
            "Rule": Object {
              "Actions": Array [
                Object {
                  "LambdaAction": Object {
                    "FunctionArn": Object {
                      "Fn::GetAtt": Array [
                        "SpamFilter4A4DC48B",
                        "Arn",
                      ],
                    },
                    "InvocationType": "RequestResponse",
                  },
                },
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
            "SpamFilterAllowSes2CDBB160",
          ],
          "Properties": Object {
            "After": Object {
              "Ref": "ReceiptRuleSetRule01CA7709C",
            },
            "Rule": Object {
              "Actions": Array [
                Object {
                  "LambdaAction": Object {
                    "FunctionArn": Object {
                      "Fn::GetAtt": Array [
                        "SpamFilter4A4DC48B",
                        "Arn",
                      ],
                    },
                    "InvocationType": "RequestResponse",
                  },
                },
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
        "SchedulerCFE73206": Object {
          "DependsOn": Array [
            "SchedulerServiceRoleDefaultPolicyFA0D8235",
            "SchedulerServiceRole62CDA70C",
          ],
          "Properties": Object {
            "Code": Object {
              "S3Bucket": Object {
                "Ref": "AssetParametersca8674af2868d9931918a5aee74ec64978ec3f5baba1b392bdfb306204b15f59S3Bucket12822632",
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
                              "Ref": "AssetParametersca8674af2868d9931918a5aee74ec64978ec3f5baba1b392bdfb306204b15f59S3VersionKey01F69698",
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
                              "Ref": "AssetParametersca8674af2868d9931918a5aee74ec64978ec3f5baba1b392bdfb306204b15f59S3VersionKey01F69698",
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
        "SchedulerEventInvokeConfigBC5670B2": Object {
          "Properties": Object {
            "FunctionName": Object {
              "Ref": "SchedulerCFE73206",
            },
            "MaximumRetryAttempts": 0,
            "Qualifier": "$LATEST",
          },
          "Type": "AWS::Lambda::EventInvokeConfig",
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
                    "sqs:ReceiveMessage",
                    "sqs:DeleteMessage",
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
                  "Action": "sns:Publish",
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
        "SpamFilter4A4DC48B": Object {
          "DependsOn": Array [
            "SpamFilterServiceRoleDefaultPolicy85EC4A04",
            "SpamFilterServiceRole799061EA",
          ],
          "Properties": Object {
            "Code": Object {
              "S3Bucket": Object {
                "Ref": "AssetParametersf43ff010f656880b070bbc161ff1f52c0c9dc514b60991c97d31eba8466c4406S3Bucket3EF97734",
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
                              "Ref": "AssetParametersf43ff010f656880b070bbc161ff1f52c0c9dc514b60991c97d31eba8466c4406S3VersionKeyADCC52F6",
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
                              "Ref": "AssetParametersf43ff010f656880b070bbc161ff1f52c0c9dc514b60991c97d31eba8466c4406S3VersionKeyADCC52F6",
                            },
                          ],
                        },
                      ],
                    },
                  ],
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
                "SpamFilterServiceRole799061EA",
                "Arn",
              ],
            },
            "Runtime": "nodejs14.x",
            "Timeout": 3,
          },
          "Type": "AWS::Lambda::Function",
        },
        "SpamFilterAllowSes2CDBB160": Object {
          "Properties": Object {
            "Action": "lambda:InvokeFunction",
            "FunctionName": Object {
              "Fn::GetAtt": Array [
                "SpamFilter4A4DC48B",
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
        "SpamFilterEventInvokeConfig752E3DBC": Object {
          "Properties": Object {
            "FunctionName": Object {
              "Ref": "SpamFilter4A4DC48B",
            },
            "MaximumRetryAttempts": 0,
            "Qualifier": "$LATEST",
          },
          "Type": "AWS::Lambda::EventInvokeConfig",
        },
        "SpamFilterServiceRole799061EA": Object {
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
        "SpamFilterServiceRoleDefaultPolicy85EC4A04": Object {
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
              ],
              "Version": "2012-10-17",
            },
            "PolicyName": "SpamFilterServiceRoleDefaultPolicy85EC4A04",
            "Roles": Array [
              Object {
                "Ref": "SpamFilterServiceRole799061EA",
              },
            ],
          },
          "Type": "AWS::IAM::Policy",
        },
      },
    }
  `);
});
