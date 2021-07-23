import type { LoaderFunction } from 'remix';
import { callback } from '../auth';

export let loader: LoaderFunction = async ({ request }) => {
  return callback(request);
};

export default function Callback(): null {
  return null;
}
