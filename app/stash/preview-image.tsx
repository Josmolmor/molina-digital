'use client';

import { useState, type ReactNode } from 'react';

/*
 * Third-party OG images break, move or block hotlinking. Drop the image
 * instead of showing a broken icon. The ref check catches images that
 * failed before hydration, when onError had no listener yet.
 */
export function PreviewImage({
  src,
  overlay,
  fallback = null,
}: {
  src: string;
  /* Positioned over the image (e.g. tag chips) */
  overlay?: ReactNode;
  /* Rendered instead when the image fails, so the overlay isn't lost */
  fallback?: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return fallback;

  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary remote hosts */}
      <img
        ref={(img) => {
          if (img?.complete && img.naturalWidth === 0) setFailed(true);
        }}
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="aspect-1200/630 w-full bg-muted object-cover"
      />
      {overlay}
    </div>
  );
}
