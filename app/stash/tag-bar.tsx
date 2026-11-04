import Link from 'next/link';

import { ScrollFade } from '@/components/ui/scroll-fade';
import { cn } from '@/lib/utils';

export type TagCount = { tag: string; count: number };

const PILL =
  'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm [transition:background-color_150ms_ease,color_150ms_ease,scale_160ms_cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:active:scale-100';
const IDLE = 'bg-card text-muted-foreground hover:text-foreground';
const ACTIVE = 'bg-foreground text-background';

function Pill({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(PILL, active ? ACTIVE : IDLE)}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'font-mono text-xs tabular-nums',
            active ? 'text-background/70' : 'text-muted-foreground',
          )}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

export function TagBar({
  tags,
  active,
  total,
}: {
  tags: TagCount[];
  active?: string;
  total: number;
}) {
  if (tags.length === 0) return null;

  return (
    <nav aria-label="Filter by tag">
      {/* One row that scrolls sideways; py-1 keeps focus rings unclipped */}
      <ScrollFade className="-my-1 flex gap-2 py-1">
        <Pill href="/stash" active={!active} label="All" count={total} />
        {tags.map(({ tag, count }) => (
          <Pill
            key={tag}
            /* Tapping the active tag clears the filter */
            href={
              active === tag
                ? '/stash'
                : `/stash?tag=${encodeURIComponent(tag)}`
            }
            active={active === tag}
            label={`#${tag}`}
            count={count}
          />
        ))}
      </ScrollFade>
    </nav>
  );
}
