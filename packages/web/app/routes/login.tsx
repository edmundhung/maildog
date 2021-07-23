import type { LoaderFunction } from 'remix';
import { login } from '../auth';

export let loader: LoaderFunction = async ({ request }) => {
  return login(request);
};

export default function Login(): null {
  return null;
}
