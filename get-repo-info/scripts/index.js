const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');

(async () => {
  try {
    const token = process.env.GITHUB_TOKEN || process.env.INPUT_TOKEN;
    const octokit = new Octokit({ auth: token });

    const repo = core.getInput('repo');
    const owner = core.getInput('owner');

    // Get repo metadata
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    // Try to get .emoji file
    let emoji = '❓';
    try {
      const emojiContent = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: '.emoji',
      });
      emoji = Buffer.from(emojiContent.data.content, 'base64').toString().trim();
    } catch (_) {
    }

    const info = {
      name: repoData.name,
      emoji,
      description: repoData.description || '',
      html_url: repoData.html_url,
      homepage: repoData.homepage || '',
      topics: repoData.topics || [],
    };

    core.setOutput('info', JSON.stringify(info));
    console.debug(`Parsed repo info: ${JSON.stringify(info)}`);
  } catch (err) {
    core.setFailed(err.message);
  }
})();
