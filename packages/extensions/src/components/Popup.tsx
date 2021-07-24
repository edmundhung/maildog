import * as React from 'react';
import { browser, Tabs } from 'webextension-polyfill-ts';

function openWebPage(url: string): Promise<Tabs.Tab> {
  return browser.tabs.create({ url });
}

function login() {
  return openWebPage(`${process.env.WEB_URL ?? 'http://localhost:3000'}/login`);
}

function Popup(): React.ReactElement {
  return (
    <section className="flex flex-col w-72 h-96 font-light bg-white text-black dark:bg-black dark:text-white p-4">
      <header>
        <h1>maildog</h1>
      </header>
      <main className="flex flex-grow items-center">
        <button
          type="button"
          className="border border-white dark:border-black hover:border-black dark:hover:border-white p-2 w-full"
          onClick={login}
        >
          Login with GitHub
        </button>
      </main>
    </section>
  );
}

export default Popup;
