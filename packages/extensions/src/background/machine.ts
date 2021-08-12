import { MachineConfig, createMachine, assign } from 'xstate';
import { LOGIN_EVENT, LOGOUT_EVENT, UNLOCK_EVENT } from '../types';
import { copyText } from '../utils';
import {
  login,
  logout,
  getOptions,
  getConfig,
  saveConfig,
  getActiveTab,
} from './helpers';

export interface Context {
  activeTabId: number | null;
  activeTabUrl: string | null;
  repository: string | null;
  options: string[];
  passphrase: string | null;
  config: any | null;
  sha: string | null;
}

interface ACTIVATE_TAB_EVENT {
  type: 'ACTIVATE_TAB';
  tabId: number;
  tabUrl: string;
}

interface UPDATE_TAB_EVENT {
  type: 'UPDATE_TAB';
  tabId: number;
  tabUrl: string;
}

interface ASSIGN_NEW_EMAIL_EVENT {
  type: 'ASSIGN_NEW_EMAIL';
  email: string;
}

export type Event =
  | ACTIVATE_TAB_EVENT
  | UPDATE_TAB_EVENT
  | LOGIN_EVENT
  | LOGOUT_EVENT
  | UNLOCK_EVENT
  | ASSIGN_NEW_EMAIL_EVENT;

const machineConfig: MachineConfig<Context, any, Event> = {
  id: 'background',
  context: {
    activeTabId: null,
    activeTabUrl: null,
    repository: null,
    options: [],
    passphrase: null,
    config: null,
    sha: null,
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
        src: async () => {
          const options = await getOptions();
          const tab = await getActiveTab();

          return { options, tab };
        },
        onDone: {
          target: 'authenticated',
          actions: assign({
            options: (_, event) => event.data?.options ?? [],
            activeTabId: (_, event) => event.data?.tab?.id,
            activeTabUrl: (_, event) => event.data?.tab?.url,
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
            repository: null,
            options: [],
            passphrase: null,
            config: null,
            sha: null,
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
                config: null,
                sha: null,
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
                config: null,
                sha: null,
              }),
            },
          },
          initial: 'idle',
          states: {
            idle: {
              on: {
                ASSIGN_NEW_EMAIL: {
                  target: 'updating',
                  actions: assign({
                    config: (context, { email }) => {
                      const [alias, domain] = email.split('@');
                      const oldConfig = context.config.domains[domain];
                      const newConfig = {
                        ...oldConfig,
                        alias: {
                          ...oldConfig.alias,
                          [alias]: {
                            description: `Generated from web extension at ${new Date().toLocaleString()}`,
                            website: context.activeTabUrl,
                          },
                        },
                      };

                      const result = {
                        ...context.config,
                        domains: {
                          ...context.config.domains,
                          [domain]: newConfig,
                        },
                      };

                      return result;
                    },
                  }),
                },
              },
            },
            updating: {
              invoke: {
                id: 'updating',
                src: (context) =>
                  saveConfig(
                    context.repository,
                    context.passphrase,
                    context.config,
                    context.sha,
                  ),
                onDone: {
                  target: 'idle',
                  actions: assign({
                    sha: (_, event) => event.data,
                  }),
                },
                onError: {
                  target: 'idle',
                },
              },
            },
          },
        },
        unlocking: {
          invoke: {
            id: 'unlock',
            src: (context) => getConfig(context.repository, context.passphrase),
            onDone: {
              target: 'unlocked',
              actions: assign((_, event) => {
                const [config, sha] = event.data;

                return {
                  config,
                  sha,
                };
              }),
            },
            onError: {
              target: 'locked',
              actions: assign({
                repository: null,
                passphrase: null,
              }),
            },
          },
        },
      },
    },
  },
};

export default createMachine(machineConfig);
