import Link from 'next/link';
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

const CHIP =
  'pointer-events-auto block rounded-full px-2 py-1 font-mono text-xs transition-colors motion-reduce:transition-none';

const CHIP_STYLES = {
  /* Fixed dark glass: it sits on arbitrary images, so it can't follow the theme */
  overlay: {
    idle: 'bg-black/50 text-white backdrop-blur-sm hover:bg-black/70',
    active: 'bg-white text-black',
  },
  inline: {
    idle: 'bg-background text-muted-foreground hover:text-foreground',
    active: 'bg-foreground text-background',
  },
};

/*
 * Top-left of every card: over the media when there is some, otherwise the
 * first row. z-1 lifts the chips above a link card's stretched overlay; the
 * list itself ignores the pointer so the gaps between chips stay clickable.
 */
function Tags({
  tags,
  active,
  overlay = false,
}: {
  tags?: string[];
  active?: string;
  overlay?: boolean;
}) {
  if (!tags?.length) return null;
  const styles = CHIP_STYLES[overlay ? 'overlay' : 'inline'];

  return (
    <ul
      className={cn(
        'pointer-events-none z-1 flex flex-wrap gap-1',
        overlay ? 'absolute top-3 right-3 left-3' : 'relative',
      )}
    >
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/stash?tag=${encodeURIComponent(tag)}`}
            scroll={false}
            aria-current={tag === active ? 'page' : undefined}
            className={cn(CHIP, tag === active ? styles.active : styles.idle)}
          >
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Note({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="whitespace-pre-wrap text-pretty">{children}</p>;
}

export function StashCard({
  item,
  index,
  activeTag,
}: {
  item: StashItem;
  index: number;
  activeTag?: string;
}) {
  switch (item.kind) {
    case 'link': {
      const { preview } = item;
      const video = parseYouTube(item.url);

      /* Not a single <a>: the player inside it is a button of its own */
      if (video) {
        const title = preview?.title ?? 'YouTube video';
        return (
          <article className={CARD} style={enter(index)}>
            <YouTubePlayer
              video={video}
              title={title}
              overlay={<Tags tags={item.tags} active={activeTag} overlay />}
            />
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
      /*
       * Stretched link: the title's overlay makes the whole card clickable,
       * while the tag chips (z-1) stay links of their own. Links can't nest.
       */
      return (
        <article className={cn(CARD, 'group relative')} style={enter(index)}>
          {preview?.image && (
            <PreviewImage
              src={preview.image}
              overlay={<Tags tags={item.tags} active={activeTag} overlay />}
              /* If the image fails, the chips fall back to the first row */
              fallback={
                item.tags?.length ? (
                  <div className="px-4.5 pt-4.5">
                    <Tags tags={item.tags} active={activeTag} />
                  </div>
                ) : null
              }
            />
          )}
          <div className="flex flex-col gap-2 p-4.5">
            {!preview?.image && <Tags tags={item.tags} active={activeTag} />}
            <div className="flex flex-col gap-1">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="leading-6.5 font-medium text-pretty underline-offset-2 outline-none group-hover:underline after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-ring"
              >
                {preview?.title ?? hostname(item.url)}
              </a>
              {preview?.description && (
                <span className="line-clamp-3 text-sm text-muted-foreground text-pretty">
                  {preview.description}
                </span>
              )}
            </div>
            <Note>{item.note}</Note>
            <Meta item={item} label={site} />
          </div>
        </article>
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
            <Tags tags={item.tags} active={activeTag} overlay />
            {/* Fixed dark pill: it sits on arbitrary photos, so it can't follow the theme */}
            <DateTime
              item={item}
              className="absolute right-3 bottom-3 rounded-full bg-black/50 px-2 py-1 text-white backdrop-blur-sm"
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
          <Tags tags={item.tags} active={activeTag} />
          <p className="font-serif text-lg leading-7 whitespace-pre-wrap text-pretty">
            {item.text}
          </p>
          <Meta item={item} />
        </article>
      );
  }
}
