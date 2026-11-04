import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import {
  addItem,
  fetchLinkPreview,
  getItems,
  mergeTags,
  normalizeTag,
  removeItem,
  STASH_ANIMATION_TYPES,
  STASH_IMAGE_TYPES,
  updateItem,
  type StashItem,
} from '@/lib/stash';
import {
  callTelegram,
  type TelegramEntity,
  type TelegramMessage,
  type TelegramUpdate,
} from '@/lib/telegram';

const HELP = [
  'Send me anything to stash it on molina.digital/stash:',
  '• a link (with an optional note)',
  '• a photo or GIF, or an image sent as a file',
  '• plain text',
  '',
  'Add #hashtags anywhere to tag it.',
  'Reply #tags to a saved message to tag it later.',
  'Reply /untag #tag to remove a tag.',
  'Reply /delete to remove it.',
  '/tags lists every tag.',
].join('\n');

/* Hash both sides so timingSafeEqual gets equal lengths and leaks nothing */
function isAuthorized(request: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const received = request.headers.get('x-telegram-bot-api-secret-token');
  if (!expected || !received) return false;
  const digest = (value: string) =>
    new Uint8Array(createHash('sha256').update(value).digest());
  return timingSafeEqual(digest(expected), digest(received));
}

function isOwner(message: TelegramMessage) {
  const owner = process.env.TELEGRAM_OWNER_ID;
  return (
    Boolean(owner) &&
    String(message.from?.id) === owner &&
    message.chat.type === 'private'
  );
}

