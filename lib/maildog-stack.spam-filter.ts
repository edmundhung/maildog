import { SESEvent } from 'aws-lambda';

// Based on Example 1: Drop spam
// From https://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email-action-lambda-example-functions.html
export async function handler(
  event: SESEvent,
): Promise<{ disposition: 'STOP_RULE_SET' } | null> {
  console.log('Spam filter');

  const sesNotification = event.Records[0].ses;
  console.log('SES Notification:\n', JSON.stringify(sesNotification, null, 2));

  // Check if any spam check failed
  if (
    sesNotification.receipt.spfVerdict.status === 'FAIL' ||
    sesNotification.receipt.dkimVerdict.status === 'FAIL' ||
    sesNotification.receipt.spamVerdict.status === 'FAIL' ||
    sesNotification.receipt.virusVerdict.status === 'FAIL'
  ) {
    console.log('Dropping spam');
    // Stop processing rule set, dropping message
    return { disposition: 'STOP_RULE_SET' };
  } else {
    return null;
  }
}
