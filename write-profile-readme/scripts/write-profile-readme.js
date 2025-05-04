const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
const crypto = require('crypto');

(async () => {
  try {
    const token = process.env.GITHUB_TOKEN || process.env.INPUT_TOKEN;
    const octokit = new Octokit({ auth: token });

    const owner = core.getInput('owner');
    const repo = core.getInput('repo');
    const path = decodeURI(core.getInput('path'));
    const content = core.getInput('content');
    const message = core.getInput('message');

    const encoded = Buffer.from(content).toString('base64');
    const newSha = crypto.createHash('sha1').update(`blob ${content.length}\0${content}`).digest('hex');

    let existingSha = null;

    try {
      const existing = await octokit.rest.repos.getContent({ owner, repo, path });
      const existingContent = Buffer.from(existing.data.content, 'base64').toString();
      const existingEncoded = Buffer.from(existingContent).toString('base64');

      if (existingEncoded === encoded) {
        console.log("No changes to content.");
        core.setOutput('updated', 'false');
        return;
      }

      existingSha = existing.data.sha;
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: encoded,
      sha: existingSha || undefined,
    });

    core.setOutput('updated', 'true');
    console.log("Updated profile README.");
  } catch (err) {
    core.setFailed(`Failed to update file: ${err.message}`);
  }
})();
