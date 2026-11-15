import type { MetadataRoute } from "next";
import { pages } from "@/lib/seo/config";
import { INDEXABLE, absoluteUrl } from "@/lib/seo/env";

/** Keep this: lets the static export prerender this route without breaking cacheComponents builds (see robots.ts). */
export function generateStaticParams() {
  return [{}];
}

/**
 * /sitemap.xml (Arman Digital SEO kit). Pages come from src/lib/seo/config.ts.
 *
 * Preview: an empty <urlset/> (nothing to submit; robots.txt doesn't point here).
 * Live: every canonical URL, absolute, on the client's domain. Each language URL is its own entry; hreflang lives in
 * the page <head> (pageMetadata), so it isn't repeated here (Google: use one method). Google ignores changefreq and
 * priority, so they're left out; lastModified only when it's a real content date.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!INDEXABLE) return [];
  return pages.map((page) => ({
    url: absoluteUrl(page.path),
    ...(page.lastModified ? { lastModified: page.lastModified } : {}),
    ...(page.images?.length ? { images: page.images.map(absoluteUrl) } : {}),
  }));
}
