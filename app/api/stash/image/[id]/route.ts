import { getItem } from '@/lib/stash';
import { downloadFile } from '@/lib/telegram';

/*
 * Telegram file URLs embed the bot token, so images and GIFs are streamed
 * through here. Only ids that are image items in the stash resolve: this can't be
 * used to fetch arbitrary Telegram files.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id)) return notFound();

  try {
    const item = await getItem(id);
    if (item?.kind !== 'image') return notFound();

    const range = request.headers.get('range');
    const file = await downloadFile(item.fileId, range);
    if (!file.ok || !file.body) return notFound();

    const partial = file.status === 206;
    const headers = new Headers({
      // Telegram serves application/octet-stream; trust what we stored
      'Content-Type': item.mimeType,
      'Accept-Ranges': 'bytes',
      /*
       * Full files: long enough to spare Telegram, short enough that /delete
       * sticks. Partial (206) responses must never be cached under the URL.
       */
      'Cache-Control': partial
        ? 'private, no-store'
        : 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
    });
    for (const name of ['Content-Length', 'Content-Range']) {
      const value = file.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new Response(file.body, { status: file.status, headers });
  } catch (error) {
    console.error('[stash] image proxy failed', error);
    return new Response('Bad gateway', { status: 502 });
  }
}

function notFound() {
  return new Response('Not found', { status: 404 });
}
