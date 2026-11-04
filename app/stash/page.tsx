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

      <main className="flex w-full max-w-232 flex-col gap-10 px-6 pt-24 pb-14 sm:px-12 md:px-24 md:pb-28">
        <header className="flex flex-col gap-3">
          <h1 className="font-serif text-2xl font-medium">Stash</h1>
          <p className="max-w-prose text-muted-foreground">
            Things I’ve saved from around the internet: inspiration, ideas and
            TODOs. Whatever’s on my mind, roughly in the order it got there.
          </p>
        </header>

        {items === null ? (
          <p className="text-muted-foreground">
            The stash is unreachable right now. Try again in a bit.
          </p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">Nothing stashed yet.</p>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2">
            {items.map((item) => (
              <StashCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
