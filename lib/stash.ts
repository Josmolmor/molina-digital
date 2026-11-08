import { redis } from '@/lib/redis';
import { parseYouTube, youTubeWatchUrl } from '@/lib/youtube';

/*
 * Stash: things saved from around the internet, sent to a private Telegram
 * bot and rendered publicly at /stash. Server-only: never import from a
 * client component.
 */

export type LinkPreview = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
};

type StashBase = {
  /* The Telegram message_id: unique per chat, so webhook retries can't duplicate */
  id: number;
  createdAt: number;
  note?: string;
  /* Normalised: lowercase, no '#'. See normalizeTag */
  tags?: string[];
};

export type StashItem = StashBase &
  (
    | { kind: 'link'; url: string; preview?: LinkPreview }
    | {
        kind: 'image';
        fileId: string;
        /* video/* means an animation: a GIF, which Telegram stores as MP4 */
        mimeType: string;
        width?: number;
        height?: number;
      }
    | { kind: 'text'; text: string }
  );

/* Raster only: an SVG served from our origin could run script */
export const STASH_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

/* Telegram's GIFs ("animations") are silent MP4 loops */
export const STASH_ANIMATION_TYPES = new Set(['video/mp4', 'image/gif']);

export function isAnimation(mimeType: string) {
  return mimeType.startsWith('video/');
}

const ITEMS_KEY = 'stash:items';
const ORDER_KEY = 'stash:order';
const PAGE_SIZE = 200;

/* Returns false when the item already exists (a retried webhook) */
export async function addItem(item: StashItem) {
  const created = await redis().hsetnx(ITEMS_KEY, String(item.id), item);
  if (!created) return false;
  await redis().zadd(ORDER_KEY, { score: item.createdAt, member: item.id });
  return true;
}

export async function removeItem(id: number) {
  const [removed] = await Promise.all([
    redis().hdel(ITEMS_KEY, String(id)),
    redis().zrem(ORDER_KEY, id),
  ]);
  return removed > 0;
}

/* Read-modify-write: fine for a single writer (the owner's bot) */
export async function updateItem(
  id: number,
  update: (item: StashItem) => StashItem,
) {
  const item = await getItem(id);
  if (!item) return false;
  await redis().hset(ITEMS_KEY, { [String(id)]: update(item) });
  return true;
}

export const MAX_TAGS = 10;

/* "#Inspo" → "inspo". Letters (any script), digits and _, like Telegram hashtags */
export function normalizeTag(raw: string) {
  return raw
    .replace(/^#/, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_]/gu, '');
}

export function mergeTags(...lists: (string[] | undefined)[]) {
  const tags = [...new Set(lists.flat().filter((tag): tag is string => !!tag))];
  return tags.length ? tags.slice(0, MAX_TAGS) : undefined;
}

export async function getItem(id: number) {
  return redis().hget<StashItem>(ITEMS_KEY, String(id));
}

/* Newest first */
export async function getItems(): Promise<StashItem[]> {
  const ids = await redis().zrange<(string | number)[]>(
    ORDER_KEY,
    0,
    PAGE_SIZE - 1,
    { rev: true },
  );
  if (ids.length === 0) return [];

  const items = await redis().hmget<Record<string, StashItem>>(
    ITEMS_KEY,
    ...ids.map(String),
  );
  if (!items) return [];

  return ids
    .map((id) => items[String(id)])
    .filter((item): item is StashItem => Boolean(item));
}

/* ------------------------------------------------------------------ */
/* Link previews                                                       */
/* ------------------------------------------------------------------ */

const PREVIEW_TIMEOUT_MS = 5000;
/* Upper bound on HTML read per link; YouTube's page alone puts its tags ~780KB in */
const MAX_HTML_BYTES = 1536 * 1024;
const USER_AGENT =
  'Mozilla/5.0 (compatible; StashBot/1.0; +https://molina.digital/stash)';

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeEntities(value: string) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const code =
        entity[1].toLowerCase() === 'x'
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return ENTITIES[entity.toLowerCase()] ?? match;
  });
}

async function readHead(response: Response) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let html = '';
  let bytes = 0;

  while (bytes < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    html += decoder.decode(value, { stream: true });
    /*
     * Past </head> isn't enough: Next.js 15 streams metadata into the body
     * for UAs it doesn't know as bots, so keep going until og:image shows up
     */
    if (/<\/head>/i.test(html) && /og:image/i.test(html)) break;
  }

  reader.cancel().catch(() => {});
  return html;
}

function parseMeta(html: string) {
  const meta = new Map<string, string>();

  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = new Map<string, string>();
    for (const [, name, , double, single] of tag.matchAll(
      /([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g,
    )) {
      attrs.set(name.toLowerCase(), double ?? single ?? '');
    }

    const key = (attrs.get('property') ?? attrs.get('name'))?.toLowerCase();
    const content = attrs.get('content');
    if (key && content && !meta.has(key)) {
      meta.set(key, decodeEntities(content).trim());
    }
  }

  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  if (title) meta.set('<title>', decodeEntities(title).trim());

  return meta;
}

function absolute(url: string | undefined, base: string) {
  if (!url) return undefined;
  try {
    const resolved = new URL(url, base);
    return resolved.protocol === 'https:' || resolved.protocol === 'http:'
      ? resolved.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

/* Small JSON instead of ~1.5MB of HTML; the card builds its own thumbnail */
async function fetchYouTubePreview(
  url: string,
): Promise<LinkPreview | undefined> {
  const video = parseYouTube(url);
  if (!video) return undefined;
  try {
    const endpoint = new URL('https://www.youtube.com/oembed');
    endpoint.searchParams.set('format', 'json');
    endpoint.searchParams.set('url', youTubeWatchUrl(video));
    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(PREVIEW_TIMEOUT_MS),
    });
    if (!response.ok) return undefined;
    const data: { title?: string; author_name?: string } =
      await response.json();
    if (!data.title) return undefined;
    return {
      title: data.title,
      description: data.author_name,
      siteName: 'YouTube',
    };
  } catch {
    return undefined;
  }
}

export async function fetchLinkPreview(
  url: string,
): Promise<LinkPreview | undefined> {
  // Private or age-gated videos have no oEmbed: fall through to the page
  const youTube = await fetchYouTubePreview(url);
  if (youTube) return youTube;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      redirect: 'follow',
      signal: AbortSignal.timeout(PREVIEW_TIMEOUT_MS),
    });
    if (!response.ok) return undefined;
    if (!response.headers.get('content-type')?.includes('text/html')) {
      return undefined;
    }

    const meta = parseMeta(await readHead(response));
    const pick = (...keys: string[]) =>
      keys.map((key) => meta.get(key)).find(Boolean) || undefined;

    const preview: LinkPreview = {
      title: pick('og:title', 'twitter:title', '<title>'),
      description: pick('og:description', 'twitter:description', 'description'),
      image: absolute(
        pick('og:image', 'og:image:url', 'twitter:image', 'twitter:image:src'),
        response.url || url,
      ),
      siteName: pick('og:site_name', 'application-name'),
    };

    return Object.values(preview).some(Boolean) ? preview : undefined;
  } catch {
    // A preview is a nice-to-have: the link still gets saved without one
    return undefined;
  }
}
