import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL } from "@/lib/seo/env";

/**
 * Keep this. `output: "export"` refuses route handlers that don't declare themselves static, and the usual
 * `dynamic = "force-static"` / `revalidate = false` break the normal build when cacheComponents is on
 * ("not compatible with nextConfig.cacheComponents"). An empty-params generateStaticParams satisfies both
 * (tested on Next 16.4.6: normal build with cacheComponents on/off, and STATIC_EXPORT=1).
 */
export function generateStaticParams() {
  return [{}];
}

/**
 * /robots.txt (Arman Digital SEO kit).
 *
 * Preview: search crawlers are ALLOWED in, so they can read the noindex (meta tag + X-Robots-Tag header) and drop the
 * page. Google: noindex only works if the page is not blocked by robots.txt, and a blocked URL can still be listed
 * from links (the portfolio links to every demo). AI training crawlers are turned away from unpaid work. No Sitemap line.
 *
 * Live: everything allowed + the sitemap. Don't Disallow pages that are noindex (Google must crawl them to see it),
 * and never Disallow /_next/ (CSS/JS needed to render).
 */
const AI_TRAINING_AGENTS = [
  "GPTBot",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "ClaudeBot",
  "anthropic-ai",
  "Bytespider",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    return {
      rules: [
        { userAgent: "*", allow: "/" },
        { userAgent: AI_TRAINING_AGENTS, disallow: "/" },
      ],
    };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
