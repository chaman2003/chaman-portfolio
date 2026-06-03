const FEATURED_REPO_NAMES = new Set([
  'epsiloraai',
  'epsilora-ai',
  'printchakraai',
  'printchakra',
  'printchakra-ai',
  'medchat-ai',
  'agentic-ai-interview-materials',
]);

const GITHUB_TOKEN =
  window.__VRIK_RUNTIME__?.GITHUB_TOKEN || localStorage.getItem('vrik_github_token') || '';

function getGitHubHeaders() {
  const headers = { Accept: 'application/vnd.github+json' };
  if (GITHUB_TOKEN && GITHUB_TOKEN !== 'REPLACE_WITH_GITHUB_TOKEN') {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  return headers;
}

function normalizeRepoName(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncateText(text = '', maxLength = 190) {
  const clean = String(text || '').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}

function getGithubCols() {
  const w = window.innerWidth;
  if (w < 768) return 1;
  if (w >= 1680) return 4;
  if (w >= 1180) return 3;
  if (w >= 768) return 2;
  return 1;
}

export function initGithub(ctx, { onResize } = {}) {
  const { githubCards, githubHeadline } = ctx.dom;
  const { rag } = ctx;

  const loadGitHubData = async () => {
    if (!githubCards) return;

    try {
      const userRes = await fetch('https://api.github.com/users/chaman2003', {
        headers: getGitHubHeaders(),
      });
      if (!userRes.ok) {
        const userErr = await userRes.json().catch(() => null);
        const errMsg = userErr?.message ? `: ${userErr.message}` : '';
        throw new Error(`GitHub user request failed (${userRes.status})${errMsg}`);
      }
      const user = await userRes.json();

      if (githubHeadline && user?.login) {
        githubHeadline.textContent = `${user.public_repos ?? 0} public repos • ${user.followers ?? 0} followers • ${user.location || 'Open to global collaboration'}`;
      }

      rag.githubProfileChunk = `GitHub profile ${user?.login || 'chaman2003'}: ${user?.public_repos ?? 0} public repos, ${user?.followers ?? 0} followers, location ${user?.location || 'not specified'}, bio: ${user?.bio || 'N/A'}.`;

      const reposRes = await fetch(
        'https://api.github.com/users/chaman2003/repos?sort=updated&per_page=30',
        { headers: getGitHubHeaders() }
      );
      if (!reposRes.ok) {
        const reposErr = await reposRes.json().catch(() => null);
        const errMsg = reposErr?.message ? `: ${reposErr.message}` : '';
        throw new Error(`GitHub repos request failed (${reposRes.status})${errMsg}`);
      }
      const repos = await reposRes.json();

      if (!Array.isArray(repos)) {
        throw new Error('GitHub repos response format is invalid.');
      }

      rag.githubRagChunks = repos
        .filter((r) => r.description && r.description.trim())
        .slice(0, 18)
        .map(
          (r) =>
            `Repo ${r.name}: ${r.description}. Language: ${r.language || 'Mixed'}. Stars: ${r.stargazers_count}.`
        );

      const ghCols = getGithubCols();
      const targetCards = ghCols * 2;
      document.body.classList.add('gh-packed');
      document.body.style.setProperty('--gh-cols', String(ghCols));

      const curatedRepos = repos
        .filter((repo) => {
          const hasDescription = Boolean(repo.description && repo.description.trim());
          const normalizedName = normalizeRepoName(repo.name);
          const notInFeatured = !FEATURED_REPO_NAMES.has(normalizedName);
          return hasDescription && notInFeatured;
        })
        .slice(0, targetCards);

      if (!curatedRepos.length) {
        githubCards.innerHTML =
          '<p class="muted">No additional described repositories to show right now.</p>';
        return;
      }

      githubCards.innerHTML = curatedRepos
        .map((repo) => {
          const name = escapeHtml(repo.name || 'Untitled Repo');
          const desc = escapeHtml(truncateText(repo.description || 'No description provided yet.'));
          const lang = escapeHtml(repo.language || 'Mixed');
          const stars = Number(repo.stargazers_count || 0);
          const branches = Number(repo.forks_count || 0);

          const metaChips = [
            stars > 0 ? `<span class="repo-meta-chip">★ ${stars}</span>` : '',
            branches > 0 ? `<span class="repo-meta-chip">⑂ ${branches}</span>` : '',
            `<span class="repo-meta-chip repo-lang">${lang}</span>`,
          ]
            .filter(Boolean)
            .join('');

          return `
          <article class="repo-card">
            <div class="repo-top">
              <h4><a class="project-link-title" href="${repo.html_url}" target="_blank" rel="noreferrer" title="${name}">${name}</a></h4>
              <a class="inline-link repo-open" href="${repo.html_url}" target="_blank" rel="noreferrer" aria-label="Open ${name}">Open</a>
            </div>
            <p class="repo-desc" title="${desc}">${desc}</p>
            <div class="repo-meta">${metaChips}</div>
          </article>
        `;
        })
        .join('');
    } catch (error) {
      const errorText = String(error?.message || '').toLowerCase();
      const isRateLimited = errorText.includes('rate limit');

      if (githubCards) {
        githubCards.innerHTML = isRateLimited
          ? '<p class="muted">GitHub API rate limit reached. Please wait a bit and refresh.</p>'
          : '<p class="muted">Could not load GitHub data right now. Refresh shortly.</p>';
      }
      if (githubHeadline) {
        githubHeadline.textContent = isRateLimited
          ? 'GitHub rate limit reached. Try again shortly.'
          : 'GitHub sync temporarily unavailable.';
      }
    }
  };

  loadGitHubData();

  let githubReloadTimer;
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(githubReloadTimer);
      githubReloadTimer = setTimeout(() => {
        loadGitHubData();
        onResize?.();
      }, 280);
    },
    { passive: true }
  );

  return { loadGitHubData };
}
