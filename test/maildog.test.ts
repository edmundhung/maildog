import { SynthUtils } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { MailDogStack } from '../lib/maildog-stack';

test('Stack Snapshot', () => {
  const app = new cdk.App();
  const stack = new MailDogStack(app, 'ExampleStack', {
    config: {
      domain: 'example.com',
      emailKeyPrefix: 'test/',
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
    "AssetParameters9b6c65ae295dd8e7cf62d1cba26b8cc5830052b5d72926522f339e93ed095c0aArtifactHashD1F7BEF3": Object {
      "Description": "Artifact hash for asset \\"9b6c65ae295dd8e7cf62d1cba26b8cc5830052b5d72926522f339e93ed095c0a\\"",
      "Type": "String",
    },
    "AssetParameters9b6c65ae295dd8e7cf62d1cba26b8cc5830052b5d72926522f339e93ed095c0aS3Bucket983AD781": Object {
      "Description": "S3 bucket for asset \\"9b6c65ae295dd8e7cf62d1cba26b8cc5830052b5d72926522f339e93ed095c0a\\"",
      "Type": "String",
    },
    "AssetParameters9b6c65ae295dd8e7cf62d1cba26b8cc5830052b5d72926522f339e93ed095c0aS3VersionKey4F185602": Object {
      "Description": "S3 key for asset version \\"9b6c65ae295dd8e7cf62d1cba26b8cc5830052b5d72926522f339e93ed095c0a\\"",
      "Type": "String",
    },
  },
  "Resources": Object {
    "MailDogBucketA54A602D": Object {
      "DeletionPolicy": "Retain",
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
                    "/test/*",
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
    "MailDogDispatcherAllowSesBDD67581": Object {
      "Properties": Object {
        "Action": "lambda:InvokeFunction",
        "FunctionName": Object {
          "Fn::GetAtt": Array [
            "MailDogDispatcherC9E0EA30",
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
    "MailDogDispatcherC9E0EA30": Object {
      "DependsOn": Array [
        "MailDogDispatcherServiceRole0FFAAEAE",
      ],
      "Properties": Object {
        "Code": Object {
          "S3Bucket": Object {
            "Ref": "AssetParameters9b6c65ae295dd8e7cf62d1cba26b8cc5830052b5d72926522f339e93ed095c0aS3Bucket983AD781",
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
                          "Ref": "AssetParameters9b6c65ae295dd8e7cf62d1cba26b8cc5830052b5d72926522f339e93ed095c0aS3VersionKey4F185602",
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
                          "Ref": "AssetParameters9b6c65ae295dd8e7cf62d1cba26b8cc5830052b5d72926522f339e93ed095c0aS3VersionKey4F185602",
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
            "EMAIL_BUCKET": Object {
              "Ref": "MailDogBucketA54A602D",
            },
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
    "MailDogPolicy5A750D20": Object {
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
          ],
          "Version": "2012-10-17",
        },
        "PolicyName": "MailDogPolicy5A750D20",
        "Roles": Array [
          Object {
            "Ref": "MailDogDispatcherServiceRole0FFAAEAE",
          },
        ],
      },
      "Type": "AWS::IAM::Policy",
    },
    "MailDogReceiptRuleSetC2DA2BC6": Object {
      "Type": "AWS::SES::ReceiptRuleSet",
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
        "MailDogDispatcherAllowSesBDD67581",
      ],
      "Properties": Object {
        "Rule": Object {
          "Actions": Array [
            Object {
              "S3Action": Object {
                "BucketName": Object {
                  "Ref": "MailDogBucketA54A602D",
                },
                "ObjectKeyPrefix": "test/",
              },
            },
            Object {
              "LambdaAction": Object {
                "FunctionArn": Object {
                  "Fn::GetAtt": Array [
                    "MailDogDispatcherC9E0EA30",
                    "Arn",
                  ],
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
