// Build-time lookup of the latest GitHub release tag for a given repo.
//
// Resolved once during the static build and baked into the page HTML, so the
// site stays fully static. If a request fails (offline, rate-limited, or the
// API shape changes) we fall back to the last-known tag so the build never
// breaks — at the cost of silently serving a stale version until the next build.
async function fetchLatestTag(repo: string, fallback: string): Promise<string> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as { tag_name?: string };
    return data.tag_name ?? fallback;
  } catch {
    return fallback;
  }
}

const stripV = (tag: string) => tag.replace(/^v/, '');

/** Orchard's latest release tag, e.g. `v1.9.0`. */
export const latestTag = await fetchLatestTag('cashubtc/orchard', 'v1.9.0');
/** Same tag without the leading `v`, e.g. `1.9.0` — for `VERSION=` pinning. */
export const latestVersion = stripV(latestTag);

/** cdk-mintd's latest release tag, e.g. `v0.17.1`. */
export const latestCdkTag = await fetchLatestTag('cashubtc/cdk', 'v0.17.1');
/** Same tag without the leading `v`, e.g. `0.17.1` — for `VERSION=` in the mint guide. */
export const latestCdkVersion = stripV(latestCdkTag);
