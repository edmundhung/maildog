import type { Session, Request, Response } from 'remix';
import { createCookieSessionStorage, redirect } from 'remix';
import { createToken, getWebFlowAuthorizationUrl } from './github';

/**
 * Store session inside cookie with the strictest setup
 * With an exception on `sameSite` being `lax` due to installation flow triggered by Github
 */
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: process.env.SESSION_SECRETS?.split(',') ?? [],
    secure: process.env.NODE_ENV !== 'development',
  },
});

/**
 * Create session object based on the header cookie
 * @param {Request} request
 * @returns {Session} current session
 */
export async function getSession(request: Request): Promise<Session> {
  const cookie = request.headers.get('Cookie');
  const session = await sessionStorage.getSession(cookie);

  return session;
}

/**
 * Initiate Github OAuth Web Application flow
 * @link https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow
 * @param request
 * @returns response based on current session
 */
export async function login(request: Request): Promise<Response> {
  const session = await getSession(request);

  if (session.has('accessToken')) {
    return redirect('/');
  }

  const authorizationUrl = getWebFlowAuthorizationUrl(
    `${process.env.WEB_URL ?? 'http://localhost:3000'}/callback`,
    Math.random().toString(36).slice(2),
  );

  return redirect(authorizationUrl);
}

/**
 * Delete session cookie
 * @param request
 * @returns response based on current session
 */
export async function logout(request: Request): Promise<Response> {
  const session = await getSession(request);

  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}

/**
 * Exchange provided code with an accessToken and save it to session
 * The redirection could be triggered with 2 different flows:
 * (1) After authorisation (login), or
 * (2) After installation
 * @link https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#2-users-are-redirected-back-to-your-site-by-github
 * @param request
 * @returns response based on current session
 */
export async function callback(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  // FIXME: Delete it or an extra check to verify the installation_id provided
  // const installationId = url.searchParams.get('installation_id');

  if (!code) {
    return redirect('/');
  }

  const session = await getSession(request);
  const token = await createToken(code, state !== null ? state : undefined);

  session.set('accessToken', token);
  console.log('[Auth] Success: ', JSON.stringify({ code, state }, null, 2));

  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}
