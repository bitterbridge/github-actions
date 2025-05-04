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
    console.log(`Template content: ${template}`);
    console.log(`Substitutions: ${JSON.stringify(substitutions)}`);

    let markdown = template;
    for (const [key, value] of Object.entries(substitutions)) {
      const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      console.log(`Replacing ${pattern} with ${value}`);
      markdown = markdown.replace(pattern, value);
      console.log(`Updated markdown: ${markdown}`);
    }
    console.log(`Final markdown: ${markdown}`);
    core.setOutput('markdown', markdown);
  } catch (err) {
    core.setFailed(`Template rendering failed: ${err.message}`);
  }
})();
