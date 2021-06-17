import { SNSHandler, SESEventRecord } from 'aws-lambda';
import LambdaForwarder from 'aws-lambda-ses-forwarder';

export const handler: SNSHandler = (event, context, callback) => {
  const config = process.env.CONFIG ?? {};
  const overrides = {
    config: {
      ...config,
      emailBucket: process.env.EMAIL_BUCKET,
    },
  };

  // Simulate SES Event so we can utilise aws-lambda-ses-forwarder for now
  // Based on documentation from
  // https://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email-notifications-contents.html#receiving-email-notifications-contents-top-level-json-object
  const sesEvent = {
    Records: event.Records.map<SESEventRecord>((r) => {
      if (r.EventSource !== 'aws:sns') {
        callback(
          new Error(
            'Invalid event received; Only SNS Event is expected at the moment',
          ),
        );
      }

      const { mail, receipt } = JSON.parse(r.Sns.Message);

      return {
        eventSource: 'aws:ses',
        eventVersion: '1.0',
        ses: {
          mail,
          receipt,
        },
      };
    }),
  };

  LambdaForwarder.handler(sesEvent, context, callback, overrides);
};
