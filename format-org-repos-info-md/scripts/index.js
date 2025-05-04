const core = require('@actions/core');

(async () => {
  try {
    const raw = core.getInput('repos');
    const repos = JSON.parse(raw);

    const lines = repos.map(repo => {
      const { emoji, name, html_url, description } = repo;
      const descPart = description ? `: ${description}` : '';
      return `- ${emoji} [${name}](${html_url})${descPart}`;
    });
    console.debug(`Parsed repos: ${JSON.stringify(lines)}`);

    const markdown = lines.join('\n') + '\n';
    console.debug(`Formatted markdown: ${markdown}`);
    core.setOutput('markdown', markdown);
    core.setOutput('base64', Buffer.from(markdown).toString('base64'));
  } catch (err) {
    core.setFailed(`Failed to format markdown: ${err.message}`);
  }
})();
