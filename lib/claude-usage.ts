import { unstable_cache } from 'next/cache';

import { redis } from '@/lib/redis';

/*
 * Daily Claude Code token totals, pushed from my machine by
 * scripts/claude-usage.mjs and rendered as the home page usage graph.
 *
 * Two hashes: real totals from the session logs, and estimates for days
 * whose logs were gone before tracking started (prompts that day × the
 * average tokens per prompt). A real total always wins over an estimate.
 * Server-only: never import from a client component.
 */

export type UsageDays = Record<string, number>;

export const USAGE_TAG = 'claude-usage';
export const USAGE_TIME_ZONE = 'Europe/Madrid';
const DAYS_KEY = 'claude-usage:days';
const ESTIMATES_KEY = 'claude-usage:estimates';
const WEEKS = 53;

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DAYS = 800;

/* Returns null unless value is { "YYYY-MM-DD": non-negative integer } */
export function parseDayMap(days: unknown): UsageDays | null {
  if (!days || typeof days !== 'object' || Array.isArray(days)) return null;
  const entries = Object.entries(days);
  if (entries.length > MAX_DAYS) return null;
  for (const [day, tokens] of entries) {
    if (!DAY_PATTERN.test(day) || Number.isNaN(Date.parse(day))) return null;
    if (!Number.isSafeInteger(tokens) || (tokens as number) < 0) return null;
  }
  return days as UsageDays;
}

/*
 * Keeps the larger value per day, so a day whose local logs were partly
 * cleaned up never shrinks. Read-modify-write: fine for a single writer.
 */
export async function mergeUsageDays(incoming: UsageDays) {
  const existing = (await redis().hgetall<UsageDays>(DAYS_KEY)) ?? {};
  const changed: UsageDays = {};
  for (const [day, tokens] of Object.entries(incoming)) {
    if (tokens > (Number(existing[day]) || 0)) changed[day] = tokens;
  }
  if (Object.keys(changed).length > 0) await redis().hset(DAYS_KEY, changed);
  return Object.keys(changed).length;
}

/* Estimates are replaced wholesale, so a recalibrated backfill drops stale days */
export async function replaceUsageEstimates(estimates: UsageDays) {
  const tx = redis().multi();
  tx.del(ESTIMATES_KEY);
  if (Object.keys(estimates).length > 0) tx.hset(ESTIMATES_KEY, estimates);
  await tx.exec();
  return Object.keys(estimates).length;
}

export type Usage = { days: UsageDays; estimates: UsageDays };

/* Refreshed by revalidateTag on every push; the daily revalidate is a fallback */
const readUsage = unstable_cache(
  async (): Promise<Usage> => {
    const [days, estimates] = await Promise.all([
      redis().hgetall<UsageDays>(DAYS_KEY),
      redis().hgetall<UsageDays>(ESTIMATES_KEY),
    ]);
    return { days: days ?? {}, estimates: estimates ?? {} };
  },
  [DAYS_KEY, ESTIMATES_KEY],
  { tags: [USAGE_TAG], revalidate: 86400 },
);

/* Failures are caught outside the cache, so a Redis hiccup isn't cached for a day */
export async function getUsage(): Promise<Usage> {
  try {
    return await readUsage();
  } catch {
    return { days: {}, estimates: {} };
  }
}

export type UsageCell = {
  date: string;
  tokens: number;
  level: number;
  estimated: boolean;
};

export type UsageCalendar = {
  /* WEEKS columns of 7 days, Sunday first; null for days after today */
  weeks: (UsageCell | null)[][];
  months: { column: number; label: string }[];
  total: number;
  busiest: UsageCell | null;
  /* First day with a real total, when any day in view is an estimate */
  estimatedBefore: string | null;
};

const toKey = (date: Date) => date.toISOString().slice(0, 10);

export function todayKey(timeZone = USAGE_TIME_ZONE) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/* Level thresholds are the quartiles of the active days in view, like GitHub */
function quartiles(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const at = (p: number) =>
    sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
  return [at(0.25), at(0.5), at(0.75)];
}

/* All date math in UTC on plain YYYY-MM-DD keys, so DST never shifts a day */
export function buildCalendar(
  { days, estimates }: Usage,
  today: string,
): UsageCalendar {
  const end = new Date(`${today}T00:00:00Z`);
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - end.getUTCDay() - (WEEKS - 1) * 7);

  const dates: string[] = [];
  for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(toKey(d));
  }

  const real = (date: string) => Number(days[date]) || 0;
  const tokensOn = (date: string) => real(date) || Number(estimates[date]) || 0;

  const active = dates.map(tokensOn).filter((tokens) => tokens > 0);
  const [q1, q2, q3] = active.length ? quartiles(active) : [0, 0, 0];
  const levelOf = (tokens: number) =>
    tokens <= 0
      ? 0
      : tokens <= q1
        ? 1
        : tokens <= q2
          ? 2
          : tokens <= q3
            ? 3
            : 4;

  const weeks: (UsageCell | null)[][] = [];
  const months: UsageCalendar['months'] = [];
  const monthName = new Intl.DateTimeFormat('en', {
    month: 'short',
    timeZone: 'UTC',
  });
  let total = 0;
  let busiest: UsageCell | null = null;
  let anyEstimated = false;

  for (let w = 0; w < WEEKS; w++) {
    const week: (UsageCell | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const date = dates[w * 7 + d];
      if (!date) {
        week.push(null);
        continue;
      }
      const tokens = tokensOn(date);
      const estimated = tokens > 0 && real(date) === 0;
      anyEstimated ||= estimated;
      const cell = { date, tokens, level: levelOf(tokens), estimated };
      total += tokens;
      if (tokens > 0 && (!busiest || tokens > busiest.tokens)) busiest = cell;
      week.push(cell);
    }
    weeks.push(week);

    /* Label a column when its Sunday starts a new month, unless it would crowd the previous label */
    const sunday = new Date(`${dates[w * 7]}T00:00:00Z`);
    const previous = new Date(sunday);
    previous.setUTCDate(sunday.getUTCDate() - 7);
    if (w === 0 || sunday.getUTCMonth() !== previous.getUTCMonth()) {
      const last = months.at(-1);
      if (last && w - last.column < 3) months.pop();
      months.push({ column: w, label: monthName.format(sunday) });
    }
  }

  const firstReal = Object.keys(days)
    .filter((date) => real(date) > 0)
    .sort()[0];
  const estimatedBefore = anyEstimated ? (firstReal ?? null) : null;

  return { weeks, months, total, busiest, estimatedBefore };
}
