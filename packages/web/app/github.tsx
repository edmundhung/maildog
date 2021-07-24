import { App } from '@octokit/app';

type Octokit = ReturnType<typeof app.oauth.getUserOctokit>;

const app = new App({
  appId: process.env.GITHUB_APP_ID ?? '',
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY ?? '',
  oauth: {
    clientId: process.env.GITHUB_APP_CLIENT_ID ?? '',
    clientSecret: process.env.GITHUB_APP_CLIENT_SECRET ?? '',
  },
});

/**
 * Generate url for initiating the web application flow
 * @param {string} redirectUrl The URL in your application where users will be sent after authorization. Must be configured on Github App
 * @param {string} state An unguessable random string
 * @returns authorization url
 */
export function getWebFlowAuthorizationUrl(
  redirectUrl: string,
  state: string,
): string {
  const result = app.oauth.getWebFlowAuthorizationUrl({
    redirectUrl,
    state,
  });

  return result.url;
}

/**
 * Excahnge token based on the provided code
 * @param {string} code The code received after redirection
 * @param {string}[state] The unguessable random string provided with web application flow
 * @returns accessToken
 */
export async function createToken(
  code: string,
  state?: string,
): Promise<string> {
  const response = await app.oauth.createToken({ code, state });

  return response.authentication.token;
}

/**
 * Get Octokit client based on user access token
 * @param {string} token user access token
 * @returns {Promise<Octokit>} The octokit client
 */
export async function getUserOctokit(token: string): Promise<Octokit> {
  const octokit = await app.oauth.getUserOctokit({ token });

  return octokit;
}

/**
 * List all instatlled repositories with name being `maildog`
 * @param token {string} user access token
 * @returns {string[]} repository name list in `owner/repo` format
 */
export async function listInstalledRepositories(
  token: string,
): Promise<string[]> {
  const octokit = await getUserOctokit(token);
  const { data } = await octokit.request('GET /user/installations');
  const repos = [];

  if (data.total_count > 0) {
    for (const installation of data.installations) {
      for await (const { repository } of app.eachRepository.iterator({
        installationId: installation.id,
      })) {
        if (repository.name !== 'maildog') {
          // FIXME: Check for package.json instead of repository name
          continue;
        }

        repos.push(repository.full_name);
      }
    }
  }

  return repos;
}
