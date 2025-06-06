const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
const crypto = require('crypto');

(async () => {
  try {
    const token = process.env.GITHUB_TOKEN || process.env.INPUT_TOKEN || core.getInput('github-token');
    const octokit = new Octokit({ auth: token });

    const owner = core.getInput('owner');
    const repo = core.getInput('repo');
    const path = core.getInput('path');
    const content = core.getInput('content');
    const message = core.getInput('message');

    let existingSha = null;

    try {
      const existing = await octokit.rest.repos.getContent({ owner, repo, path });
      const existingContent = Buffer.from(existing.data.content, 'base64').toString();
      const existingEncoded = Buffer.from(existingContent).toString('base64');

      if (existingEncoded === content) {
        console.log("No changes to content.");
        core.setOutput('updated', 'false');
        return;
      }

      existingSha = existing.data.sha;
      console.log('Existing file content:', existingContent);
      console.log('Existing file SHA:', existingSha);
    } catch (err) {
      console.error('Error fetching existing file content:', err);
      if (err.status !== 404) throw err;
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content,
      sha: existingSha || undefined,
    });

    core.setOutput('updated', 'true');
    console.log('Updated profile README.');
  } catch (err) {
    core.setFailed(`Failed to update file: ${err.message}`);
  }
})();
