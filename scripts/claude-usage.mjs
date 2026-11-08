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
 *
 * Env (or ~/.claude/claude-usage.env, KEY=value lines):
 *   CLAUDE_USAGE_SECRET  required to push
 *   CLAUDE_USAGE_URL     defaults to https://molina.digital
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

async function main() {
  const configDir = process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude');
  await loadEnvFile(join(configDir, 'claude-usage.env'));

  const days = await collect(join(configDir, 'projects'));
  const sorted = Object.fromEntries(
    Object.entries(days).sort(([a], [b]) => a.localeCompare(b)),
  );

  if (dryRun) {
    const format = new Intl.NumberFormat('en');
    let total = 0;
    for (const [day, tokens] of Object.entries(sorted)) {
      total += tokens;
      console.log(`${day}  ${format.format(tokens).padStart(14)}`);
    }
    console.log(`${'total'.padEnd(10)}  ${format.format(total).padStart(14)}`);
    return;
  }

  const secret = process.env.CLAUDE_USAGE_SECRET;
  if (!secret) {
    console.error(
      'claude-usage: CLAUDE_USAGE_SECRET is not set, skipping push',
    );
    return;
  }
  const base = process.env.CLAUDE_USAGE_URL ?? 'https://molina.digital';
  const response = await fetch(new URL('/api/claude-usage', base), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secret}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ days: sorted }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    console.error(`claude-usage: push failed with ${response.status}`);
  }
}

main().catch((error) => {
  console.error('claude-usage:', error?.message ?? error);
});
