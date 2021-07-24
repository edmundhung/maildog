import { createEventListener } from './worker';
// @ts-expect-error
import build from '../build/index.js';

const eventListener = createEventListener({
  build,
  getLoadContext() {
    return {};
  },
});

addEventListener('fetch', eventListener);
