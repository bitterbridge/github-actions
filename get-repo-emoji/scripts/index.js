const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require('@octokit/rest');

(async () => {
  try {
    const token = process.env.GITHUB_TOKEN || process.env.INPUT_TOKEN || core.getInput('github-token');
    const octokit = new Octokit({ auth: token });

    const repo = core.getInput('repo');
    const owner = core.getInput('owner');

    const content = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: '.emoji',
    });

    const emoji = Buffer.from(content.data.content, 'base64').toString().trim();
    console.debug(`Content of .emoji: ${emoji}`);

    core.setOutput('emoji', emoji);
  } catch (err) {
    core.setOutput('emoji', '❓');
  }
})();
