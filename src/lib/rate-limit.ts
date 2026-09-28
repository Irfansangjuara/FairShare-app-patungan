interface RateLimitBucket {
  count: number;
  resetAt: number;
}

/**
 * Process-local fixed-window rate limiter.
 *
 * Deliberately dependency-free (no `next/headers`) so it can be imported from
 * unit tests and from anywhere in the request path.
 *
 * NOTE: this state lives in the memory of a single server instance. On
 * serverless platforms it throttles per warm instance only, so it is a
 * best-effort defence-in-depth layer, not a hard quota. A durable limiter
 * (Redis/Upstash) is required for a hard guarantee.
 */
const buckets = new Map<string, RateLimitBucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

// Opportunistically evict expired buckets so long-lived instances do not grow
// without bound. Runs at most once per minute per process.
let lastSweep = 0;
export function sweepRateLimits(now = Date.now()): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}
