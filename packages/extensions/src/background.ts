import { config, decrypt, readMessage } from 'openpgp/lightweight';
import { browser } from 'webextension-polyfill-ts';
import {
  Status,
  Config,
  GET_STATUS_EVENT,
  SELECT_REPOSITORY_EVENT,
  SAVE_PASSPHRASE_EVENT,
  RESET_EVENT,
} from './types';

interface Context {
  repository: string | null;
  passpharse: string | null;
  config: any;
}

type Event =
  | GET_STATUS_EVENT
  | SELECT_REPOSITORY_EVENT
  | SAVE_PASSPHRASE_EVENT
  | RESET_EVENT;

async function request<T>(path: string): T {
  const response = await fetch(
    `${process.env.WEB_URL ?? 'http://localhost:3000'}${path}`,
  );
  const body = await response.json();
  const { data, error } = body ?? {};

  if (!response.ok) {
    throw new Error(error?.message ?? response.statusText);
  }

  return data;
}

async function getStatus(
  context: Context,
  event: GET_STATUS_EVENT,
): Promise<Status | null> {
  console.log('getStatus', JSON.stringify(context));

  try {
    const { repos: options } = await request<{ repos: string[] }>(
      '/api/session',
    );

    if (context.repository === null) {
      context.repository = options[0];
    }

    let configByDomain: Record<string, Config> | null = null;
    let emails: string[] = [];

    if (context.config) {
      configByDomain = Object.fromEntries(
        Object.keys(context.config.domains).map<[string, Config]>((domain) => [
          domain,
          { recipents: [] },
        ]),
      );
    }

    return {
      repository: context.repository,
      options,
      configByDomain,
      emails,
    };
  } catch (e) {
    if (e.message === 'Unauthorized') {
      return null;
    }

    throw e;
  }
}

async function selectRepository(
  context: Context,
  { repo }: SELECT_REPOSITORY_EVENT,
): Promise<void> {
  console.log('selectRepository', JSON.stringify(context));
  if (repo === context.repository) {
    return;
  }

  context.repository = repo;
  context.passpharse = null;
  context.config = null;
}

async function savePassphase(
  context: Context,
  { passphrase }: SAVE_PASSPHRASE_EVENT,
): Promise<void> {
  console.log('savePassphase', JSON.stringify(context));
  if (context.repository === null) {
    return;
  }

  context.passpharse = passphrase;

  try {
    const [owner, repo] = context.repository.split('/');
    const searchParams = new URLSearchParams([
      ['owner', owner],
      ['repo', repo],
    ]);
    const file = await request<{ encoding: string; content: string }>(
      `/api/config?${searchParams.toString()}`,
    );

    if (file.encoding !== 'base64') {
      throw new Error(`Unexpected file encoding: ${file.encoding} returned`);
    }

    const encryptedMessage = await readMessage({
      armoredMessage: atob(file.content),
    });
    const { data } = await decrypt({
      message: encryptedMessage,
      passwords: [context.passpharse],
    });
    const config = JSON.parse(data);

    context.config = config;
  } catch (error) {
    console.log('[Error] Failed to retrieve config from Github', error);

    throw error;
  }
}

async function reset(context): Promise<void> {
  console.log('reset', JSON.stringify(context));

  Object.assign(context, {
    repository: null,
    passpharse: null,
    config: null,
  });
}

function main() {
  let context: Context = {
    repository: null,
    passpharse: null,
    config: null,
  };

  browser.runtime.onMessage.addListener((event: Event, sender) => {
    switch (event.type) {
      case 'GET_STATUS':
        return getStatus(context, event);
      case 'SELECT_REPOSITORY':
        return selectRepository(context, event);
      case 'SAVE_PASSPHRASE':
        return savePassphase(context, event);
      case 'RESET':
        return reset(context, event);
      default:
        return;
    }
  });
}

main();
