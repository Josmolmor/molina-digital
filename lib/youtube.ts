/*
 * YouTube URL parsing. Pure, so both the webhook (server) and the cards can
 * use it. Handles every shape a share sheet produces:
 *   youtube.com/watch?v=ID   (any param order, plus si/feature tracking)
 *   youtu.be/ID              youtube.com/shorts/ID
 *   youtube.com/live/ID      youtube.com/embed/ID
 *   m.youtube.com, music.youtube.com, youtube-nocookie.com
 */

export type YouTubeVideo = {
  id: string;
  /* Seconds, from ?t= or ?start= */
  start?: number;
};

const ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set([
  'youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
]);
const PATH_PREFIXES = ['shorts', 'live', 'embed', 'v'];

/* "90", "90s", "1m30s", "1h2m3s" */
function parseStart(value: string | null) {
  if (!value) return undefined;
  if (/^\d+s?$/.test(value)) return parseInt(value, 10) || undefined;

  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match) return undefined;
  const [, h = '0', m = '0', s = '0'] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s) || undefined;
}

export function parseYouTube(url: string): YouTubeVideo | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, '');
  const segments = parsed.pathname.split('/').filter(Boolean);
  let id: string | undefined;

  if (host === 'youtu.be') {
    id = segments[0];
  } else if (HOSTS.has(host)) {
    if (segments[0] === 'watch') id = parsed.searchParams.get('v') ?? undefined;
    else if (PATH_PREFIXES.includes(segments[0])) id = segments[1];
  }

  if (!id || !ID.test(id)) return null;

  const start = parseStart(
    parsed.searchParams.get('t') ?? parsed.searchParams.get('start'),
  );
  return { id, start };
}

/* Clean link to open on YouTube: no si/feature tracking, start time kept */
export function youTubeWatchUrl({ id, start }: YouTubeVideo) {
  return `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}s` : ''}`;
}

/* hqdefault exists for every video; maxres doesn't */
export function youTubeThumbnail({ id }: YouTubeVideo) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/* No-cookie host: nothing is tracked until someone actually presses play */
export function youTubeEmbedUrl({ id, start }: YouTubeVideo) {
  const params = new URLSearchParams({ autoplay: '1', rel: '0' });
  if (start) params.set('start', String(start));
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}
