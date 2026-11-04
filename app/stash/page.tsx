import Link from 'next/link';

import { getItems, normalizeTag, type StashItem } from '@/lib/stash';

import { BackLink } from './back-link';
import { BackToTop } from './back-to-top';
import { StashCard } from './stash-card';
import { StickyHeader } from './sticky-header';
import { TagBar, type TagCount } from './tag-bar';

async function loadItems(): Promise<StashItem[] | null> {
  try {
    return await getItems();
  } catch (error) {
    console.error('[stash] failed to load items', error);
    return null;
  }
}

/* Most used first, alphabetical on ties */
function countTags(items: StashItem[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export default async function Stash({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[] }>;
}) {
  const { tag: rawTag } = await searchParams;
  const tag =
    typeof rawTag === 'string' ? normalizeTag(rawTag) || undefined : undefined;

  const items = await loadItems();
  const visible = tag
    ? items?.filter((item) => item.tags?.includes(tag))
    : items;

  const tags = items?.length ? countTags(items) : [];

  return (
    <div className="relative min-h-dvh">
      {/* One slim pinned row: the way home and the tag filter stay in reach */}
      <StickyHeader className="flex items-center gap-8 px-6 py-4">
        <BackLink />
        {items && tags.length > 0 && (
          <div className="min-w-0 flex-1">
            <TagBar tags={tags} active={tag} total={items.length} />
          </div>
        )}
      </StickyHeader>

      <main className="flex w-full max-w-full flex-col gap-10 px-8 pt-4 pb-6 sm:px-12 xl:px-20 md:pb-24">
        {!items || !visible ? (
          <p className="text-muted-foreground text-center">
            The stash is unreachable right now. Try again in a bit.
          </p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-center">
            Nothing stashed yet.
          </p>
        ) : visible.length === 0 ? (
          <p className="text-muted-foreground text-center">
            Nothing tagged #{tag} yet.{' '}
            <Link
              href="/stash"
              className="text-foreground underline underline-offset-2"
            >
              See everything
            </Link>
          </p>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-4 xl:columns-5">
            {visible.map((item, index) => (
              <StashCard
                key={item.id}
                item={item}
                index={index}
                activeTag={tag}
              />
            ))}
          </div>
        )}
      </main>

      <BackToTop />
    </div>
  );
}
