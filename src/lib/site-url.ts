/**
 * Single source of truth for the canonical site origin.
 *
 * Safe to import from both server and client modules: it never touches
 * `next/headers` or any other server-only API.
 */

const DEFAULT_BASE_URL = "https://fairshare.copilotmarketing.id";

/**
 * Origins that shipped as the canonical host before the custom domain and that
 * were still present in deployed environment variables. Treating them as
 * "unconfigured" prevents a stale `NEXT_PUBLIC_APP_URL` from emitting canonical
 * tags, OG URLs, sitemap entries and robots directives for the wrong host.
 */
const LEGACY_HOSTS: Record<string, true> = {
  "app-fairshare.vercel.app": true,
  "www.app-fairshare.vercel.app": true,
};

function isLegacyHost(origin: string): boolean {
  try {
    return Object.hasOwn(LEGACY_HOSTS, new URL(origin).hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Returns the canonical site origin, without a trailing slash.
 *
 * Uses `NEXT_PUBLIC_APP_URL` when it is set to a non-empty, non-legacy value,
 * otherwise falls back to the production domain.
 */
export function getBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  if (configured && !isLegacyHost(configured)) {
    return configured;
  }
  return DEFAULT_BASE_URL;
}

/**
 * Joins the canonical origin with a path, guaranteeing exactly one `/`
 * between them.
 */
export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseUrl()}${normalizedPath}`;
}
