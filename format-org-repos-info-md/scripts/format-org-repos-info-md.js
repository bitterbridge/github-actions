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

    const markdown = lines.join('\n') + '\n';
    core.setOutput('markdown', markdown);
  } catch (err) {
    core.setFailed(`Failed to format markdown: ${err.message}`);
  }
})();
