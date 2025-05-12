const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');

(async () => {
  try {
    const token = process.env.GITHUB_TOKEN || process.env.INPUT_TOKEN || core.getInput('github-token');
    const octokit = new Octokit({ auth: token });

    const owner = core.getInput('owner');

    // Get all repos for the org
    let repos;
    try {
      repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
        org: owner,
        per_page: 100,
        sort: 'updated',
        direction: 'desc',
      });
    } catch (err) {
      console.warn(`Failed to get org repos: ${err.message}`);
      repos = await octokit.paginate(octokit.rest.repos.listForUser, {
        username: owner,
        per_page: 100,
        sort: 'updated',
        direction: 'desc',
      });
      repos = repos.filter(repo => repo.topics.includes('profile'));
    }

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
