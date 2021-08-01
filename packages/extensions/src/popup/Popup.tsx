import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { browser, Tabs } from 'webextension-polyfill-ts';
import LoginScreen from './LoginScreen';
import NavigationScreen from './NavigationScreen';
import MainScreen from './MainScreen';
import * as api from './api';
import { Status } from '../types';

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
  const [shouldShowMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();
  const { data, isFetched, refetch } = useQuery({
    queryKey: 'GET_STATUS',
    queryFn: api.getStatus,
    onSettled() {
      setRefreshing(false);
    },
  });
  const selectRepository = useMutation({
    mutationFn: api.selectRepository,
    async onMutate(repository) {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries('GET_STATUS');

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData('GET_STATUS');

      // Optimistically update to the new value
      queryClient.setQueryData('GET_STATUS', (status: Status) => {
        if (repository === status.repository) {
          return status;
        }

        return {
          ...status,
          repository,
          configByDomain: null,
          emails: [],
        };
      });

      // Return a context object with the snapshotted value
      return { previousStatus };
    },
    // Always refetch after error or success:
    onSettled() {
      queryClient.invalidateQueries('GET_STATUS');
    },
    onSuccess() {
      setShowMenu(false);
    },
    onError(err, newTodo, context) {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData('GET_STATUS', context.previousStatus);
    },
  });
  const savePassphrase = useMutation({
    mutationFn: api.savePassphase,
    onSuccess() {
      queryClient.invalidateQueries('GET_STATUS');
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
    await api.reset();
    setShowMenu(false);
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

  if (shouldShowMenu) {
    return (
      <NavigationScreen
        repository={data?.repository ?? null}
        options={data?.options ?? []}
        onSelect={selectRepository.mutate}
        onInstall={showInstallationPage}
        onLogout={logout}
      />
    );
  }

  return (
    <MainScreen
      repository={data?.repository ?? ''}
      configByDomain={data?.configByDomain ?? null}
      emails={data?.emails ?? []}
      onNavigate={() => setShowMenu(true)}
      onNewEmailRequested={() => {}}
      onPassphraseProvided={savePassphrase.mutate}
      onOptionUpdate={() => {}}
    />
  );
}

export default Popup;
