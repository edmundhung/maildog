import { config, decrypt, readMessage } from 'openpgp/lightweight';
import { browser, Tabs } from 'webextension-polyfill-ts';
import {
  Status,
  Config,
  GET_STATUS_EVENT,
  SELECT_REPOSITORY_EVENT,
  SAVE_PASSPHRASE_EVENT,
  RESET_EVENT,
} from './types';

interface Context {
  activeTabHost: string | null;
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

    return {
      repository: context.repository,
      configByDomain: deriveConfigByDomain(context.config),
      emails: lookupEmails(context.config, context.activeTabHost),
      options,
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

  await refreshData(context);
}

async function reset(context): Promise<void> {
  console.log('reset', JSON.stringify(context));

  Object.assign(context, {
    repository: null,
    passpharse: null,
    config: null,
  });
}

async function updateActiveTab(context: Context, tab: Tabs.Tab): Promise<void> {
  if (!tab.url) {
    return;
  }

  const url = new URL(tab.url);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  context.activeTabHost = url.host;

  await refreshData(context);
}

async function refreshData(context: Context): Promise<void> {
  const domains = Object.keys(context.config.domains);
  const emails = lookupEmails(context.config, context.activeTabHost);
  const emailsByDomain = getEmailsByDomain(domains, emails);

  await browser.browserAction.setBadgeText({
    text: emails.length > 0 ? `${emails.length}` : '',
  });

  await updateContextMenu(emailsByDomain);
}

async function updateContextMenu(
  emailsByDomain: Record<string, string[]>,
): Promise<void> {
  await browser.contextMenus.removeAll();

  const list = Object.entries(emailsByDomain);

  if (list.length === 0) {
    return;
  }

  if (list.length > 1) {
    browser.contextMenus.create({
      id: 'maildog',
      title: 'maildog',
      contexts: ['all'],
    });
  }

  for (const [domain, emails] of list) {
    if (list.length > 1) {
      browser.contextMenus.create({
        id: `maildog-${domain}`,
        parentId: 'maildog',
        title: domain,
      });
    } else {
      browser.contextMenus.create({
        id: `maildog-${domain}`,
        title: `maildog (${domain})`,
      });
    }

    for (const email of emails) {
      browser.contextMenus.create({
        id: `maildog-${domain}-${email}`,
        parentId: `maildog-${domain}`,
        title: email,
      });
    }

    browser.contextMenus.create({
      id: `maildog-${domain}-new`,
      parentId: `maildog-${domain}`,
      title: 'Generate email address',
    });
  }
}

function lookupEmails(config: any, host: string | null): string[] {
  if (config === null || host === null) {
    return [];
  }

  return Object.entries(config.domains).flatMap(([domain, config]) =>
    Object.entries(config.alias ?? {})
      .filter(([_, rule]) => (rule.website as string).endsWith(host))
      .map(([prefix]) => `${prefix}@${domain}`),
  );
}

function getEmailsByDomain(domains: string[], emails: string[]) {
  return emails.reduce((result, email) => {
    const domain = email.slice(email.indexOf('@') + 1);
    const emails = result[domain] ?? [];

    emails.push(email);
    result[domain] = emails;

    return result;
  }, Object.fromEntries(domains.map<[string, string[]]>((domain) => [domain, []])));
}

function deriveConfigByDomain(config: any): Record<string, Config> | null {
  if (config === null) {
    return null;
  }

  return Object.fromEntries(
    Object.keys(config.domains).map<[string, Config]>((domain) => [
      domain,
      { recipents: [] },
    ]),
  );
}

function main() {
  let activeTabId: number | null = null;
  let context: Context = {
    activeTabHost: null,
    repository: null,
    passpharse: null,
    config: null,
  };

  browser.browserAction.setBadgeBackgroundColor({ color: '#537780' });

  browser.tabs.onActivated.addListener(async (activeInfo) => {
    activeTabId = activeInfo.tabId;

    const tab = await browser.tabs.get(activeInfo.tabId);

    await updateActiveTab(context, tab);
  });

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (activeTabId !== tabId) {
      return;
    }

    await (context, tab);
  });

  browser.runtime.onMessage.addListener((event: Event) => {
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
