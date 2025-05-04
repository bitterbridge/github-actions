const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');

(async () => {
  try {
    const token = process.env.GITHUB_TOKEN || process.env.INPUT_TOKEN;
    const octokit = new Octokit({ auth: token });

    const owner = core.getInput('owner');
    const repo = core.getInput('repo');
    const path = core.getInput('path');
    const substitutions = JSON.parse(core.getInput('substitutions'));

    const contentResp = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    const template = Buffer.from(contentResp.data.content, 'base64').toString();

    let markdown = template;
    for (const [key, value] of Object.entries(substitutions)) {
      const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      markdown = markdown.replace(pattern, value);
    }

    core.setOutput('markdown', markdown);
  } catch (err) {
    core.setFailed(`Template rendering failed: ${err.message}`);
  }
})();
