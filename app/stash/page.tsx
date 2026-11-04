import { getItems, type StashItem } from '@/lib/stash';

import { BackLink } from './back-link';
import { StashCard } from './stash-card';

async function loadItems(): Promise<StashItem[] | null> {
  try {
    return await getItems();
  } catch (error) {
    console.error('[stash] failed to load items', error);
    return null;
  }
}

export default async function Stash() {
  const items = await loadItems();

  return (
    <div className="relative min-h-dvh">
      <BackLink />

      <main className="flex w-full max-w-full flex-col gap-10 px-8 pt-24 pb-10 sm:px-12 xl:px-20 md:pb-24">
        {items === null ? (
          <p className="text-muted-foreground">
            The stash is unreachable right now. Try again in a bit.
          </p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">Nothing stashed yet.</p>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {items.map((item, index) => (
              <StashCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
