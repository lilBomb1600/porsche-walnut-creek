/**
 * Arman Digital SEO kit: the one switch. Nothing here needs editing.
 *
 *   Pitch preview (unpaid)   NEXT_PUBLIC_LICENSED unset          -> noindex everywhere, empty sitemap, watermark on
 *   Live (paid)              NEXT_PUBLIC_LICENSED=true
 *                            NEXT_PUBLIC_SITE_URL=https://www.client.com -> indexable, canonical on the client's domain
 *
 * The watermark (PreviewMark) reads the same NEXT_PUBLIC_LICENSED variable, so the two can't drift apart.
 */
import { FALLBACK_URL } from "./config";

export const LICENSED = process.env.NEXT_PUBLIC_LICENSED === "true";

/** Vercel sets VERCEL_ENV on its builds. A Vercel preview/dev build is never indexable, even when licensed. */
const VERCEL_ENV = process.env.VERCEL_ENV;
export const INDEXABLE = LICENSED && VERCEL_ENV !== "preview" && VERCEL_ENV !== "development";

const rawUrl = (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_URL || "").trim().replace(/\/+$/, "");

if (!/^https?:\/\/[^/]+/.test(rawUrl)) {
  throw new Error(`[seo-kit] site URL "${rawUrl}" must be an absolute origin like https://www.client.com`);
}
// canseco-autobody shipped canonical + og:image + JSON-LD pointing at http://localhost:3151 (audit 2026-11-14). Never again:
// a production build with a local origin fails instead of deploying.
if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|[^/]+\.local)(:\d+)?$/i.test(rawUrl) && process.env.NODE_ENV === "production") {
  throw new Error(`[seo-kit] site URL is ${rawUrl}. Set NEXT_PUBLIC_SITE_URL or fix the data file before building.`);
}
if (INDEXABLE && !rawUrl.startsWith("https://")) {
  throw new Error(`[seo-kit] a live site must use https: ${rawUrl}`);
}

/** Canonical origin, no trailing slash. */
export const SITE_URL = rawUrl;

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Search Console HTML-tag verification (URL-prefix property). Prefer the DNS TXT Domain property, which needs no code.
 * These tokens are public by design (they sit in the page head); they are not secrets.
 */
export const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined;
export const BING_SITE_VERIFICATION = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || undefined;
