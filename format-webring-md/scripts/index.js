const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
const yaml = require('js-yaml');
const { Buffer } = require('buffer');

(async () => {
  try {
    const token = process.env.GITHUB_TOKEN || process.env.INPUT_TOKEN || core.getInput('github-token');
    const octokit = new Octokit({ auth: token });

    const owner = core.getInput('owner');
    const repo = core.getInput('repo');
    const path = core.getInput('path');

    const resp = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    const content = Buffer.from(resp.data.content, 'base64').toString();
    console.debug(`Content of ${path}: ${content}`);

    const parsed = yaml.load(content);

    if (!parsed.webring || !Array.isArray(parsed.webring)) {
      throw new Error("Invalid webring.yaml format: expected top-level 'webring' array.");
    }

    const links = parsed.webring.map(entry => {
      const emoji = entry.emoji || '🔗';
      const paddedEmoji = `<span style="display:inline-block; min-width: 2em;">${emoji}</span>`;
      return `${paddedEmoji}[${entry.name}](${entry.url})`;
    });
    console.debug(`Parsed webring entries: ${JSON.stringify(links)}`);

    const markdown = `( ${links.join(' | ')} )`;
    console.debug(`Formatted markdown: ${markdown}`);

    core.setOutput('markdown', markdown);
    core.setOutput('base64', Buffer.from(markdown).toString('base64'));
  } catch (err) {
    core.setFailed(`Failed to format webring: ${err.message}`);
  }
})();
