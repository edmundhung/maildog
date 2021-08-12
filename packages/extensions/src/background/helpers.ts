import {
  encrypt,
  decrypt,
  createMessage,
  readMessage,
} from 'openpgp/lightweight';
import { browser, Tabs } from 'webextension-polyfill-ts';
import { copyText } from '../utils';
import { Session, Config } from '../types';

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(
    `${process.env.WEB_URL ?? 'http://localhost:3000'}${path}`,
    init,
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

export async function decryptConfig(
  encryptedConfig: string,
  passphrase: string,
): Promise<string> {
  const encryptedMessage = await readMessage({
    armoredMessage: encryptedConfig,
  });
  const { data } = await decrypt({
    message: encryptedMessage,
    passwords: [passphrase],
  });

  return JSON.parse(data);
}

export async function encryptConfig(
  config: any,
  passphrase: string,
): Promise<string> {
  const message = await createMessage({
    text: JSON.stringify(config, null, 2),
  });
  const encrypted = await encrypt({
    message,
    passwords: [passphrase],
    format: 'armored',
  });

  return encrypted;
}

export async function getConfig(
  repository: string,
  passphrase: string,
): Promise<[any, string]> {
  const file = await request<{
    encoding: string;
    content: string;
    sha: string;
  }>(`/api/${repository}/config`);

  if (file.encoding !== 'base64') {
    throw new Error(`Unexpected file encoding: ${file.encoding} returned`);
  }

  const config = await decryptConfig(atob(file.content), passphrase);

  return [config, file.sha];
}

export async function saveConfig(
  repository: string,
  passphrase: string,
  config: any,
  sha: string,
): Promise<string> {
  const encryptedConfig = await encryptConfig(config, passphrase);
  const updatedSha = await request(`/api/${repository}/config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sha,
      content: btoa(encryptedConfig),
    }),
  });

  return updatedSha;
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
  onAssignNewEmail: (domain: string) => void,
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
        contexts: ['all'],
      });
    } else {
      browser.contextMenus.create({
        id: `maildog-${domain}`,
        title: `maildog (${domain})`,
        contexts: ['all'],
      });
    }

    emails.forEach((email) => {
      browser.contextMenus.create({
        id: `maildog-${domain}-${email}`,
        parentId: `maildog-${domain}`,
        title: email,
        contexts: ['all'],
        onclick: () => copyText(email),
      });
    });

    browser.contextMenus.create({
      id: `maildog-${domain}-seperator`,
      parentId: `maildog-${domain}`,
      type: 'separator',
      contexts: ['all'],
    });

    browser.contextMenus.create({
      id: `maildog-${domain}-new`,
      parentId: `maildog-${domain}`,
      title: 'Generate email address',
      contexts: ['all'],
      onclick: () => onAssignNewEmail(domain),
    });
  }
}

export function generateNewEmail(domain: string): string {
  return `${Math.random().toString(36).slice(2)}@${domain}`;
}

export function getSession(context: Context): Session {
  return {
    repository: context.repository,
    configByDomain: deriveConfigByDomain(context.config),
    emails: lookupEmails(context.config, context.activeTabUrl),
    options: context.options,
  };
}

export function matchHost(host: string, website: string | undefined): boolean {
  if (!website) {
    return false;
  }

  try {
    return new URL(website).host === host;
  } catch (e) {
    return false;
  }
}

export function lookupEmails(config: any, currentUrl: string | null): string[] {
  if (config === null || currentUrl === null) {
    return [];
  }

  const url = new URL(currentUrl);

  return Object.entries(config.domains).flatMap(([domain, config]) =>
    Object.entries(config.alias ?? {})
      .filter(([_, rule]) => matchHost(url.host, rule.website))
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

export async function getActiveTab(): Promise<Tabs.Tab> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  return tab;
}
