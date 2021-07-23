import type { LoaderFunction } from 'remix';
import { logout } from '../auth';

export let loader: LoaderFunction = async ({ request }) => {
  return logout(request);
};

export default function Logout(): null {
  return null;
}
