#!/usr/bin/env node
/*
 * Sums this machine's Claude Code token usage per day (Europe/Madrid) from
 * the local session logs and pushes the totals to molina.digital, where they
 * accumulate in Redis and render as the usage graph on the home page.
 *
 * A day counts input + output + cache-creation tokens. Cache reads are left
 * out: they dwarf everything else and would flatten the graph.
 *
 *   node scripts/claude-usage.mjs            # push
 *   node scripts/claude-usage.mjs --dry-run  # print the daily totals only
 *   node scripts/claude-usage.mjs --backfill [--dry-run]
 *
 * --backfill estimates the days from before the oldest surviving session log
 * (Claude Code prunes them) using the prompt history in history.jsonl, which
 * outlives the logs: prompts that day × the average tokens per prompt,
 * measured on the days that have both. Estimates are stored apart from real
 * totals, are labelled on the site, and never override a real day.
 *
 * Env (or ~/.claude/claude-usage.env, KEY=value lines):
 *   CLAUDE_USAGE_SECRET  required to push
 *   CLAUDE_USAGE_URL     defaults to https://www.molina.digital (the apex
 *                        redirects there, and a cross-host redirect drops
 *                        the Authorization header)
 *   CLAUDE_CONFIG_DIR    defaults to ~/.claude
 *
 * Runs from a SessionEnd hook, so it never fails loudly: errors go to stderr
 * and it always exits 0.
 */
import { createReadStream } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

const TIME_ZONE = 'Europe/Madrid';
const dryRun = process.argv.includes('--dry-run');
const backfill = process.argv.includes('--backfill');

async function loadEnvFile(path) {
  try {
    const text = await readFile(path, 'utf8');
    for (const line of text.split('\n')) {
      const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  } catch {
    // Optional file
  }
}

async function* jsonlFiles(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* jsonlFiles(path);
    else if (entry.isFile() && entry.name.endsWith('.jsonl')) yield path;
  }
}

const dayOf = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function tokensOf(usage) {
  const n = (value) => (Number.isFinite(value) && value > 0 ? value : 0);
  return (
    n(usage.input_tokens) +
    n(usage.output_tokens) +
    n(usage.cache_creation_input_tokens)
  );
}

async function collect(projectsDir) {
  /* Streamed replies log several lines per message; keep the fullest one */
  const messages = new Map();

  for await (const file of jsonlFiles(projectsDir)) {
    const lines = createInterface({
      input: createReadStream(file),
      crlfDelay: Infinity,
    });
    for await (const line of lines) {
      if (!line.includes('"usage"')) continue;
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }
      const usage = entry?.message?.usage;
      if (entry?.type !== 'assistant' || !usage || !entry.timestamp) continue;
      const time = new Date(entry.timestamp);
      if (Number.isNaN(time.getTime())) continue;

      const key = `${entry.message.id ?? entry.uuid}:${entry.requestId ?? ''}`;
      const tokens = tokensOf(usage);
      const previous = messages.get(key);
      if (!previous || tokens > previous.tokens) {
        messages.set(key, { tokens, day: dayOf.format(time) });
      }
    }
  }

  const days = {};
  for (const { tokens, day } of messages.values()) {
    if (tokens > 0) days[day] = (days[day] ?? 0) + tokens;
  }
  return days;
}

/* Prompts per day, from the history Claude Code keeps of everything typed */
async function promptsPerDay(historyFile) {
  const days = {};
  let lines;
  try {
    lines = createInterface({
      input: createReadStream(historyFile),
      crlfDelay: Infinity,
    });
    for await (const line of lines) {
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }
      if (!Number.isFinite(entry?.timestamp)) continue;
      const day = dayOf.format(new Date(entry.timestamp));
      days[day] = (days[day] ?? 0) + 1;
    }
  } catch {
    // No history yet
  }
  return days;
}

/*
 * Claude Code's /stats cache keeps real per-day input + output tokens, but
 * cache writes only as a running total per model. Split that total across
 * its days by message count, so the days still add up to the real total.
 */
async function statsCacheDays(statsFile) {
  let stats;
  try {
    stats = JSON.parse(await readFile(statsFile, 'utf8'));
  } catch {
    return {};
  }
  const activity = stats.dailyActivity ?? [];
  const inOut = Object.fromEntries(
    (stats.dailyModelTokens ?? []).map(({ date, tokensByModel }) => [
      date,
      Object.values(tokensByModel ?? {}).reduce((a, b) => a + b, 0),
    ]),
  );
  const cacheWrites = Object.values(stats.modelUsage ?? {}).reduce(
    (sum, model) => sum + (model.cacheCreationInputTokens ?? 0),
    0,
  );
  const messages = activity.reduce((sum, day) => sum + day.messageCount, 0);

  const days = {};
  for (const { date, messageCount } of activity) {
    const share = messages > 0 ? messageCount / messages : 0;
    days[date] = Math.round((inOut[date] ?? 0) + cacheWrites * share);
  }
  return days;
}

