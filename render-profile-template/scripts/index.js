const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');

(async () => {
  try {
    const token = process.env.GITHUB_TOKEN || process.env.INPUT_TOKEN || core.getInput('github-token');
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
    console.debug(`Content of ${path}: ${contentResp.data.content}`);

    const template = Buffer.from(contentResp.data.content, 'base64').toString();
    console.debug(`Template content: ${template}`);

    let markdown = template;
    for (const [key, value] of Object.entries(substitutions)) {
      const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      markdown = markdown.replace(pattern, Buffer.from(value, 'base64').toString());
    }
    core.setOutput('markdown', markdown);
    console.debug(`Rendered markdown: ${markdown}`);
    core.setOutput('base64', Buffer.from(markdown).toString('base64'));
  } catch (err) {
    core.setFailed(`Template rendering failed: ${err.message}`);
  }
})();
