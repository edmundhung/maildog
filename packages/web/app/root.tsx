import type { LinksFunction, MetaFunction } from 'remix';
import { Meta, Links, Scripts, LiveReload } from 'remix';
import { Outlet } from 'react-router-dom';
import { useShouldRenderDocument } from './api';
import stylesUrl from './styles/global.css';

export let meta: MetaFunction = () => {
  return {
    title: 'maildog',
    description:
      'Hosting your own email forwarding service on AWS and manage it with Github Actions',
    author: 'Edmund Hung',
    keywords: 'aws,email,github',
  };
};

export let links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <Meta />
        <Links />
      </head>
      <body className="font-light bg-white text-black dark:bg-black dark:text-white pt-16 px-10 md:pt-32 md:pb-8 md:px-20">
        {children}

        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  );
}

export default function App() {
  const shouldRenderDocument = useShouldRenderDocument();

  if (!shouldRenderDocument) {
    return <Outlet />;
  }

  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document>
      <h1>App Error</h1>
      <pre>{error.message}</pre>
      <p>
        Replace this UI with what you want users to see when your app throws
        uncaught errors.
      </p>
    </Document>
  );
}
