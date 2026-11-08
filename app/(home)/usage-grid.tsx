'use client';

import { useState, type PointerEvent } from 'react';

import { ScrollFade } from '@/components/ui/scroll-fade';
import type { UsageCalendar } from '@/lib/claude-usage';
import { cn } from '@/lib/utils';
import { formatDay, formatTokens } from './usage-format';

/* Empty days sit on the border colour; activity mixes in the primary, so both themes follow */
const LEVELS = [
  'bg-border',
  'bg-[color-mix(in_oklch,var(--primary)_30%,var(--border))]',
  'bg-[color-mix(in_oklch,var(--primary)_55%,var(--border))]',
  'bg-[color-mix(in_oklch,var(--primary)_80%,var(--border))]',
  'bg-primary',
];

const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

type Hovered = { date: string; tokens: number } | null;

export function UsageGrid({
  calendar,
  summary,
}: {
  calendar: UsageCalendar;
  summary: string;
}) {
  const [hovered, setHovered] = useState<Hovered>(null);
  const columns = calendar.weeks.length;

  /* One delegated handler instead of a listener (or tooltip) per cell */
  const onPointerOver = (event: PointerEvent<HTMLDivElement>) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-date]',
    );
    if (!cell) return;
    setHovered({
      date: cell.dataset.date!,
      tokens: Number(cell.dataset.tokens),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <ScrollFade startAtEnd className="-mx-1 px-1">
        <div
          role="img"
          aria-label={summary}
          className="grid min-w-[40rem] grid-cols-[auto_1fr] gap-x-2 gap-y-1.5"
        >
          <div aria-hidden />
          <div
            aria-hidden
            className="grid text-muted-foreground font-mono text-[10px] leading-none"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {calendar.months.map(({ column, label }) => (
              <span
                key={column}
                className="whitespace-nowrap"
                style={{ gridColumnStart: column + 1 }}
              >
                {label}
              </span>
            ))}
          </div>

          <div
            aria-hidden
            className="grid grid-rows-7 gap-[3px] text-muted-foreground font-mono text-[10px] leading-none"
          >
            {WEEKDAYS.map((label, i) => (
              <span key={i} className="flex items-center">
                {label}
              </span>
            ))}
          </div>
          <div
            aria-hidden
            onPointerOver={onPointerOver}
            onPointerLeave={() => setHovered(null)}
            className="grid grid-flow-col grid-rows-7 auto-cols-fr gap-[3px]"
          >
            {calendar.weeks.flatMap((week, w) =>
              week.map((cell, d) =>
                cell ? (
                  <div
                    key={cell.date}
                    data-date={cell.date}
                    data-tokens={cell.tokens}
                    className={cn(
                      'aspect-square rounded-[2px]',
                      LEVELS[cell.level],
                      hovered?.date === cell.date &&
                        'outline outline-1 outline-offset-1 outline-foreground/40',
                    )}
                  />
                ) : (
                  <div key={`empty-${w}-${d}`} className="aspect-square" />
                ),
              ),
            )}
          </div>
        </div>
      </ScrollFade>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 font-mono text-xs tabular-nums text-muted-foreground">
        {/* Swaps instantly: it tracks the pointer, so any transition would lag behind it */}
        <span aria-hidden>
          {hovered
            ? `${formatDay(hovered.date)} · ${hovered.tokens ? `${formatTokens(hovered.tokens)} tokens` : 'no usage'}`
            : `${formatTokens(calendar.total)} tokens in the last year`}
        </span>
        <span aria-hidden className="flex shrink-0 items-center gap-1">
          Less
          {LEVELS.map((level) => (
            <span key={level} className={cn('size-2.5 rounded-[2px]', level)} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
