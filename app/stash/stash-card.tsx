import type { CSSProperties } from 'react';

import type { StashItem } from '@/lib/stash';
import { cn } from '@/lib/utils';
import { parseYouTube, youTubeWatchUrl } from '@/lib/youtube';

import { PreviewImage } from './preview-image';
import { YouTubePlayer } from './youtube-player';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Madrid',
});

const CARD =
  'mb-4 flex break-inside-avoid flex-col overflow-hidden rounded-2xl bg-card animate-stash-in motion-reduce:animate-none';

/* Quick stagger, capped so a long stash never makes anyone wait */
const STAGGER_MS = 40;
const STAGGER_MAX_STEPS = 10;

function enter(index: number): CSSProperties {
  return {
    animationDelay: `${Math.min(index, STAGGER_MAX_STEPS) * STAGGER_MS}ms`,
  };
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function DateTime({
  item,
  className,
}: {
  item: StashItem;
  className?: string;
}) {
  return (
    <time
      dateTime={new Date(item.createdAt).toISOString()}
      className={cn('font-mono text-xs tabular-nums', className)}
    >
      {dateFormat.format(item.createdAt)}
    </time>
  );
}

function Meta({ item, label }: { item: StashItem; label?: string }) {
  return (
    <p className="flex items-center justify-between gap-3 font-mono text-xs tabular-nums text-muted-foreground">
      {label && <span className="min-w-0 truncate">{label}</span>}
      <DateTime item={item} className="ml-auto shrink-0" />
    </p>
  );
}

function Note({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="whitespace-pre-wrap text-pretty">{children}</p>;
}

export function StashCard({ item, index }: { item: StashItem; index: number }) {
  switch (item.kind) {
    case 'link': {
      const { preview } = item;
      const video = parseYouTube(item.url);

      /* Not a single <a>: the player inside it is a button of its own */
      if (video) {
        const title = preview?.title ?? 'YouTube video';
        return (
          <article className={CARD} style={enter(index)}>
            <YouTubePlayer video={video} title={title} />
            <div className="flex flex-col gap-2 p-4.5">
              <div className="flex flex-col gap-1">
                <a
                  href={youTubeWatchUrl(video)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leading-6.5 font-medium text-pretty underline-offset-2 hover:underline"
                >
                  {title}
                </a>
                {preview?.description && (
                  <span className="line-clamp-3 text-sm text-muted-foreground text-pretty">
                    {preview.description}
                  </span>
                )}
              </div>
              <Note>{item.note}</Note>
              <Meta item={item} label="YouTube" />
            </div>
          </article>
        );
      }

      const site = preview?.siteName ?? hostname(item.url);
      return (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(CARD, 'group')}
          style={enter(index)}
        >
          {preview?.image && <PreviewImage src={preview.image} />}
          <div className="flex flex-col gap-2 p-4.5">
            <div className="flex flex-col gap-1">
              <span className="leading-6.5 font-medium text-pretty underline-offset-2 group-hover:underline">
                {preview?.title ?? hostname(item.url)}
              </span>
              {preview?.description && (
                <span className="line-clamp-3 text-sm text-muted-foreground text-pretty">
                  {preview.description}
                </span>
              )}
            </div>
            <Note>{item.note}</Note>
            <Meta item={item} label={site} />
          </div>
        </a>
      );
    }

    case 'image':
      return (
        <figure className={CARD} style={enter(index)}>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- streamed from Telegram via our proxy */}
            <img
              src={`/api/stash/image/${item.id}`}
              alt={item.note ?? ''}
              width={item.width}
              height={item.height}
              loading="lazy"
              decoding="async"
              className="h-auto w-full bg-muted"
            />
            {/* Fixed dark pill: it sits on arbitrary photos, so it can't follow the theme */}
            <DateTime
              item={item}
              className="absolute top-3 right-3 rounded-full bg-black/50 px-2 py-1 text-white backdrop-blur-sm"
            />
          </div>
          {item.note && (
            <figcaption className="p-4.5">
              <Note>{item.note}</Note>
            </figcaption>
          )}
        </figure>
      );

    case 'text':
      return (
        <article className={cn(CARD, 'gap-3 p-4.5')} style={enter(index)}>
          <p className="font-serif text-lg leading-7 whitespace-pre-wrap text-pretty">
            {item.text}
          </p>
          <Meta item={item} />
        </article>
      );
  }
}
