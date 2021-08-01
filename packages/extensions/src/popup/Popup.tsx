import React from 'react';
import { browser, Tabs } from 'webextension-polyfill-ts';
import LoginScreen from './LoginScreen';

async function showOfficialWebsite(): Promise<void> {
  await browser.tabs.create({ url: 'https://github.com/edmundhung/maildog' });
}

function Popup(): React.ReactElement {
  return (
    <LoginScreen
      isLoading={false}
      onLogin={() => {}}
      onLearnMore={showOfficialWebsite}
    />
  );
}

export default Popup;
