import {
  SNSHandler,
  SNSEvent,
  SESEvent,
  SESMessage,
  SESReceiptS3Action,
} from 'aws-lambda';
import LambdaForwarder from 'aws-lambda-ses-forwarder';

function isSESMessage(message: any): message is SESMessage {
  return (
    typeof message.mail !== 'undefined' &&
    typeof message.receipt !== 'undefined'
  );
}

function isSESReceiptS3Action(
  action: SESMessage['receipt']['action'],
): action is SESReceiptS3Action {
  return (
    action.type === 'S3' &&
    typeof action.objectKey !== 'undefined' &&
    typeof action.bucketName !== 'undefined'
  );
}

function getSESMessage(event: SNSEvent): SESMessage {
  if (event.Records.length !== 1) {
    throw new Error(
      'Dispatcher can only handle 1 record at a time; Please verify if the setup is correct',
    );
  }

  const [record] = event.Records;

  if (record.EventSource !== 'aws:sns') {
    throw new Error(
      `Unexpected event source: ${record.EventSource}; Only SNS Event is accepted at the moment`,
    );
  }

  const message = JSON.parse(record.Sns.Message);

  if (!isSESMessage(message)) {
    throw new Error(
      `Unexpected message received: ${record.Sns.Message}; Only SES Message is accepted at the moment`,
    );
  }

  return message;
}

export const handler: SNSHandler = (event, context, callback) => {
  let message: SESMessage;

  try {
    message = getSESMessage(event);

    if (!isSESReceiptS3Action(message.receipt.action)) {
      throw new Error(
        'The event is not triggered by S3 action; Please verify if the setup is correct',
      );
    }
  } catch (e) {
    console.log({
      level: 'error',
      message: e.message,
      event: JSON.stringify(event),
    });
    throw e;
  }

  const emailKeyPrefix = message.receipt.action.objectKey.replace(
    message.mail.messageId,
    '',
  );
  const emailBucket = message.receipt.action.bucketName;
  const config = process.env.CONFIG ?? {};
  const overrides = {
    config: {
      ...config,
      emailKeyPrefix,
      emailBucket,
    },
  };

  // Simulate SES Event so we can utilise aws-lambda-ses-forwarder for now
  // Based on documentation from
  // https://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email-notifications-contents.html#receiving-email-notifications-contents-top-level-json-object
  const sesEvent: SESEvent = {
    Records: [
      {
        eventSource: 'aws:ses',
        eventVersion: '1.0',
        ses: message,
      },
    ],
  };

  LambdaForwarder.handler(sesEvent, context, callback, overrides);
};
