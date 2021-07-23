import type { LoaderFunction } from 'remix';
import { useRouteData, redirect, json } from 'remix';
import { listInstalledRepositories } from '../github';
import { getSession } from '../auth';

export let loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request);

  if (!session.has('accessToken')) {
    return json({
      isAuthenticated: false,
      repos: [],
    });
  }

  const token = session.get('accessToken');
  const repos = await listInstalledRepositories(token);

  if (repos.length === 0) {
    console.log(
      'No installed repository found; Redirecting user to Github App installation page',
    );
    return redirect(
      'https://github.com/apps/maildog-trainer/installations/new',
    );
  }

  return json({
    isAuthenticated: true,
    repos,
  });
};

export default function Index(): React.ReactElement {
  const { isAuthenticated, repos } = useRouteData();

  return (
    <div>
      <h1>Bark! 🐶</h1>
      <div>
        Your{' '}
        <a
          className="border-dotted border-b border-black dark:border-white"
          href={`https://github.com/${repos[0] ?? 'edmundhung/maildog'}`}
        >
          {repos[0] ?? 'maildog'}
        </a>{' '}
        is waiting for you
      </div>
      <footer className="pt-12 text-xs">
        {isAuthenticated ? (
          <a
            className="border-dotted border-b border-black dark:border-white"
            href="/logout"
          >
            Logout
          </a>
        ) : (
          <a
            className="border-dotted border-b border-black dark:border-white"
            href="/login"
          >
            Login
          </a>
        )}
      </footer>
    </div>
  );
}
