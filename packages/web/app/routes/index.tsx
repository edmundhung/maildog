import type { LoaderFunction } from "remix";
import { redirect } from "remix";

export default function Index() {
  return (
    <div>
      <h1>Bark! 🐶</h1>
      <div>Your <a className="border-dotted border-b border-black dark:border-white" href="https://github.com/edmundhung/maildog">maildog</a> is waiting for you</div>
      <footer className="pt-12 text-xs">
        It's still a puppy. But we are training it for you...
      </footer>
    </div>
  );
}
