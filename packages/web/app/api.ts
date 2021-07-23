import type { HeadersFunction } from 'remix';
import { useRouteData, useMatches, json } from 'remix';

/**
 * Default HeadersFunction for API Route.
 * Prioritize loader headers and complemented by parent headers
 * @returns {HeadersFunction} headersFunction
 */
export const apiHeaders: HeadersFunction = ({
  loaderHeaders,
  parentHeaders,
}) => {
  return {
    ...Object.fromEntries(parentHeaders),
    ...Object.fromEntries(loaderHeaders),
  };
};

/**
 * Helpers for generating a 401 JSON response
 * @returns {Response} 401 Response
 */
export function unauthorized(): Response {
  return json({ error: { message: 'Unauthorized' } }, 401);
}

/**
 * Checks if the result should be rendered with the Document layout
 * Based on handle defined on route module
 * Default to true unless specifically defined and assigned with `false`
 * @returns {boolean}
 */
export function useShouldRenderDocument(): boolean {
  const matches = useMatches();

  return !matches.find((match) => match?.handle?.document === false);
}

/**
 * Unescape JSON data santized by the react-dom renderer.
 * It does not cover all scenarios and probably buggy.
 * It is better to be replaced with a custom react renderer to avoid sanitization.
 * @param markup Santized JSON rendered with `ReactDOM.renderToString()`
 * @returns A JSON text
 */
export function unescapeHtml(markup: string): string {
  return markup
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x(\d+);/g, (match, hex) => String.fromCharCode(`0x${hex}`))
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}

/**
 * Format the provided data to JSON string.
 * Print with a more readable format on development environment
 * @param {any} data from the loader function
 * @returns JSON string
 */
export function jsonStringify(data: any): string {
  if (process.env.NODE_ENV === 'development') {
    return JSON.stringify(data, null, 2);
  }

  return JSON.stringify(data);
}

/**
 * A Remix Route component which simply return the loaders data in JSON format
 * @returns {string} JSON string
 */
export function JsonRoute(): string {
  const data = useRouteData();

  return jsonStringify(data);
}
