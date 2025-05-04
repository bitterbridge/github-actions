const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');

(async () => {
  try {
    const token = process.env.GITHUB_TOKEN || process.env.INPUT_TOKEN;
    const octokit = new Octokit({ auth: token });

    const owner = core.getInput('owner');

    // Get all repos for the org
    const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
      org: owner,
      per_page: 100,
    });

    const results = [];

    for (const repo of repos) {
      if (repo.archived || repo.disabled) continue;

      // Fetch .emoji (if any)
      let emoji = '❓';
      try {
        const emojiResp = await octokit.rest.repos.getContent({
          owner,
          repo: repo.name,
          path: '.emoji',
        });
        emoji = Buffer.from(emojiResp.data.content, 'base64').toString().trim();
      } catch (_) {
      }

      results.push({
        name: repo.name,
        emoji,
        description: repo.description || '',
        html_url: repo.html_url,
        homepage: repo.homepage || '',
        topics: repo.topics || [],
      });
    }

    core.setOutput('repos', JSON.stringify(results));
    console.debug(`Parsed repos: ${JSON.stringify(results)}`);
  } catch (err) {
    core.setFailed(err.message);
  }
})();
