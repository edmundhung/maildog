import type { HeadersFunction } from 'remix';
import { Outlet } from 'react-router-dom';
import { jsonStringify } from '../api';

export const headers: HeadersFunction = () => {
  return {
    'Content-Type': 'application/json',
  };
};

export let handle = {
  document: false,
};

export function ErrorBoundary({ error }: { error: Error }): string {
  return jsonStringify({
    error: { message: error.message },
  });
}

export default function ApiRoute() {
  return <Outlet />;
}
