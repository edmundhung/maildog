import { config, decrypt, readMessage } from 'openpgp/lightweight';
import { browser, Tabs } from 'webextension-polyfill-ts';
import { Session, Config } from '../types';

export async function request<T>(path: string): Promise<T> {
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

export async function getOptions(): Promise<string[]> {
  const { repos } = await request<{ repos: string[] }>('/api/session');

  return repos;
}

export async function getConfig(
  repository: string,
  passphrase: string,
): Promise<any> {
  const [owner, repo] = repository.split('/');
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
    passwords: [passphrase],
  });

  return JSON.parse(data);
}

export async function openPageInBackground(path: string): Promise<Tabs.Tab> {
  const backgroundTab = await browser.tabs.create({
    url: `${process.env.WEB_URL ?? 'http://localhost:3000'}${path}`,
    active: false,
  });

  return new Promise((resolve) => {
    function listener(
      tabId: number,
      changeInfo: Tabs.OnUpdatedChangeInfoType,
      tab: Tabs.Tab,
    ): void {
      if (tabId !== backgroundTab.id || changeInfo.status !== 'complete') {
        return;
      }

      resolve(tab);
      browser.tabs.onUpdated.removeListener(listener);
    }

    browser.tabs.onUpdated.addListener(listener);
  });
}

export async function login(): Promise<void> {
  const tab = await openPageInBackground('/login');

  if (!tab.url) {
    browser.tabs.update(tab.id, { active: true });
    return;
  }

  browser.tabs.remove(tab.id);
}

export async function logout(): Promise<void> {
  const tab = await openPageInBackground('/logout');

  browser.tabs.remove(tab.id);
}

export async function updateContextMenu(
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

export function getSession(context: Context): Session {
  return {
    repository: context.repository,
    configByDomain: deriveConfigByDomain(context.config),
    emails: lookupEmails(context.config, context.activeTabUrl),
    options: context.options,
  };
}

export function lookupEmails(config: any, currentUrl: string | null): string[] {
  if (config === null || currentUrl === null) {
    return [];
  }

  const url = new URL(currentUrl);

  return Object.entries(config.domains).flatMap(([domain, config]) =>
    Object.entries(config.alias ?? {})
      .filter(([_, rule]) => (rule.website as string).endsWith(url.host))
      .map(([prefix]) => `${prefix}@${domain}`),
  );
}

export function getEmailsByDomain(domains: string[], emails: string[]) {
  return emails.reduce((result, email) => {
    const domain = email.slice(email.indexOf('@') + 1);
    const emails = result[domain] ?? [];

    emails.push(email);
    result[domain] = emails;

    return result;
  }, Object.fromEntries(domains.map<[string, string[]]>((domain) => [domain, []])));
}

export function deriveConfigByDomain(
  config: any,
): Record<string, Config> | null {
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
