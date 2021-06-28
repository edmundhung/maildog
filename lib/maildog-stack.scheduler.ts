import {
  SQSHandler,
  SQSEvent,
  SQSRecord,
  SNSEvent,
  SNSEventRecord,
  SESMessage,
} from 'aws-lambda';
import { SQS, SNS } from 'aws-sdk';

type Event = SQSEvent | SNSEvent;

function isSESMessage(message: any): message is SESMessage {
  return (
    message &&
    typeof message.mail !== 'undefined' &&
    typeof message.receipt !== 'undefined'
  );
}

function isEvent(event: any): event is Event {
  return event && Array.isArray(event.Records);
}

function isSNSRecord(record: any): record is SNSEventRecord {
  return record.EventSource === 'aws:sns';
}

function isSQSRecord(record: any): record is SQSRecord {
  return record.eventSource === 'aws:sqs';
}

function parseRecord(record: SNSEventRecord | SQSRecord): SESMessage | null {
  let content: string;

  try {
    if (isSNSRecord(record)) {
      content = record.Sns.Message;
    } else if (isSQSRecord(record)) {
      content = record.body;
    } else {
      throw new Error('Unknown record found');
    }
  } catch (e) {
    console.log({
      level: 'error',
      message: e.message,
      record: JSON.stringify(record),
    });

    throw e;
  }

  return parseMessage(content);
}

function parseMessage(content: string): SESMessage | null {
  let message;

  try {
    message = JSON.parse(content);
  } catch (e) {
    console.log({
      level: 'error',
      message: e.message,
      record: JSON.stringify(content),
    });
    return null;
  }

  if (isSESMessage(message)) {
    return message;
  }

  if (!isEvent(message) || message.Records.length !== 1) {
    console.log({
      level: 'error',
      message: 'Unknown content inside event record',
      content: JSON.stringify(content),
    });
    return null;
  }

  return parseRecord(message.Records[0]);
}

async function getMessages(sqs: SQS): Promise<SQS.Message[]> {
  let messages: SQS.Message[] = [];

  do {
    const result = await sqs
      .receiveMessage({
        QueueUrl: process.env.SQS_QUEUE_URL ?? '',
        MessageAttributeNames: ['retry'],
        MaxNumberOfMessages: 10,
      })
      .promise();

    messages = messages.concat(result.Messages ?? []);

    if (!result.Messages || result.Messages.length < 10) {
      break;
    }
  } while (true);

  return messages;
}

async function publishMessages(
  sns: SNS,
  messages: SQS.Message[],
): Promise<[SQS.Message[], SQS.Message[]]> {
  const successful: SQS.Message[] = [];
  const unsuccessful: SQS.Message[] = [];
  const result = await Promise.allSettled(
    messages.map(async (m) => {
      if (!m.ReceiptHandle) {
        throw new Error('Invalid message received');
      }

      const sesMessage = parseMessage(m.Body ?? '');

      if (!sesMessage) {
        throw new Error('Unknown message found');
      }

      await sns
        .publish({
          TopicArn: process.env.SNS_TOPIC_ARN ?? '',
          Message: JSON.stringify(sesMessage),
          MessageAttributes: {
            retry: {
              DataType: 'String',
              StringValue: ([] as string[])
                .concat(
                  m.MessageAttributes?.retry?.StringValue ?? [],
                  new Date().toISOString(),
                )
                .join(','),
            },
          },
        })
        .promise();
    }),
  );

  try {
    for (let i = 0; i < result.length; i++) {
      switch (result[i].status) {
        case 'fulfilled':
          successful.push(messages[i]);
          break;
        case 'rejected':
          unsuccessful.push(messages[i]);
          break;
      }
    }
  } catch (e) {
    console.log({
      level: 'error',
      message: `Unknown exception caught after publishing messages: ${e.message}. `,
      error: JSON.stringify(e),
      result: JSON.stringify(result),
    });

    throw e;
  }

  return [successful, unsuccessful];
}

async function deleteMessages(
  sqs: SQS,
  messages: SQS.Message[],
): Promise<void> {
  const result = await sqs
    .deleteMessageBatch({
      QueueUrl: process.env.SQS_QUEUE_URL ?? '',
      Entries: messages.map<SQS.DeleteMessageBatchRequestEntry>((m) => ({
        Id: m.MessageId ?? '',
        ReceiptHandle: m.ReceiptHandle ?? '',
      })),
    })
    .promise();

  if (result.Failed.length > 0) {
    console.log({
      level: 'error',
      message: 'Delete messages failed',
      details: JSON.stringify(result.Failed),
    });

    throw new Error('Delete messages failed');
  }
}

export const handler: SQSHandler = async () => {
  const sqs = new SQS();
  const sns = new SNS();
  const messages = await getMessages(sqs);
  const [successful, unsuccessful] = await publishMessages(sns, messages);

  if (unsuccessful.length > 0) {
    if (successful.length > 0) {
      await deleteMessages(sqs, successful);
    }

    throw new Error(
      'Publishing messages from DLQ fails; Please refer to logs for details',
    );
  }
};
