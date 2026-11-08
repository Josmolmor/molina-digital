import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';

import { mergeUsageDays, parseUsageDays, USAGE_TAG } from '@/lib/claude-usage';

/* Receives daily token totals from scripts/claude-usage.mjs */

/* Hash both sides so timingSafeEqual gets equal lengths and leaks nothing */
function isAuthorized(request: Request) {
  const expected = process.env.CLAUDE_USAGE_SECRET;
  const header = request.headers.get('authorization');
  const received = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!expected || !received) return false;
  const digest = (value: string) =>
    new Uint8Array(createHash('sha256').update(value).digest());
  return timingSafeEqual(digest(expected), digest(received));
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 });
  }
  const days = parseUsageDays(body);
  if (!days) return Response.json({ error: 'invalid days' }, { status: 400 });

  const updated = await mergeUsageDays(days);
  if (updated > 0) revalidateTag(USAGE_TAG);
  return Response.json({ updated });
}
