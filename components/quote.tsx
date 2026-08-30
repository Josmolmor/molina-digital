'use client';

import Aurora from '@/components/aurora';
import { useSyncExternalStore } from 'react';

const subscribeToTheme = (onStoreChange: () => void) => {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  return () => observer.disconnect();
};

const getIsDarkTheme = () =>
  document.documentElement.classList.contains('dark');

export default function Quote() {
  const isDarkTheme = useSyncExternalStore(
    subscribeToTheme,
    getIsDarkTheme,
    () => false,
  );

  return (
    <div className="relative overflow-hidden p-8 rounded-2xl outline outline-primary shadow-lg">
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        aria-hidden="true"
      >
        <Aurora
          colorStops={['#709cff', '#48e6ec', '#0664d4']}
          blend={1}
          amplitude={1.0}
          speed={1}
          lightMode={!isDarkTheme}
        />
      </div>
      <p className="relative z-10 font-serif italic">
        Writing computer software is one of the purest creative activities in
        the history of the human race. Programmers aren&apos;t bound by
        practical limitations such as the laws of physics; we can create
        exciting virtual worlds with behaviors that could never exist in the
        real world. Programming doesn&apos;t require great physical skill or
        coordination like ballet or basketball. All programming requires is a
        creative mind and the ability to organize your thoughts. If you can
        visualize a system, you can probably implement it in a computer program.
        <span className="text-xs text-muted-foreground block mt-5">
          From &ldquo;A Philosophy of Software Design&rdquo; by John Ousterhout
        </span>
      </p>
    </div>
  );
}
