import { MachineConfig, createMachine, assign } from 'xstate';
import { LOGIN_EVENT, LOGOUT_EVENT, UNLOCK_EVENT } from '../types';
import { login, logout, getOptions, getConfig } from './helpers';

export interface Context {
  activeTabId: number | null;
  activeTabUrl: string | null;
  repository: string | null;
  options: string[];
  passphrase: string | null;
  config: any | null;
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

export type Event =
  | ACTIVATE_TAB_EVENT
  | UPDATE_TAB_EVENT
  | LOGIN_EVENT
  | LOGOUT_EVENT
  | UNLOCK_EVENT;

const machineConfig: MachineConfig<Context, any, Event> = {
  id: 'background',
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

export default createMachine(machineConfig);
