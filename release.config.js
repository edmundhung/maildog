// Setup Semantic Release plugins.
// See https://semantic-release.gitbook.io/semantic-release/extending/plugins-list for more plugins.
module.exports = {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular', // default
        releaseRules: [
          // Explained on https://github.com/semantic-release/commit-analyzer#releaserules
          // Mark all chagnes with scope `web` & `extensions` as a patch until official release
          { scope: 'web', release: false },
          { scope: 'extensions', release: false },
          { type: 'feat', scope: 'web', release: 'patch' },
          { type: 'fix', scope: 'web', release: 'patch' },
          { type: 'perf', scope: 'web', release: 'patch' },
          { type: 'feat', scope: 'extensions', release: 'patch' },
          { type: 'fix', scope: 'extensions', release: 'patch' },
          { type: 'perf', scope: 'extensions', release: 'patch' },
        ],
      },
    ],
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
