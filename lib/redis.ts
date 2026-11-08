import { Redis } from '@upstash/redis';

/* Server-only: never import from a client component */

let client: Redis | null = null;

/* The Vercel Marketplace injects KV_* or UPSTASH_* names depending on how it was linked */
export function redis() {
  if (client) return client;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Redis env vars are missing');
  client = new Redis({ url, token });
  return client;
}
