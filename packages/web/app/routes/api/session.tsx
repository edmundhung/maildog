import type { LoaderFunction } from 'remix';
import { json } from 'remix';
import { JsonRoute, apiHeaders, unauthorized } from '../../api';
import { listInstalledRepositories } from '../../github';
import { getSession } from '../../auth';

export const headers = apiHeaders;

export let loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request);

  if (!session.has('accessToken')) {
    return unauthorized();
  }

  const token = session.get('accessToken');
  const repos = await listInstalledRepositories(token);

  return json({
    data: { repos },
  });
};

export default JsonRoute;
