import {
  expect as expectStack,
  SynthUtils,
  haveResource,
  countResources,
  objectLike,
  arrayWith,
} from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { MailDogStack } from '../lib/maildog-stack';

describe('MailDogStack', () => {
  let spy: jest.SpyInstance<void, Parameters<typeof console.warn>>;

  beforeEach(() => {
    spy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('should match the snapshot', () => {
    const app = new cdk.App();
    const stack = new MailDogStack(app, 'ExampleStack', {
      config: {
        domains: {
          'example.com': {
            fallbackEmails: ['example@gmail.com'],
          },
          'maildog.xyz': {
            enabled: true,
            fromEmail: 'maildog',
            scanEnabled: true,
            tlsEnforced: true,
            fallbackEmails: [],
            alias: {
              foo: {
                to: ['example@gmail.com'],
              },
              bar: {
                description: 'Optional description',
                to: ['baz@mail.com', 'bar@example.com'],
              },
              baz: {},
            },
          },
        },
      },
    });

    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });

  it('should set the ReceiptRuleSet name based on the stackName', () => {
    const createMaildogStack = (stackName?: string) => {
      const app = new cdk.App();
      const stack = new MailDogStack(app, 'ExampleStack', {
        config: {
          domains: {
            'example.com': {
              fallbackEmails: ['foo@exmaple.com', 'bar@example.com'],
            },
          },
        },
        stackName,
      });

      return stack;
    };

    expectStack(createMaildogStack()).to(
      haveResource('AWS::SES::ReceiptRuleSet', {
        RuleSetName: 'MailDog-ReceiptRuleSet',
      }),
    );
    expectStack(createMaildogStack('Foo-bar')).to(
      haveResource('AWS::SES::ReceiptRuleSet', {
        RuleSetName: 'Foo-bar-ReceiptRuleSet',
      }),
    );
  });

  it('should setup the ReceiptRule based on the config', () => {
    const app = new cdk.App();
    const stack = new MailDogStack(app, 'ExampleStack', {
      config: {
        domains: {
          'maildog.dev': {
            fallbackEmails: ['foo@example.com'],
            alias: {
              foo: {
                description: 'Something here',
                to: ['foobar@maildog.example.com'],
              },
            },
          },
          'testing.maildog.dev': {
            enabled: true,
            fromEmail: 'notifications',
            scanEnabled: true,
            tlsEnforced: true,
            fallbackEmails: [],
            alias: {
              foo: {
                description: 'Testing',
                to: ['bar@example.com', 'baz@example.com'],
              },
              bar: {
                to: [],
              },
              baz: {
                description: 'No to',
              },
            },
          },
          'example.com': {
            alias: Object.fromEntries(
              [...Array(101).keys()].map((i) => [
                `${i + 1}`,
                {
                  to: [`${i + 1}@maildog.dev`],
                },
              ]),
            ),
          },
        },
      },
    });

    expectStack(stack).to(countResources('AWS::SES::ReceiptRule', 4));
    expectStack(stack).to(
      haveResource('AWS::SES::ReceiptRule', {
        Rule: objectLike({
          Actions: arrayWith({
            S3Action: objectLike({
              ObjectKeyPrefix: 'maildog.dev/',
            }),
          }),
          Enabled: true,
          ScanEnabled: true,
          TlsPolicy: 'Optional',
          Recipients: ['maildog.dev'],
        }),
      }),
    );
    expectStack(stack).to(
      haveResource('AWS::SES::ReceiptRule', {
        Rule: objectLike({
          Actions: arrayWith({
            S3Action: objectLike({
              ObjectKeyPrefix: 'testing.maildog.dev/',
            }),
          }),
          Enabled: true,
          ScanEnabled: true,
          TlsPolicy: 'Require',
          Recipients: ['foo@testing.maildog.dev'],
        }),
      }),
    );
    expectStack(stack).to(
      haveResource('AWS::SES::ReceiptRule', {
        Rule: objectLike({
          Actions: arrayWith({
            S3Action: objectLike({
              ObjectKeyPrefix: 'example.com/',
            }),
          }),
          Enabled: true,
          ScanEnabled: true,
          TlsPolicy: 'Optional',
          Recipients: [...Array(100).keys()].map((i) => `${i + 1}@example.com`),
        }),
      }),
    );
    expectStack(stack).to(
      haveResource('AWS::SES::ReceiptRule', {
        Rule: objectLike({
          Actions: arrayWith({
            S3Action: objectLike({
              ObjectKeyPrefix: 'example.com/',
            }),
          }),
          Enabled: true,
          ScanEnabled: true,
          TlsPolicy: 'Optional',
          Recipients: ['101@example.com'],
        }),
      }),
    );
  });
});
