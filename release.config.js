// Setup Semantic Release plugins.
// See https://semantic-release.gitbook.io/semantic-release/extending/plugins-list for more plugins.
module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/github',
      {
        failComment: false,
      },
    ],
    '@semantic-release/git',
  ],
};
