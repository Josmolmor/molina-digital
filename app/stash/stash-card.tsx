import type { StashItem } from '@/lib/stash';
import { cn } from '@/lib/utils';

import { PreviewImage } from './preview-image';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Madrid',
});

const CARD =
  'mb-4 flex break-inside-avoid flex-col overflow-hidden rounded-2xl bg-card';

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function Meta({ item, label }: { item: StashItem; label?: string }) {
  return (
    <p className="flex items-center justify-between gap-3 font-mono text-xs tabular-nums text-muted-foreground">
      {label && <span className="min-w-0 truncate">{label}</span>}
      <time
        dateTime={new Date(item.createdAt).toISOString()}
        className="ml-auto shrink-0"
      >
        {dateFormat.format(item.createdAt)}
      </time>
    </p>
  );
}

function Note({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="whitespace-pre-wrap text-pretty">{children}</p>;
}

export function StashCard({ item }: { item: StashItem }) {
  switch (item.kind) {
    case 'link': {
      const { preview } = item;
      const site = preview?.siteName ?? hostname(item.url);
      return (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(CARD, 'group')}
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
        <figure className={CARD}>
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
          <figcaption className="flex flex-col gap-2 p-4.5">
            <Note>{item.note}</Note>
            <Meta item={item} />
          </figcaption>
        </figure>
      );

    case 'text':
      return (
        <article className={cn(CARD, 'gap-3 p-4.5')}>
          <p className="font-serif text-lg leading-7 whitespace-pre-wrap text-pretty">
            {item.text}
          </p>
          <Meta item={item} />
        </article>
      );
  }
}
