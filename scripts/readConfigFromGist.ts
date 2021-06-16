import { setSecret, setOutput, setFailed } from '@actions/core';
import { getOctokit } from '@actions/github';
import { parse as parseYaml } from 'yaml';
import { parse as parseToml } from 'toml';

async function readConfig(
  github: ReturnType<typeof getOctokit>,
  gistId: string,
  filename: string,
): Promise<string> {
  const response = await github.rest.gists.get({ gist_id: gistId });
  const file = response.data.files?.[filename];

  if (!file) {
    throw new Error(
      'File not found; Please confirm if the provided gist is setup correctly',
    );
  }

  const extension = filename.slice(filename.lastIndexOf('.'));

  switch (extension) {
    case '.json':
      return JSON.parse(file.content ?? '');
    case '.yaml':
      return parseYaml(file.content ?? '', { prettyErrors: true });
    case '.toml':
      return parseToml(file.content ?? '');
    default:
      throw new Error(
        `Unsupport file extension: ${extension}; Only json and yaml are supported at the moment`,
      );
  }
}

async function main(): Promise<string> {
  const github = getOctokit(process.env.GIST_TOKEN ?? '');
  const config = await readConfig(
    github,
    process.env.GIST_ID ?? '',
    process.env.FILENAME ?? '',
  );
  const result = JSON.stringify(config);

  setSecret(result);
  setOutput('result', result);

  return result;
}

main().catch((err: any): void => {
  console.error(err);
  setFailed(`Unhandled error - ${err}`);
});