function withScheme(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/* Offsets are UTF-16 code units, which is exactly how JS strings index */
const LOOKS_LIKE_URL = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i;

function isLink(entity: TelegramEntity) {
  return entity.type === 'url' || (entity.type === 'text_link' && entity.url);
}

const HASHTAG_RUN = /^(\s*#[\p{L}\p{N}_]+)*\s*$/u;

type ParsedText = {
  /* The first link, if any: it becomes the item */
  url?: string;
  /* What's left once links and tag runs are cut: the note, or a text item's body */
  rest?: string;
  tags: string[];
};

/*
 * One pass over the entities, from the end so earlier offsets stay valid:
 * - Bare URLs are cut. Share sheets often repeat them or send a link
 *   labelled with itself, so a text_link only keeps its label when the
 *   label is actual words.
 * - Hashtags become tags. Runs at the start or end of a line are cut
 *   ("https://x.com #inspo #web"); one inside a sentence keeps its word
 *   ("love the #type here" → "love the type here").
 */
function parseText(text = '', entities: TelegramEntity[] = []): ParsedText {
  const span = (entity: TelegramEntity) =>
    text.slice(entity.offset, entity.offset + entity.length);

  const links = entities.filter(isLink);
  const hashtags = entities.filter((entity) => entity.type === 'hashtag');

  const first = links[0];
  const url = first
    ? first.type === 'text_link'
      ? first.url!
      : withScheme(span(first))
    : undefined;

  const tags = [
    ...new Set(hashtags.map((entity) => normalizeTag(span(entity)))),
  ].filter(Boolean);

  const cuts = [
    ...links.filter(
      (entity) =>
        entity.type === 'url' || LOOKS_LIKE_URL.test(span(entity).trim()),
    ),
    ...hashtags,
  ].sort((a, b) => b.offset - a.offset);

  let rest = text;
  for (const entity of cuts) {
    const start = entity.offset;
    const end = entity.offset + entity.length;

    if (entity.type === 'hashtag') {
      const lineStart = rest.lastIndexOf('\n', start - 1) + 1;
      const newline = rest.indexOf('\n', end);
      const lineEnd = newline === -1 ? rest.length : newline;
      const atEdge =
        HASHTAG_RUN.test(rest.slice(lineStart, start)) ||
        HASHTAG_RUN.test(rest.slice(end, lineEnd));
      // Inline: drop only the '#'
      rest = atEdge
        ? rest.slice(0, start) + rest.slice(end)
        : rest.slice(0, start) + rest.slice(start + 1);
      continue;
    }

    rest = rest.slice(0, start) + rest.slice(end);
  }

  rest = rest
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { url, rest: rest || undefined, tags };
}

function parseMessage(message: TelegramMessage) {
  return message.text !== undefined
    ? parseText(message.text, message.entities)
    : parseText(message.caption, message.caption_entities);
}

async function toItem(
  message: TelegramMessage,
  parsed: ParsedText,
): Promise<StashItem | null> {
  const base = {
    id: message.message_id,
    createdAt: message.date * 1000,
    tags: mergeTags(parsed.tags),
  };

  if (message.photo?.length) {
    const largest = message.photo[message.photo.length - 1];
    return {
      ...base,
      kind: 'image',
      fileId: largest.file_id,
      mimeType: 'image/jpeg',
      width: largest.width,
      height: largest.height,
      note: parsed.rest,
    };
  }

  /* Before document: Telegram sets both for a GIF, and document lacks the size */
  if (message.animation) {
    const mimeType = message.animation.mime_type ?? 'video/mp4';
    if (!STASH_ANIMATION_TYPES.has(mimeType)) return null;
    return {
      ...base,
      kind: 'image',
      fileId: message.animation.file_id,
      mimeType,
      width: message.animation.width,
      height: message.animation.height,
      note: parsed.rest,
    };
  }

  const mimeType = message.document?.mime_type;
  if (message.document && mimeType && STASH_IMAGE_TYPES.has(mimeType)) {
    return {
      ...base,
      kind: 'image',
      fileId: message.document.file_id,
      mimeType,
      note: parsed.rest,
    };
  }

  if (parsed.url) {
    return {
      ...base,
      kind: 'link',
      url: parsed.url,
      note: parsed.rest,
      preview: await fetchLinkPreview(parsed.url),
    };
  }

  if (!parsed.rest) return null;
  return { ...base, kind: 'text', text: parsed.rest };
}

function reply(message: TelegramMessage, text: string) {
  return callTelegram('sendMessage', {
    chat_id: message.chat.id,
    text,
    reply_parameters: { message_id: message.message_id },
    link_preview_options: { is_disabled: true },
  });
}

function react(message: TelegramMessage, emoji: string) {
  return callTelegram('setMessageReaction', {
    chat_id: message.chat.id,
    message_id: message.message_id,
    reaction: [{ type: 'emoji', emoji }],
  });
}

function formatTags(tags: string[]) {
  return tags.map((tag) => `#${tag}`).join(' ');
}

async function retag(
  message: TelegramMessage,
  change: (tags: string[]) => string[] | undefined,
) {
  const target = message.reply_to_message?.message_id;
  if (!target) return false;
  const updated = await updateItem(target, (item) => ({
    ...item,
    tags: mergeTags(change(item.tags ?? [])),
  }));
  if (!updated) {
    await reply(message, 'Not in the stash.');
    return true;
  }
  revalidatePath('/stash');
  await react(message, '👍');
  return true;
}

async function handle(message: TelegramMessage) {
  const command = message.text?.trim().split(/\s|@/)[0].toLowerCase();
  const parsed = parseMessage(message);

  if (command === '/delete' || command === '/rm') {
    const target = message.reply_to_message?.message_id;
    if (!target) {
      await reply(message, 'Reply /delete to the message you want to remove.');
      return;
    }
    const removed = await removeItem(target);
    if (removed) revalidatePath('/stash');
    await (removed
      ? react(message, '👌')
      : reply(message, 'Not in the stash.'));
    return;
  }

  if (command === '/tags') {
    const counts = new Map<string, number>();
    for (const item of await getItems()) {
      for (const tag of item.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    const lines = [...counts]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => `#${tag} ${count}`);
    await reply(message, lines.length ? lines.join('\n') : 'No tags yet.');
    return;
  }

  if (command === '/untag') {
    const done =
      parsed.tags.length > 0 &&
      (await retag(message, (tags) =>
        tags.filter((tag) => !parsed.tags.includes(tag)),
      ));
    if (!done) {
      await reply(message, 'Reply /untag #tag to the message to untag.');
    }
    return;
  }

  if (command?.startsWith('/')) {
    await reply(message, HELP);
    return;
  }

  /* Only hashtags: tag the message being replied to */
  const isMedia = Boolean(
    message.photo?.length || message.document || message.animation,
  );
  if (!isMedia && !parsed.url && !parsed.rest && parsed.tags.length) {
    const done = await retag(message, (tags) => [...tags, ...parsed.tags]);
    if (!done) {
      await reply(
        message,
        `Reply ${formatTags(parsed.tags)} to a saved message to tag it.`,
      );
    }
    return;
  }

  const item = await toItem(message, parsed);
  if (!item) {
    await reply(
      message,
      "I can't stash that yet. Links, images, GIFs and text only.",
    );
    return;
  }

  await addItem(item);
  revalidatePath('/stash');
  await react(message, '👍');
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const update = (await request
    .json()
    .catch(() => null)) as TelegramUpdate | null;
  const message = update?.message;

  /* Always 200 for anything we ignore, or Telegram keeps retrying it */
  if (!message || !isOwner(message)) return new Response('ok');

  try {
    await handle(message);
  } catch (error) {
    console.error('[stash] webhook failed', error);
    await reply(message, 'Something went wrong saving that.').catch(() => {});
  }

  return new Response('ok');
}
