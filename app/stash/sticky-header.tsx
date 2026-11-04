'use client';

import { useEffect, useRef, type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/*
 * Pinned to the top so the way home and the tag filter are always in reach.
 * Transparent at the top of the page; once content scrolls under it, it
 * gets a blurred backdrop and a hairline (data-scrolled).
 */
export function StickyHeader({
  className,
  ...props
}: ComponentProps<'header'>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    const update = () => {
      const scrolled = String(window.scrollY > 4);
      if (header.dataset.scrolled !== scrolled)
        header.dataset.scrolled = scrolled;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <header
      ref={ref}
      className={cn(
        'sticky top-0 z-20 transition-[background-color] ease-[ease] motion-reduce:transition-none data-[scrolled=true]:saturate-120 data-[scrolled=true]:bg-background/50 data-[scrolled=true]:backdrop-blur-xs',
        className,
      )}
      {...props}
    />
  );
}
