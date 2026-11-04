'use client';

import { useState } from 'react';

import { Play } from '@/components/ui/icons/play';
import {
  youTubeEmbedUrl,
  youTubeThumbnail,
  type YouTubeVideo,
} from '@/lib/youtube';

/*
 * Thumbnail first, iframe on demand: each YouTube embed is ~1MB of script,
 * which a wall of cards can't afford. The click is a user gesture, so the
 * swapped-in player is allowed to autoplay.
 */
export function YouTubePlayer({
  video,
  title,
}: {
  video: YouTubeVideo;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full bg-black">
      {playing ? (
        <iframe
          src={youTubeEmbedUrl(video)}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${title}`}
          className="group/play absolute inset-0 grid place-items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- remote thumbnail */}
          <img
            src={youTubeThumbnail(video)}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
          {/* Fixed dark disc: it sits on arbitrary thumbnails, so it can't follow the theme */}
          <span className="relative grid size-12 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-transform duration-200 ease-out group-hover/play:scale-110 group-active/play:scale-95 motion-reduce:transition-none">
            <Play aria-hidden className="size-5 translate-x-px" />
          </span>
        </button>
      )}
    </div>
  );
}
