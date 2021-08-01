import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { browser, Tabs } from 'webextension-polyfill-ts';
import LoginScreen from './LoginScreen';
import NavigationScreen from './NavigationScreen';
import * as api from './api';

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

async function showInstallationPage(): Promise<void> {
  await browser.tabs.create({
    url: 'https://github.com/apps/maildog-bot/installations/new',
  });
}

async function showOfficialWebsite(): Promise<void> {
  await browser.tabs.create({ url: 'https://github.com/edmundhung/maildog' });
}

function Popup(): React.ReactElement {
  const [isRefreshing, setRefreshing] = useState(false);
  const { data, isFetched, refetch } = useQuery({
    queryKey: 'GET_STATUS',
    queryFn: api.getStatus,
    onSettled() {
      setRefreshing(false);
    },
  });

  const login = async () => {
    setRefreshing(true);
    const tab = await openPageInBackground('/login');

    if (!tab.url) {
      browser.tabs.update(tab.id, { active: true });
      return;
    }

    browser.tabs.remove(tab.id);
    refetch();
  };

  const logout = async () => {
    setRefreshing(true);
    const tab = await openPageInBackground('/logout');

    browser.tabs.remove(tab.id);
    refetch();
  };

  const shouldAuthenitcate = isFetched && data === null;
  const isLoading = !isFetched || isRefreshing || savePassphrase.isLoading;

  if (isLoading || shouldAuthenitcate) {
    return (
      <LoginScreen
        isLoading={isLoading}
        onLogin={login}
        onLearnMore={showOfficialWebsite}
      />
    );
  }

  return (
    <NavigationScreen
      repository={data?.repository ?? null}
      options={data?.options ?? []}
      onSelect={() => {}}
      onInstall={showInstallationPage}
      onLogout={logout}
    />
  );
}

export default Popup;
