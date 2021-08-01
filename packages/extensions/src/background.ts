import { config, decrypt, readMessage } from 'openpgp/lightweight';
import { browser } from 'webextension-polyfill-ts';
import { Status, Config, GET_STATUS_EVENT } from './types';

interface Context {
  repository: string | null;
  passpharse: string | null;
  config: any;
}

type Event = GET_STATUS_EVENT;

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
      default:
        return;
    }
  });
}

main();
