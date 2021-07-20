# @maildog/web

Built with [Remix](https://remix.run/), deployed to [Cloudflare Workers](https://workers.cloudflare.com/). Bootstrapped based on https://github.com/GregBrimble/remix

## Development

```sh
npm start
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

```sh
npm run publish
```

This will first build both the remix app for production and output a worker file `worker.js`. Assets from the `public` folder will be uploaded to Workers KV and the worker file will be deployed together.
