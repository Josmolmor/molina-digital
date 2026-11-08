'use client';

import { useEffect, useRef, type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/*
 * A horizontal scroller whose edges fade out only when there's more to
 * scroll that way. JS just flags the edges (data-fade-start/end); the fade
 * itself is the .scroll-fade mask in globals.css, so it animates in CSS.
 *
 * An [aria-current="page"] child that starts out of view is scrolled into
 * view, without scrollIntoView, which would also move the page.
 * startAtEnd opens scrolled all the way right instead (e.g. a timeline
 * whose newest entries are last). Only on mount, never after the user scrolls.
 */
export function ScrollFade({
  className,
  children,
  startAtEnd = false,
  ...props
}: ComponentProps<'div'> & { startAtEnd?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && startAtEnd) el.scrollLeft = el.scrollWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const current = el.querySelector<HTMLElement>('[aria-current="page"]');
    if (current) {
      const start = current.offsetLeft;
      const end = start + current.offsetWidth;
      if (start < el.scrollLeft || end > el.scrollLeft + el.clientWidth) {
        el.scrollLeft = start - (el.clientWidth - current.offsetWidth) / 2;
      }
    }

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      el.dataset.fadeStart = String(el.scrollLeft > 1);
      el.dataset.fadeEnd = String(el.scrollLeft < max - 1);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
    // Re-run when the content changes, e.g. a new active item after navigating
  }, [children]);

  return (
    <div
      ref={ref}
      className={cn('scroll-fade relative overflow-x-auto', className)}
      {...props}
    >
      {children}
    </div>
  );
}
