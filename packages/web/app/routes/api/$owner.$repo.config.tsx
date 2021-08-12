import type { LoaderFunction, ActionFunction } from 'remix';
import { json } from 'remix';
import {
  JsonRoute,
  apiHeaders,
  unauthorized,
  notFound,
  badRequest,
} from '../../api';
import { getEncrypedConfig, saveEncryptedConfig } from '../../github';
import { getSession } from '../../auth';

export const headers = apiHeaders;

export let action: ActionFunction = async ({ request, params }) => {
  if (request.method.toUpperCase() !== 'PUT') {
    return notFound();
  }

  const session = await getSession(request);

  if (!session.has('accessToken')) {
    return unauthorized();
  }

  const { owner, repo } = params;

  if (!owner || !repo) {
    return badRequest();
  }

  const token = session.get('accessToken');
  const body = await request.clone().json();
  const result = await saveEncryptedConfig(
    token,
    owner,
    repo,
    body.content,
    'production',
    body.sha,
  );

  return json({
    data: result,
  });
};

export let loader: LoaderFunction = async ({ request, params }) => {
  const session = await getSession(request);

  if (!session.has('accessToken')) {
    return unauthorized();
  }

  const { owner, repo } = params;

  if (!owner || !repo) {
    return badRequest();
  }

  const token = session.get('accessToken');
  const config = await getEncrypedConfig(token, owner, repo, 'production');

  if (!config) {
    return notFound();
  }

  return json({
    data: config,
  });
};

export default JsonRoute;
