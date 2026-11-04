import { getItem } from '@/lib/stash';
import { downloadFile } from '@/lib/telegram';

/*
 * Telegram file URLs embed the bot token, so images are streamed through
 * here. Only ids that are image items in the stash resolve: this can't be
 * used to fetch arbitrary Telegram files.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id)) return notFound();

  try {
    const item = await getItem(id);
    if (item?.kind !== 'image') return notFound();

    const file = await downloadFile(item.fileId);
    if (!file.ok || !file.body) return notFound();

    return new Response(file.body, {
      headers: {
        // Telegram serves application/octet-stream; trust what we stored
        'Content-Type': item.mimeType,
        // Long enough to spare Telegram, short enough that /delete sticks
        'Cache-Control':
          'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[stash] image proxy failed', error);
    return new Response('Bad gateway', { status: 502 });
  }
}

function notFound() {
  return new Response('Not found', { status: 404 });
}
