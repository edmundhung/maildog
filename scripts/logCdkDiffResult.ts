import { setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { command } from 'execa';

const title = '#### Check CDK Diff';

function generateComment(
  title: string,
  description: string,
  output: string,
): string {
  const body = [
    title,
    description,
    '',
    '<details>',
    '<summary>Show Output</summary>',
    '',
    '```',
    output,
    '```',
    '',
    '</details>',
  ].join('\n');

  return body;
}

async function main(): Promise<void> {
  const github = getOctokit(process.env.GITHUB_TOKEN ?? '');
  const { exitCode, all } = await command('npx cdk diff', { all: true });

  const comments = await github.rest.issues.listComments({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  const previousComment = comments.data.find(
    (comment) => comment.body?.startsWith(title) ?? false,
  );
  const body = generateComment(
    title,
    `Status: ${exitCode === 0 ? 'Success' : 'Failed'}, Exit Code: ${exitCode}`,
    all ?? '',
  );

  if (previousComment) {
    await github.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: previousComment.id,
      body,
    });
  } else {
    await github.rest.issues.createComment({
      issue_number: context.issue.number,
      owner: context.repo.owner,
      repo: context.repo.repo,
      body,
    });
  }
}

main().catch((err: any): void => {
  console.error(err);
  setFailed(`Unhandled error: ${err}`);
});
