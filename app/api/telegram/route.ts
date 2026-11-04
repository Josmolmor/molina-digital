import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import {
  addItem,
  fetchLinkPreview,
  removeItem,
  STASH_IMAGE_TYPES,
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
  '• a photo, or an image sent as a file',
  '• plain text',
  '',
  'Reply /delete to a message to remove it.',
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
function findLink(text: string, entities: TelegramEntity[] = []) {
  for (const entity of entities) {
    if (entity.type === 'url') {
      const url = text.slice(entity.offset, entity.offset + entity.length);
      const note =
        text.slice(0, entity.offset) +
        text.slice(entity.offset + entity.length);
      return { url: withScheme(url), note: note.trim() || undefined };
    }
    if (entity.type === 'text_link' && entity.url) {
      return { url: entity.url, note: text.trim() || undefined };
    }
  }
  return null;
}

async function toItem(message: TelegramMessage): Promise<StashItem | null> {
  const base = { id: message.message_id, createdAt: message.date * 1000 };
  const caption = message.caption?.trim() || undefined;

  if (message.photo?.length) {
    const largest = message.photo[message.photo.length - 1];
    return {
      ...base,
      kind: 'image',
      fileId: largest.file_id,
      mimeType: 'image/jpeg',
      width: largest.width,
      height: largest.height,
      note: caption,
    };
  }

  const mimeType = message.document?.mime_type;
  if (message.document && mimeType && STASH_IMAGE_TYPES.has(mimeType)) {
    return {
      ...base,
      kind: 'image',
      fileId: message.document.file_id,
      mimeType,
      note: caption,
    };
  }

  const text = message.text ?? message.caption;
  if (!text?.trim()) return null;

  const link = findLink(text, message.entities ?? message.caption_entities);
  if (link) {
    return {
      ...base,
      kind: 'link',
      url: link.url,
      note: link.note,
      preview: await fetchLinkPreview(link.url),
    };
  }

  return { ...base, kind: 'text', text: text.trim() };
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

async function handle(message: TelegramMessage) {
  const command = message.text?.trim().split(/\s|@/)[0].toLowerCase();

  if (command === '/delete' || command === '/rm') {
    const target = message.reply_to_message?.message_id;
    if (!target) {
      await reply(message, 'Reply /delete to the message you want to remove.');
      return;
    }
    const removed = await removeItem(target);
    if (removed) revalidatePath('/stash');
    await (removed ? react(message, '👌') : reply(message, 'Not in the stash.'));
    return;
  }

  if (command?.startsWith('/')) {
    await reply(message, HELP);
    return;
  }

  const item = await toItem(message);
  if (!item) {
    await reply(message, "I can't stash that yet. Links, images and text only.");
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

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
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
