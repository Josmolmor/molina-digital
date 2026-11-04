'use client';

import { useEffect, useState } from 'react';

import { ArrowUp } from '@/components/ui/icons/arrow-up';
import { cn } from '@/lib/utils';

/* Shows up after a screen's worth of scrolling; a long stash is a long way up */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      /* Out of the tab order and the accessibility tree while hidden */
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        'fixed right-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-20 grid size-11 place-items-center rounded-full bg-foreground text-background shadow-lg',
        'transition-[opacity,scale,translate] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] active:duration-150',
        visible
          ? 'opacity-100'
          : 'pointer-events-none translate-y-2 scale-90 opacity-0 motion-reduce:translate-y-0 motion-reduce:scale-100',
      )}
    >
      <ArrowUp aria-hidden className="size-5" />
    </button>
  );
}
