import type { MetaFunction } from "remix";
import { Link } from 'react-router-dom';

export default function FourOhFour() {
  return (
    <div>
      <h1>404</h1>
      <div>Bark! Bark! 🐶</div>
      <footer className="pt-12 text-xs">
        Follow the maildog <Link to="/" className="border-dotted border-b border-black dark:border-white">home</Link>
      </footer>
    </div>
  );
}
