import { AutoRc } from 'auto';
import { ConventionalCommitsOptions } from '@auto-it/conventional-commits';

const conventionalCommitsOptions: ConventionalCommitsOptions = {
  // preset: '',
  // defaultReleaseType: '',
};

/** Auto configuration */
export default function rc(): AutoRc {
  return {
    plugins: [
      // "released",
      'conventional-commits',
    ],
    // labels: [
    //   {
    //     name: "blog-post",
    //     changelogTitle: "📚 Blog Post",
    //     releaseType: "none",
    //   },
    // ],
  };
}