const dayNumber = (day) => Date.parse(`${day}T00:00:00Z`) / 86_400_000;

/* Tokens per prompt across a set of days, placed at the set's middle day */
function anchor(totals, prompts) {
  const days = Object.keys(totals).filter((day) => prompts[day] > 0);
  const count = days.reduce((sum, day) => sum + prompts[day], 0);
  if (count === 0) return null;
  const tokens = days.reduce((sum, day) => sum + totals[day], 0);
  const at = days.reduce((sum, day) => sum + dayNumber(day), 0) / days.length;
  return { ratio: tokens / count, at, days: days.length };
}

/*
 * Every day before the oldest log gets an estimate: the stats-cache figure
 * where there is one, else prompts × a tokens-per-prompt ratio that slides
 * linearly between the two measured periods (and holds flat outside them).
 */
function estimate(real, prompts, stats) {
  const firstReal = Object.keys(real).sort()[0];
  if (!firstReal) return { estimates: {}, anchors: [], firstReal };

  const anchors = [anchor(stats, prompts), anchor(real, prompts)]
    .filter(Boolean)
    .sort((a, b) => a.at - b.at);
  const ratioOn = (day) => {
    const x = dayNumber(day);
    const [first, last] = [anchors[0], anchors.at(-1)];
    if (x <= first.at) return first.ratio;
    if (x >= last.at) return last.ratio;
    const t = (x - first.at) / (last.at - first.at);
    return first.ratio + t * (last.ratio - first.ratio);
  };

  const estimates = {};
  for (const day of new Set([...Object.keys(prompts), ...Object.keys(stats)])) {
    if (day >= firstReal) continue;
    const tokens = stats[day] ?? Math.round((prompts[day] ?? 0) * ratioOn(day));
    if (tokens > 0) estimates[day] = tokens;
  }
  return { estimates, anchors, firstReal };
}

function printTable(days) {
  const format = new Intl.NumberFormat('en');
  let total = 0;
  for (const [day, tokens] of Object.entries(days).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    total += tokens;
    console.log(`${day}  ${format.format(tokens).padStart(14)}`);
  }
  console.log(`${'total'.padEnd(10)}  ${format.format(total).padStart(14)}`);
}

async function main() {
  const configDir = process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude');
  await loadEnvFile(join(configDir, 'claude-usage.env'));

  const days = await collect(join(configDir, 'projects'));
  const sorted = Object.fromEntries(
    Object.entries(days).sort(([a], [b]) => a.localeCompare(b)),
  );

  let payload = { days: sorted };
  if (backfill) {
    const prompts = await promptsPerDay(join(configDir, 'history.jsonl'));
    const stats = await statsCacheDays(join(configDir, 'stats-cache.json'));
    const { estimates, anchors, firstReal } = estimate(sorted, prompts, stats);
    for (const { ratio, at, days } of anchors) {
      const day = new Date(at * 86_400_000).toISOString().slice(0, 10);
      console.log(
        `claude-usage: ~${Math.round(ratio).toLocaleString('en')} tokens per prompt around ${day} (${days} days)`,
      );
    }
    console.log(
      `claude-usage: estimating ${Object.keys(estimates).length} days before ${firstReal}`,
    );
    payload = { estimates };
    if (dryRun) {
      printTable(estimates);
      return;
    }
  } else if (dryRun) {
    printTable(sorted);
    return;
  }

  const secret = process.env.CLAUDE_USAGE_SECRET;
  if (!secret) {
    console.error(
      'claude-usage: CLAUDE_USAGE_SECRET is not set, skipping push',
    );
    return;
  }
  const base = process.env.CLAUDE_USAGE_URL ?? 'https://www.molina.digital';
  const response = await fetch(new URL('/api/claude-usage', base), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secret}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
    /* Don't follow: the retry would arrive without the secret and read as a 401 */
    redirect: 'manual',
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status >= 300 && response.status < 400) {
    console.error(
      `claude-usage: ${base} redirects to ${response.headers.get('location')}, set CLAUDE_USAGE_URL to that host`,
    );
  } else if (!response.ok) {
    console.error(`claude-usage: push failed with ${response.status}`);
  }
}

main().catch((error) => {
  console.error('claude-usage:', error?.message ?? error);
});
