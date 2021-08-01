import type { LoaderFunction } from 'remix';
import { json } from 'remix';
import {
  JsonRoute,
  apiHeaders,
  unauthorized,
  notFound,
  badRequest,
} from '../../api';
import { getEncrypedConfig } from '../../github';
import { getSession } from '../../auth';

export const headers = apiHeaders;

export let loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request);

  if (!session.has('accessToken')) {
    return unauthorized();
  }

  const url = new URL(request.url);
  const owner = url.searchParams.get('owner');
  const repo = url.searchParams.get('repo');

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
