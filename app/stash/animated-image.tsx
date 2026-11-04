'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

/*
 * A GIF, as Telegram stores it: a silent MP4 loop. Plays like a GIF, but
 * only while on screen, and never on its own for people who asked for
 * reduced motion: they get a paused first frame that plays on tap, Enter
 * or Space. (Not native controls: they'd sit under the date pill.)
 */
export function AnimatedImage({
  src,
  label,
  width,
  height,
}: {
  src: string;
  label: string;
  width?: number;
  height?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      // play() rejects if the browser blocks it; the poster frame is fine then
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <video
      ref={ref}
      /* #t nudges Safari into painting the first frame before playback */
      src={`${src}#t=0.001`}
      aria-label={reducedMotion ? `${label} (press to play or pause)` : label}
      width={width}
      height={height}
      muted
      loop
      playsInline
      preload="metadata"
      {...(reducedMotion && {
        tabIndex: 0,
        onClick: toggle,
        onKeyDown: (event: KeyboardEvent) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          toggle();
        },
      })}
      className="h-auto w-full bg-muted motion-reduce:cursor-pointer"
      style={
        width && height ? { aspectRatio: `${width} / ${height}` } : undefined
      }
    />
  );
}
