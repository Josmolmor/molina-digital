// Unauthenticated GitHub allows 60 requests an hour per IP; hourly is plenty for a "last updated" date
const REVALIDATE_SECONDS = 3600;

/* Date of the latest commit on the default branch, or null if GitHub can't be reached */
export async function getLastCommitDate(repo: string): Promise<Date | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/commits?per_page=1`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'molina.digital',
        },
        next: { revalidate: REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!response.ok) return null;
    const [latest] = await response.json();
    const iso: unknown = latest?.commit?.committer?.date;
    if (typeof iso !== 'string') return null;
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    // A date is a nice-to-have: never break the page over it
    return null;
  }
}
