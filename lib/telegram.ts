/*
 * Minimal Telegram Bot API client: just the types and calls Stash uses.
 * Server-only: the bot token must never reach the browser.
 */

export type TelegramEntity = {
  type: string;
  offset: number;
  length: number;
  url?: string;
};

export type TelegramPhotoSize = {
  file_id: string;
  width: number;
  height: number;
};

export type TelegramMessage = {
  message_id: number;
  date: number;
  from?: { id: number };
  chat: { id: number; type: string };
  text?: string;
  entities?: TelegramEntity[];
  caption?: string;
  caption_entities?: TelegramEntity[];
  photo?: TelegramPhotoSize[];
  document?: { file_id: string; mime_type?: string };
  /* GIFs: Telegram converts them to silent MP4s (document is set too) */
  animation?: {
    file_id: string;
    width: number;
    height: number;
    mime_type?: string;
  };
  reply_to_message?: { message_id: number };
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

function token() {
  const value = process.env.TELEGRAM_BOT_TOKEN;
  if (!value) throw new Error('Telegram: TELEGRAM_BOT_TOKEN is missing');
  return value;
}

export async function callTelegram<T = unknown>(
  method: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(
    `https://api.telegram.org/bot${token()}/${method}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    },
  );
  const data = await response.json();
  if (!data.ok) throw new Error(`Telegram ${method}: ${data.description}`);
  return data.result as T;
}

/* Resolves a file_id to a downloadable response. The URL embeds the token, so stream it, never expose it */
export async function downloadFile(
  fileId: string,
  /* Forwarded Range header: Safari won't play video without byte ranges */
  range?: string | null,
) {
  const { file_path } = await callTelegram<{ file_path?: string }>('getFile', {
    file_id: fileId,
  });
  if (!file_path) throw new Error('Telegram getFile: no file_path');

  return fetch(`https://api.telegram.org/file/bot${token()}/${file_path}`, {
    headers: range ? { Range: range } : undefined,
    signal: AbortSignal.timeout(10000),
  });
}
