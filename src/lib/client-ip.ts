import { headers } from "next/headers";

/**
 * Best-effort client IP for throttling login attempts.
 *
 * Kept in its own module so the pure limiter (`lib/rate-limit.ts`) stays free
 * of `next/headers` and can be imported from unit tests.
 *
 * On Vercel `x-forwarded-for` is set by the platform; behind other proxies it
 * is spoofable, so the value is only ever used to bucket requests and never
 * for authorization decisions.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }
    return headerList.get("x-real-ip") || headerList.get("cf-connecting-ip") || "unknown";
  } catch {
    return "unknown";
  }
}
