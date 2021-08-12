import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { browser, Tabs } from 'webextension-polyfill-ts';
import LoginScreen from './LoginScreen';
import NavigationScreen from './NavigationScreen';
import MainScreen from './MainScreen';
import * as api from './api';
import { Status } from '../types';
import { copyText } from '../utils';

async function showInstallationPage(): Promise<void> {
  await browser.tabs.create({
    url: 'https://github.com/apps/maildog-bot/installations/new',
  });
}

async function showOfficialWebsite(): Promise<void> {
  await browser.tabs.create({ url: 'https://github.com/edmundhung/maildog' });
}

function Popup(): React.ReactElement {
  const [repository, setRepository] = useState<string | null>(null);
  const [shouldShowMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();
  const { data, isFetched, refetch } = useQuery({
    queryKey: 'GET_SESSION',
    queryFn: api.getSession,
    onSuccess(session) {
      if (session === null) {
        return;
      }

      setRepository((current) => {
        if (current !== null) {
          return current;
        }

        return session.repository ?? session.options[0] ?? null;
      });
    },
  });
  const unlock = useMutation({
    mutationFn: (passphrase: string) => api.unlock(repository, passphrase),
    onSuccess() {
      queryClient.invalidateQueries('GET_SESSION');
    },
  });
  const copyEmail = useMutation({
    mutationFn: copyText,
    onSuccess() {
      window.close();
    },
  });
  const assignNewEmail = useMutation({
    mutationFn: api.assignNewEmail,
    onSuccess(email) {
      queryClient.invalidateQueries('GET_SESSION');
      copyEmail.mutate(email);
    },
  });
  const login = useMutation({
    mutationFn: api.login,
    onSuccess() {
      queryClient.invalidateQueries('GET_SESSION');
    },
  });
  const logout = useMutation({
    mutationFn: api.logout,
    onSuccess() {
      queryClient.invalidateQueries('GET_SESSION');
    },
  });

  const shouldAuthenitcate = isFetched && data === null;
  const isLoading =
    !isFetched || login.isLoading || logout.isLoading || unlock.isLoading;

  if (isLoading || shouldAuthenitcate) {
    return (
      <LoginScreen
        isLoading={isLoading}
        onLogin={login.mutate}
        onLearnMore={showOfficialWebsite}
      />
    );
  }

  if (shouldShowMenu) {
    return (
      <NavigationScreen
        repository={data?.repository ?? null}
        options={data?.options ?? []}
        onSelect={(repository) => {
          setRepository(repository);
          setShowMenu(false);
        }}
        onInstall={showInstallationPage}
        onLogout={logout.mutate}
      />
    );
  }

  return (
    <MainScreen
      repository={repository}
      configByDomain={
        repository === data?.repository ? data?.configByDomain ?? null : null
      }
      emails={repository === data?.repository ? data?.emails ?? [] : []}
      onNavigate={() => setShowMenu(true)}
      onNewEmailRequested={assignNewEmail.mutate}
      onPassphraseProvided={unlock.mutate}
      onEmailClicked={copyEmail.mutate}
    />
  );
}

export default Popup;
