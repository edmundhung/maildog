import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClientProvider, QueryClient } from 'react-query';
import { persistQueryClient } from 'react-query/persistQueryClient-experimental';
import { createAsyncStoragePersistor } from 'react-query/createAsyncStoragePersistor-experimental';
import { browser } from 'webextension-polyfill-ts';
import Popup from './Popup';
import '../style.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});
const persistor = createAsyncStoragePersistor({
  storage: {
    getItem: async (key: string): Promise<string | null> => {
      const item = await browser.storage.local.get(key);

      if (typeof item?.[key] === 'undefined') {
        return null;
      }

      return item?.[key];
    },
    setItem: async (key: string, value: string): Promise<void> => {
      await browser.storage.local.set({
        [key]: value,
      });
    },
    removeItem: async (key: string): Promise<void> => {
      await browser.storage.local.remove(key);
    },
  },
});

const popup = (
  <QueryClientProvider client={queryClient}>
    <Popup />
  </QueryClientProvider>
);

persistQueryClient({ queryClient, persistor });
ReactDOM.render(popup, document.getElementById('popup-root'));
