'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/* Quick stagger, capped so a long stash never makes anyone wait */
const STAGGER_MS = 40;
const STAGGER_MAX_STEPS = 10;

/*
 * Flipped once the first batch of cards has mounted. Module scope, so it
 * survives filter navigations but resets on a full load. Never set on the
 * server (effects don't run there), so SSR and hydration always agree.
 */
let settled = false;

/*
 * The staggered entrance is for arriving at the page. Filtering is a
 * frequent action: cards it reveals just fade in, quickly and all at once,
 * instead of replaying the stagger from their new position.
 *
 * Each card decides once, at mount, so cards already on screen never get
 * their animation swapped (which would restart it).
 */
export function CardEnter({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  const [initial] = useState(() => !settled);

  useEffect(() => {
    settled = true;
  }, []);

  return (
    <div
      className={cn(
        'mb-4 break-inside-avoid',
        initial
          ? // Reduced motion keeps the fade, drops the scale and blur
            'animate-stash-in motion-reduce:animate-stash-fade'
          : 'animate-stash-fade',
      )}
      style={
        initial
          ? {
              animationDelay: `${Math.min(index, STAGGER_MAX_STEPS) * STAGGER_MS}ms`,
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
