import { buildCalendar, getUsage, todayKey } from '@/lib/claude-usage';
import { formatDay, formatMonthDay, formatTokens } from './usage-format';
import { UsageGrid } from './usage-grid';
import { SlideIn } from '@/components/ui/slide-in';
import { cn } from '@/lib/utils';

/* Renders nothing until there's data, so a missing or empty Redis never shows an empty grid */
export default async function ClaudeUsage({
  className,
}: {
  className?: string;
}) {
  const calendar = buildCalendar(await getUsage(), todayKey());
  if (calendar.total === 0) return null;

  const summary = [
    `Claude Code usage: ${calendar.estimatedBefore ? 'about ' : ''}${formatTokens(calendar.total)} tokens in the last year.`,
    calendar.estimatedBefore &&
      `Days before ${formatMonthDay(calendar.estimatedBefore)} are estimated from prompt history.`,
    calendar.busiest &&
      `Busiest day: ${formatDay(calendar.busiest.date)}, ${formatTokens(calendar.busiest.tokens)} tokens.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={cn('flex flex-col gap-8', className)}>
      {/* Same entrance as the footer: slides up the first time it scrolls into view */}
      <SlideIn>
        <UsageGrid calendar={calendar} summary={summary} />
      </SlideIn>
    </section>
  );
}
