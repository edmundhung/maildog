import * as React from 'react';
import { browser, Tabs } from 'webextension-polyfill-ts';

function openWebPage(url: string): Promise<Tabs.Tab> {
  return browser.tabs.create({ url });
}

function authorize() {
  const searchParams = new URLSearchParams([
    ['client_id', 'Iv1.d6f7ef0ccefe7be0'],
    ['redirect_uri', 'https://maildog.dev'],
    ['state', Math.random().toString(36).slice(2)],
  ]);

  return openWebPage(
    `https://github.com/login/oauth/authorize?${searchParams.toString()}`,
  );
}

function Popup(): React.ReactElement {
  return (
    <section className="w-72 h-96">
      <header className="p-2 border-b">
        <h1 className="text-white">maildog</h1>
      </header>
      <main className="p-2 text-center">
        <button
          type="button"
          className="rounded bg-black border-2 border-black transition-colors hover:border-primary text-white p-2 w-3/4 mt-2"
          onClick={authorize}
        >
          Login with GitHub
        </button>
      </main>
    </section>
  );
}

export default Popup;
