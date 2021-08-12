import { interpret, State } from 'xstate';
import { browser } from 'webextension-polyfill-ts';
import { Message } from '../types';
import {
  updateContextMenu,
  lookupEmails,
  getEmailsByDomain,
  getSession,
  generateNewEmail,
} from './helpers';
import machine, { Context } from './machine';
import { copyText } from '../utils';

function main() {
  const service = interpret(machine)
    .start()
    .onChange(async (context) => {
      if (context.config === null) {
        return;
      }

      const domains = Object.keys(context.config.domains);
      const emails = lookupEmails(context.config, context.activeTabUrl);
      const emailsByDomain = getEmailsByDomain(domains, emails);

      await browser.browserAction.setBadgeText({
        text: emails.length > 0 ? `${emails.length}` : '',
      });

      await updateContextMenu(emailsByDomain, (domain) => {
        const email = generateNewEmail(domain);

        service.send({
          type: 'ASSIGN_NEW_EMAIL',
          email,
        });

        copyText(email);
      });
    });

  browser.browserAction.setBadgeBackgroundColor({ color: '#537780' });

  browser.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await browser.tabs.get(activeInfo.tabId);

    if (!tab.url) {
      return;
    }

    service.send({
      type: 'ACTIVATE_TAB',
      tabId: activeInfo.tabId,
      tabUrl: tab.url,
    });
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.url) {
      return;
    }

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
        case 'ASSIGN_NEW_EMAIL':
          const email = generateNewEmail(message.domain);
          const handleAssign = (state: State<Context>) => {
            if (state.matches('authenticated.unlocked.idle')) {
              service.off(handleAssign);
              resolve(email);
            }
          };

          service.onTransition(handleAssign).send({
            type: 'ASSIGN_NEW_EMAIL',
            email,
          });
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
}

main();
