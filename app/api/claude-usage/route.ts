import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';

import {
  mergeUsageDays,
  parseDayMap,
  replaceUsageEstimates,
  USAGE_TAG,
} from '@/lib/claude-usage';

/*
 * Receives daily token totals from scripts/claude-usage.mjs:
 * { days?: {...}, estimates?: {...} }, at least one of them
 */

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
  const { days, estimates } = (body ?? {}) as Record<string, unknown>;
  const parsedDays = days === undefined ? undefined : parseDayMap(days);
  const parsedEstimates =
    estimates === undefined ? undefined : parseDayMap(estimates);
  if (
    parsedDays === null ||
    parsedEstimates === null ||
    (!parsedDays && !parsedEstimates)
  ) {
    return Response.json({ error: 'invalid days' }, { status: 400 });
  }

  const updated = parsedDays ? await mergeUsageDays(parsedDays) : 0;
  const estimated = parsedEstimates
    ? await replaceUsageEstimates(parsedEstimates)
    : 0;
  if (updated > 0 || parsedEstimates) revalidateTag(USAGE_TAG);
  return Response.json({ updated, estimated });
}
