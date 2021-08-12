import { browser } from 'webextension-polyfill-ts';
import {
  Session,
  GET_SESSION_EVENT,
  LOGIN_EVENT,
  LOGOUT_EVENT,
  UNLOCK_EVENT,
  ASSIGN_NEW_EMAIL_EVENT,
} from '../types';

export async function getSession(): Promise<Session | null> {
  const message: GET_SESSION_EVENT = {
    type: 'GET_SESSION',
  };
  const status = await browser.runtime.sendMessage(message);

  return status;
}

export async function login(): Promise<void> {
  const message: LOGIN_EVENT = {
    type: 'LOGIN',
  };

  await browser.runtime.sendMessage(message);
}

export async function logout(): Promise<void> {
  const message: LOGOUT_EVENT = {
    type: 'LOGOUT',
  };

  await browser.runtime.sendMessage(message);
}

export async function unlock(
  repository: string,
  passphrase: string,
): Promise<void> {
  const message: UNLOCK_EVENT = {
    type: 'UNLOCK',
    repository,
    passphrase,
  };

  await browser.runtime.sendMessage(message);
}

export async function assignNewEmail(domain: string): Promise<string> {
  const message: ASSIGN_NEW_EMAIL_EVENT = {
    type: 'ASSIGN_NEW_EMAIL',
    domain,
  };
  const email = await browser.runtime.sendMessage(message);

  return email;
}
