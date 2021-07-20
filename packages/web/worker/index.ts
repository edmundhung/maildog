import { createEventListener } from './worker';
import build from '../build/index.js';

const eventListener = createEventListener({
  build,
  getLoadContext() {
    return {};
  },
});

addEventListener('fetch', eventListener);
