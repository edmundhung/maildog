const path = require('path');
const webpack = require('webpack');
const FilemanagerPlugin = require('filemanager-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WextManifestWebpackPlugin = require('wext-manifest-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const publicPath = path.join(__dirname, 'public');
const sourcePath = path.join(__dirname, 'src');
const destPath = path.join(__dirname, 'dist');
const nodeEnv = process.env.NODE_ENV || 'development';
const targetBrowser = process.env.TARGET_BROWSER;
const outputPath = path.join(destPath, targetBrowser);

const getExtensionFileType = (browser) => {
  if (browser === 'opera') {
    return 'crx';
  }

  if (browser === 'firefox') {
    return 'xpi';
  }

  return 'zip';
};

const plugins = [
  // Plugin to not generate js bundle for manifest entry
  new WextManifestWebpackPlugin(),
  // Generate sourcemaps
  new webpack.SourceMapDevToolPlugin({ filename: false }),
  // environmental variables
  new webpack.EnvironmentPlugin(['NODE_ENV', 'TARGET_BROWSER']),
  // delete previous build files
  new CleanWebpackPlugin({
    cleanOnceBeforeBuildPatterns: [
      outputPath,
      `${outputPath}.${getExtensionFileType(targetBrowser)}`,
    ],
    cleanStaleWebpackAssets: false,
    verbose: true,
  }),
  new HtmlWebpackPlugin({
    template: path.join(publicPath, 'popup.html'),
    inject: 'body',
    chunks: ['popup'],
    hash: true,
    filename: 'popup.html',
  }),
  // write css file(s) to build folder
  new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
  // copy static assets
  new CopyWebpackPlugin({
    patterns: [{ from: 'public/assets', to: 'assets' }],
  }),
];

if (nodeEnv === 'development') {
  plugins.push(
    // plugin to enable browser reloading in development mode
    new ExtensionReloader({
      port: 9090,
      reloadPage: true,
      entries: {
        // TODO: reload manifest on update
        background: 'background',
        extensionPage: ['popup'],
      },
    }),
  );
}

module.exports = {
  devtool: false, // https://github.com/webpack/webpack/issues/1194#issuecomment-560382342

  stats: {
    all: false,
    builtAt: true,
    errors: true,
    hash: true,
  },

  mode: nodeEnv,

  watch: nodeEnv === 'development',

  entry: {
    manifest: path.join(sourcePath, 'manifest.json'),
    background: path.join(sourcePath, 'background.ts'),
    popup: path.join(sourcePath, 'popup', 'index.tsx'),
  },

  output: {
    path: outputPath,
    filename: 'js/[name].bundle.js',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },

  module: {
    rules: [
      {
        type: 'javascript/auto', // prevent webpack handling json with its own loaders,
        test: /manifest\.json$/,
        use: {
          loader: 'wext-manifest-loader',
          options: {
            usePackageJSONVersion: true, // set to false to not use package.json version for manifest
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(js|ts)x?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader, // It creates a CSS file per JS file which contains CSS
          },
          {
            loader: 'css-loader', // Takes the CSS files and returns the CSS with imports and url(...) for Webpack
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'autoprefixer',
                    {
                      // Options
                    },
                  ],
                ],
              },
            },
          },
          'resolve-url-loader', // Rewrites relative paths in url() statements
        ],
      },
    ],
  },

  plugins,

  optimization: {
    minimize: nodeEnv !== 'development',
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
      }),
      new FilemanagerPlugin({
        events: {
          onEnd: {
            archive: [
              {
                format: 'zip',
                source: outputPath,
                destination: `${outputPath}.${getExtensionFileType(
                  targetBrowser,
                )}`,
                options: { zlib: { level: 6 } },
              },
            ],
          },
        },
      }),
    ],
  },
};
