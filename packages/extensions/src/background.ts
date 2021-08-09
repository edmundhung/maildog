import { MachineConfig, createMachine, interpret, assign, State } from 'xstate';
import { config, decrypt, readMessage } from 'openpgp/lightweight';
import { browser, Tabs } from 'webextension-polyfill-ts';
import {
  Session,
  Config,
  GET_SESSION_EVENT,
  LOGIN_EVENT,
  LOGOUT_EVENT,
  UNLOCK_EVENT,
} from './types';

interface Context {
  activeTabId: number | null;
  activeTabUrl: string | null;
  repository: string | null;
  options: string[];
  passphrase: string | null;
  config: any | null;
}

type Message = GET_SESSION_EVENT | LOGIN_EVENT | LOGOUT_EVENT | UNLOCK_EVENT;

type Event = LOGIN_EVENT | LOGOUT_EVENT | UNLOCK_EVENT;

async function request<T>(path: string): Promise<T> {
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

async function getOptions(): Promise<string[]> {
  const { repos } = await request<{ repos: string[] }>('/api/session');

  return repos;
}

async function getConfig(repository: string, passphrase: string): Promise<any> {
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

async function openPageInBackground(path: string): Promise<Tabs.Tab> {
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

async function login(): Promise<void> {
  const tab = await openPageInBackground('/login');

  if (!tab.url) {
    browser.tabs.update(tab.id, { active: true });
    return;
  }

  browser.tabs.remove(tab.id);
}

async function logout(): Promise<void> {
  const tab = await openPageInBackground('/logout');

  browser.tabs.remove(tab.id);
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

const machineConfig: MachineConfig<Context, any, Event> = {
  id: 'maildog',
  context: {
    activeTabId: null,
    activeTabUrl: null,
    repository: null,
    options: [],
    passphrase: null,
    config: null,
  },
  on: {
    ACTIVATE_TAB: {
      actions: assign({
        activeTabId: (context, event) => event.tabId,
        activeTabUrl: (context, event) => event.tabUrl,
      }),
    },
    UPDATE_TAB: {
      actions: assign({
        activeTabUrl: (context, event) =>
          event.tabId === context.activeTabId
            ? event.tabUrl
            : context.activeTabUrl,
      }),
    },
  },
  initial: 'initializing',
  states: {
    unauthenticated: {
      on: { LOGIN: 'loggingIn' },
    },
    loggingIn: {
      invoke: {
        id: 'logging-in',
        src: () => login(),
        onDone: {
          target: 'initializing',
        },
        onError: 'unauthenticated',
      },
    },
    initializing: {
      invoke: {
        id: 'authenticate',
        src: () => getOptions(),
        onDone: {
          target: 'authenticated',
          actions: assign({
            options: (_, event) => event.data ?? [],
          }),
        },
        onError: 'unauthenticated',
      },
    },
    loggingOut: {
      invoke: {
        id: 'logging-out',
        src: () => logout(),
        onDone: 'unauthenticated',
        onError: 'unauthenticated',
      },
    },
    authenticated: {
      on: {
        LOGOUT: {
          target: 'loggingOut',
          actions: assign({
            repository: () => null,
            options: () => [],
            passphrase: () => null,
            config: () => null,
          }),
        },
      },
      initial: 'locked',
      states: {
        locked: {
          on: {
            UNLOCK: {
              target: 'unlocking',
              actions: assign({
                repository: (_, event) => event.repository,
                passphrase: (_, event) => event.passphrase,
                config: () => null,
              }),
            },
          },
        },
        unlocked: {
          on: {
            UNLOCK: {
              target: 'unlocking',
              actions: assign({
                repository: (_, event) => event.repository,
                passphrase: (_, event) => event.passphrase,
                config: () => null,
              }),
            },
          },
        },
        unlocking: {
          invoke: {
            id: 'unlock',
            src: (context) => getConfig(context.repository, context.passphrase),
            onDone: {
              target: 'unlocked',
              actions: assign({
                config: (context, event) => event.data,
              }),
            },
            onError: {
              target: 'locked',
              actions: assign({
                repository: () => null,
                passphrase: () => null,
              }),
            },
          },
        },
      },
    },
  },
};

const maildogMachine = createMachine(machineConfig);

function getSession(context: Context): Session {
  return {
    repository: context.repository,
    configByDomain: deriveConfigByDomain(context.config),
    emails: lookupEmails(context.config, context.activeTabUrl),
    options: context.options,
  };
}

function lookupEmails(config: any, currentUrl: string | null): string[] {
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
  const service = interpret(maildogMachine).start();

  browser.browserAction.setBadgeBackgroundColor({ color: '#537780' });

  browser.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await browser.tabs.get(activeInfo.tabId);

    service.send({
      type: 'ACTIVATE_TAB',
      tabId: activeInfo.tabId,
      tabUrl: tab.url,
    });
  });

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    service.send({
      type: 'UPDATE_TAB',
      tabId,
      tabUrl: tab.url,
    });
  });

  browser.runtime.onMessage.addListener((message: Message) => {
    return new Promise((resolve, reject) => {
      switch (message.type) {
        case 'GET_SESSION':
          if (service.state.matches('authenticated')) {
            resolve(getSession(service.state.context));
          } else {
            resolve(null);
          }
          break;
        case 'UNLOCK':
          const handleUnlock = (state: State<Context>) => {
            if (state.matches('authenticated.unlocked')) {
              service.off(handleUnlock);
              resolve();
            }
          };

          service.onTransition(handleUnlock).send({
            type: 'UNLOCK',
            repository: message.repository,
            passphrase: message.passphrase,
          });
          break;
        case 'LOGIN':
          const handleLogin = (state: State<Context>) => {
            if (state.matches('authenticated')) {
              service.off(handleLogin);
              resolve();
            }
          };

          service.onTransition(handleLogin).send('LOGIN');
          break;
        case 'LOGOUT':
          const handleLogout = (state: State<Context>) => {
            if (state.matches('unauthenticated')) {
              service.off(handleLogout);
              resolve();
            }
          };

          service.onTransition(handleLogout).send('LOGOUT');
          break;
        default:
          reject(
            new Error(`Unknown message received: ${JSON.stringify(message)}`),
          );
          break;
      }
    });
  });

  service.onChange(async (context) => {
    if (context.config === null) {
      return;
    }

    const domains = Object.keys(context.config.domains);
    const emails = lookupEmails(context.config, context.activeTabUrl);
    const emailsByDomain = getEmailsByDomain(domains, emails);

    await browser.browserAction.setBadgeText({
      text: emails.length > 0 ? `${emails.length}` : '',
    });

    await updateContextMenu(emailsByDomain);
  });
}

main();
