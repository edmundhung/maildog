const esbuild = require('esbuild');
const alias = require('esbuild-plugin-alias');

esbuild.build({
  entryPoints: ['worker/index.ts'],
  bundle: true,
  format: 'esm',
  define: { 'process.env.NODE_ENV': '"production"' },
  outfile: './worker.js',
  plugins: [
    alias({
      'fs': require.resolve('./null.js'),
      'crypto': require.resolve('./null.js'),
      'path': require.resolve('./null.js'),
      'node-fetch': require.resolve('./global-fetch.js'),
    }),
  ],
});
