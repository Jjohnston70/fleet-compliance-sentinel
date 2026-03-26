import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const PENNY_LIMIT = 20;
const WINDOW_SECONDS = 60;
const WINDOW_MS = WINDOW_SECONDS * 1000;
const KEY_PREFIX = 'penny-query';

type RateLimitSource = 'upstash' | 'memory';

export type PennyRateLimitResult = {
  success: boolean;
  retryAfter: number;
  remaining: number;
  limit: number;
  source: RateLimitSource;
};

let upstashLimiter: Ratelimit | null | undefined;

type MemoryBucket = {
  windowStart: number;
  count: number;
};

const memoryBuckets = new Map<string, MemoryBucket>();

function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter !== undefined) return upstashLimiter;

  const hasUpstashConfig = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
  if (!hasUpstashConfig) {
    upstashLimiter = null;
    return upstashLimiter;
  }

  try {
    const redis = Redis.fromEnv();
    upstashLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(PENNY_LIMIT, `${WINDOW_SECONDS} s`),
      prefix: KEY_PREFIX,
      analytics: true,
    });
  } catch {
    upstashLimiter = null;
  }

  return upstashLimiter;
}

function cleanExpiredMemoryBuckets(now: number): void {
  for (const [key, bucket] of memoryBuckets.entries()) {
    if (now - bucket.windowStart >= WINDOW_MS * 2) {
      memoryBuckets.delete(key);
    }
  }
}

function checkMemoryRateLimit(identifier: string): PennyRateLimitResult {
  const now = Date.now();
  cleanExpiredMemoryBuckets(now);

  const key = `${KEY_PREFIX}:${identifier}`;
  const current = memoryBuckets.get(key);
  const expired = !current || now - current.windowStart >= WINDOW_MS;
  const bucket = expired
    ? { windowStart: now, count: 0 }
    : { windowStart: current.windowStart, count: current.count };

  if (bucket.count >= PENNY_LIMIT) {
    const elapsed = now - bucket.windowStart;
    const remainingMs = Math.max(WINDOW_MS - elapsed, 1000);
    memoryBuckets.set(key, bucket);
    return {
      success: false,
      retryAfter: Math.ceil(remainingMs / 1000),
      remaining: 0,
      limit: PENNY_LIMIT,
      source: 'memory',
    };
  }

  bucket.count += 1;
  memoryBuckets.set(key, bucket);
  return {
    success: true,
    retryAfter: 0,
    remaining: Math.max(PENNY_LIMIT - bucket.count, 0),
    limit: PENNY_LIMIT,
    source: 'memory',
  };
}

export async function checkPennyRateLimit(userId: string): Promise<PennyRateLimitResult> {
  const limiter = getUpstashLimiter();
  if (!limiter) {
    return checkMemoryRateLimit(userId);
  }

  try {
    const result = await limiter.limit(`${KEY_PREFIX}:${userId}`);
    const retryAfter = result.success
      ? 0
      : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return {
      success: result.success,
      retryAfter,
      remaining: Math.max(result.remaining, 0),
      limit: PENNY_LIMIT,
      source: 'upstash',
    };
  } catch {
    return checkMemoryRateLimit(userId);
  }
}
