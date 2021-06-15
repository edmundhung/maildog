import { SESHandler } from 'aws-lambda';
import LambdaForwarder from 'aws-lambda-ses-forwarder';

export const handler: SESHandler = (event, context, callback) => {
  const config = process.env.CONFIG ?? {};
  const overrides = {
    config: {
      ...config,
      emailBucket: process.env.EMAIL_BUCKET,
    },
  };

  LambdaForwarder.handler(event, context, callback, overrides);
};
