'use client';

import { useState } from 'react';

/*
 * Third-party OG images break, move or block hotlinking. Drop the image
 * instead of showing a broken icon. The ref check catches images that
 * failed before hydration, when onError had no listener yet.
 */
export function PreviewImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote hosts
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
  );
}
