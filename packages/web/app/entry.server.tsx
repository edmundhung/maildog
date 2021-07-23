import ReactDOMServer from 'react-dom/server';
import type { EntryContext } from 'remix';
import { RemixServer } from 'remix';
import { unescapeHtml } from './api';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const markup = ReactDOMServer.renderToString(
    <RemixServer context={remixContext} url={request.url} />,
  );

  if (!responseHeaders.has('Content-Type')) {
    responseHeaders.set('Content-Type', 'text/html');
  }

  const body =
    responseHeaders.get('Content-Type') === 'text/html'
      ? `<!DOCTYPE html>${markup}`
      : unescapeHtml(markup);

  return new Response(body, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
