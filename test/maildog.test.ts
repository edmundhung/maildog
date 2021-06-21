import { SynthUtils } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { MailDogStack } from '../lib/maildog-stack';

test('Stack Snapshot', () => {
  const app = new cdk.App();
  const stack = new MailDogStack(app, 'ExampleStack', {
    config: {
      forwardMapping: {
        '@example.com': ['noreply@example.com'],
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
        "AssetParameters494acd5c01f80cc8ffc56aa2d98c4ebc615edd4d16f323abe528f13fb9696e65ArtifactHash6A90125E": Object {
          "Description": "Artifact hash for asset \\"494acd5c01f80cc8ffc56aa2d98c4ebc615edd4d16f323abe528f13fb9696e65\\"",
          "Type": "String",
        },
        "AssetParameters494acd5c01f80cc8ffc56aa2d98c4ebc615edd4d16f323abe528f13fb9696e65S3BucketCA91D5FE": Object {
          "Description": "S3 bucket for asset \\"494acd5c01f80cc8ffc56aa2d98c4ebc615edd4d16f323abe528f13fb9696e65\\"",
          "Type": "String",
        },
        "AssetParameters494acd5c01f80cc8ffc56aa2d98c4ebc615edd4d16f323abe528f13fb9696e65S3VersionKeyC9B93B70": Object {
          "Description": "S3 key for asset version \\"494acd5c01f80cc8ffc56aa2d98c4ebc615edd4d16f323abe528f13fb9696e65\\"",
          "Type": "String",
        },
      },
      "Resources": Object {
        "MailDogBucketA54A602D": Object {
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
        "MailDogBucketPolicy55ED7577": Object {
          "Properties": Object {
            "Bucket": Object {
              "Ref": "MailDogBucketA54A602D",
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
                            "MailDogBucketA54A602D",
                            "Arn",
                          ],
                        },
                        "/emails/*",
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
        "MailDogDeadLetterQueueAE7B460C": Object {
          "DeletionPolicy": "Delete",
          "Properties": Object {
            "MessageRetentionPeriod": 1209600,
          },
          "Type": "AWS::SQS::Queue",
          "UpdateReplacePolicy": "Delete",
        },
        "MailDogDeadLetterQueuePolicyB4DCDEEA": Object {
          "Properties": Object {
            "PolicyDocument": Object {
              "Statement": Array [
                Object {
                  "Action": "sqs:SendMessage",
                  "Condition": Object {
                    "ArnEquals": Object {
                      "aws:SourceArn": Object {
                        "Ref": "MailDogMailFeed65FBE969",
                      },
                    },
                  },
                  "Effect": "Allow",
                  "Principal": Object {
                    "Service": "sns.amazonaws.com",
                  },
                  "Resource": Object {
                    "Fn::GetAtt": Array [
                      "MailDogDeadLetterQueueAE7B460C",
                      "Arn",
                    ],
                  },
                },
              ],
              "Version": "2012-10-17",
            },
            "Queues": Array [
              Object {
                "Ref": "MailDogDeadLetterQueueAE7B460C",
              },
            ],
          },
          "Type": "AWS::SQS::QueuePolicy",
        },
        "MailDogDispatcherAllowInvokeExampleStackMailDogMailFeedC9BE96BA67756E55": Object {
          "Properties": Object {
            "Action": "lambda:InvokeFunction",
            "FunctionName": Object {
              "Fn::GetAtt": Array [
                "MailDogDispatcherC9E0EA30",
                "Arn",
              ],
            },
            "Principal": "sns.amazonaws.com",
            "SourceArn": Object {
              "Ref": "MailDogMailFeed65FBE969",
            },
          },
          "Type": "AWS::Lambda::Permission",
        },
        "MailDogDispatcherC9E0EA30": Object {
          "DependsOn": Array [
            "MailDogDispatcherServiceRoleDefaultPolicyBC1AC442",
            "MailDogDispatcherServiceRole0FFAAEAE",
          ],
          "Properties": Object {
            "Code": Object {
              "S3Bucket": Object {
                "Ref": "AssetParameters494acd5c01f80cc8ffc56aa2d98c4ebc615edd4d16f323abe528f13fb9696e65S3BucketCA91D5FE",
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
                              "Ref": "AssetParameters494acd5c01f80cc8ffc56aa2d98c4ebc615edd4d16f323abe528f13fb9696e65S3VersionKeyC9B93B70",
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
                              "Ref": "AssetParameters494acd5c01f80cc8ffc56aa2d98c4ebc615edd4d16f323abe528f13fb9696e65S3VersionKeyC9B93B70",
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
                  "MailDogDeadLetterQueueAE7B460C",
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
                "MailDogDispatcherServiceRole0FFAAEAE",
                "Arn",
              ],
            },
            "Runtime": "nodejs14.x",
            "Timeout": 5,
          },
          "Type": "AWS::Lambda::Function",
        },
        "MailDogDispatcherMailDogMailFeed25151053": Object {
          "Properties": Object {
            "Endpoint": Object {
              "Fn::GetAtt": Array [
                "MailDogDispatcherC9E0EA30",
                "Arn",
              ],
            },
            "Protocol": "lambda",
            "RedrivePolicy": Object {
              "deadLetterTargetArn": Object {
                "Fn::GetAtt": Array [
                  "MailDogDeadLetterQueueAE7B460C",
                  "Arn",
                ],
              },
            },
            "TopicArn": Object {
              "Ref": "MailDogMailFeed65FBE969",
            },
          },
          "Type": "AWS::SNS::Subscription",
        },
        "MailDogDispatcherServiceRole0FFAAEAE": Object {
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
        "MailDogDispatcherServiceRoleDefaultPolicyBC1AC442": Object {
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
                            "MailDogBucketA54A602D",
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
                      "MailDogDeadLetterQueueAE7B460C",
                      "Arn",
                    ],
                  },
                },
              ],
              "Version": "2012-10-17",
            },
            "PolicyName": "MailDogDispatcherServiceRoleDefaultPolicyBC1AC442",
            "Roles": Array [
              Object {
                "Ref": "MailDogDispatcherServiceRole0FFAAEAE",
              },
            ],
          },
          "Type": "AWS::IAM::Policy",
        },
        "MailDogMailFeed65FBE969": Object {
          "Type": "AWS::SNS::Topic",
        },
        "MailDogReceiptRuleSetC2DA2BC6": Object {
          "DeletionPolicy": "Delete",
          "Type": "AWS::SES::ReceiptRuleSet",
          "UpdateReplacePolicy": "Delete",
        },
        "MailDogReceiptRuleSetDropSpamRule0A4E4508": Object {
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
              "Ref": "MailDogReceiptRuleSetC2DA2BC6",
            },
          },
          "Type": "AWS::SES::ReceiptRule",
        },
        "MailDogReceiptRuleSetRule09B7EE5C7": Object {
          "DependsOn": Array [
            "MailDogBucketPolicy55ED7577",
          ],
          "Properties": Object {
            "Rule": Object {
              "Actions": Array [
                Object {
                  "S3Action": Object {
                    "BucketName": Object {
                      "Ref": "MailDogBucketA54A602D",
                    },
                    "ObjectKeyPrefix": "emails/",
                    "TopicArn": Object {
                      "Ref": "MailDogMailFeed65FBE969",
                    },
                  },
                },
              ],
              "Enabled": true,
            },
            "RuleSetName": Object {
              "Ref": "MailDogReceiptRuleSetC2DA2BC6",
            },
          },
          "Type": "AWS::SES::ReceiptRule",
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
