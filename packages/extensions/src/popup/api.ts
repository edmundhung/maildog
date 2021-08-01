import { browser } from 'webextension-polyfill-ts';
import { GET_STATUS_EVENT, Status } from '../types';

export async function getStatus(): Promise<Status | null> {
  const message: GET_STATUS_EVENT = {
    type: 'GET_STATUS',
  };
  const status = await browser.runtime.sendMessage(message);

  return status;
}
