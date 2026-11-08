import { Separator } from '@/components/ui/separator';
import { buildCalendar, getUsageDays, todayKey } from '@/lib/claude-usage';
import { formatDay, formatTokens } from './usage-format';
import { UsageGrid } from './usage-grid';

/* Renders nothing until there's data, so a missing or empty Redis never shows an empty grid */
export default async function ClaudeUsage() {
  const days = await getUsageDays();
  const calendar = buildCalendar(days, todayKey());
  if (calendar.total === 0) return null;

  const summary = [
    `Claude Code usage: ${formatTokens(calendar.total)} tokens in the last year.`,
    calendar.busiest &&
      `Busiest day: ${formatDay(calendar.busiest.date)}, ${formatTokens(calendar.busiest.tokens)} tokens.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className="flex flex-col gap-8">
      <h2 id="claude" className="font-medium text-2xl font-serif">
        Building with Claude
      </h2>
      <Separator />
      <p className="text-pretty">
        Most of what I make these days, I make pairing with Claude Code. Every
        token across my work and personal accounts, day by day.
      </p>
      <UsageGrid calendar={calendar} summary={summary} />
    </section>
  );
}
