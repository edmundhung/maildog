import { browser } from 'webextension-polyfill-ts';
import {
  GET_STATUS_EVENT,
  SAVE_PASSPHRASE_EVENT,
  SELECT_REPOSITORY_EVENT,
  RESET_EVENT,
  Status,
} from '../types';

export async function getStatus(): Promise<Status | null> {
  const message: GET_STATUS_EVENT = {
    type: 'GET_STATUS',
  };
  const status = await browser.runtime.sendMessage(message);

  return status;
}
export async function selectRepository(repo: string): Promise<void> {
  const message: SELECT_REPOSITORY_EVENT = {
    type: 'SELECT_REPOSITORY',
    repo,
  };

  await browser.runtime.sendMessage(message);
}

export async function savePassphase(passphrase: string): Promise<void> {
  const message: SAVE_PASSPHRASE_EVENT = {
    type: 'SAVE_PASSPHRASE',
    passphrase,
  };

  await browser.runtime.sendMessage(message);
}

export async function reset(): Promise<void> {
  const message: RESET_EVENT = {
    type: 'RESET',
  };

  await browser.runtime.sendMessage(message);
}
