/**
 * Arman Digital SEO kit: metadata helpers (Next 16 Metadata API). Nothing here needs editing.
 *
 * Next merges metadata from layout -> page, and nested objects (openGraph, robots, alternates) from a later segment
 * REPLACE earlier ones instead of merging. So pageMetadata() always returns the full set for its page.
 *
 *   app/layout.tsx   export const metadata = rootMetadata();
 *   app/page.tsx     export const metadata = pageMetadata({ title: localTitle("House Cleaning", "Concord"), description: "...", path: "/" });
 *   app/es/page.tsx  pageMetadata({ ..., path: "/es", lang: "es", languages: { en: "/", es: "/es", "x-default": "/" } })
 */
import type { Metadata } from "next";
import { DEFAULT_LOCALE, OG_IMAGE, facts } from "./config";
import { BING_SITE_VERIFICATION, GOOGLE_SITE_VERIFICATION, INDEXABLE, SITE_URL } from "./env";
import { realText } from "./guard";
import type { HreflangKey, Locale, OgImage } from "./types";

const OG_LOCALE: Record<Locale, string> = { en: "en_US", es: "es_US" };

/** Previews: noindex, nofollow. Live: index with large image previews and full snippets. */
export const robotsMeta: NonNullable<Metadata["robots"]> = INDEXABLE
  ? {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    }
  : { index: false, follow: false, googleBot: { index: false, follow: false } };

/**
 * "{Service} in {City}, CA" / "{Servicio} en {Ciudad}, CA". pageMetadata() adds " | {Business name}".
 * Use what they really do and where they really are. One city per title; no lists of towns.
 */
export function localTitle(service: string, city: string, region = "CA", lang: Locale = "en") {
  return lang === "es" ? `${service} en ${city}, ${region}` : `${service} in ${city}, ${region}`;
}

function fullTitle(title: string) {
  return title.toLowerCase().includes(facts.name.toLowerCase()) ? title : `${title} | ${facts.name}`;
}

function lint(title: string, description: string, path: string) {
  if (process.env.NODE_ENV === "production") return;
  if (title.length > 65) console.warn(`[seo-kit] ${path}: title is ${title.length} chars (aim for 50-60): ${title}`);
  if (description.length < 70 || description.length > 165)
    console.warn(`[seo-kit] ${path}: description is ${description.length} chars (aim for 120-160)`);
}

/** Root layout: base URL, default title/description, robots, verification tokens, default share card. */
export function rootMetadata(opts: { title?: string; description?: string; lang?: Locale } = {}): Metadata {
  const lang = opts.lang ?? DEFAULT_LOCALE;
  const title = realText(opts.title, "root title") ?? facts.name;
  const description = realText(opts.description ?? facts.description, "root description");
  const verificationOther: Record<string, string> = {};
  if (BING_SITE_VERIFICATION) verificationOther["msvalidate.01"] = BING_SITE_VERIFICATION;
  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: fullTitle(title) },
    description,
    applicationName: facts.name,
    robots: robotsMeta,
    // Verification tokens are only useful (and only rendered) on the live site.
    verification:
      INDEXABLE && (GOOGLE_SITE_VERIFICATION || BING_SITE_VERIFICATION)
        ? { google: GOOGLE_SITE_VERIFICATION, other: verificationOther }
        : undefined,
    openGraph: {
      type: "website",
      siteName: facts.name,
      title: fullTitle(title),
      description,
      locale: OG_LOCALE[lang],
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: fullTitle(title), description, images: [OG_IMAGE.url] },
  };
}

/** Every page: its own title, description, self-canonical, hreflang set and share card. */
export function pageMetadata(opts: {
  /** Page-specific part; " | {Business name}" is appended unless it's already in there. */
  title: string;
  /** 120-160 characters, real facts, same language as the page. */
  description: string;
  /** "/" or "/services/deep-cleaning". Becomes the absolute canonical on SITE_URL. */
  path: string;
  lang?: Locale;
  /** Only when each language has its own URL. Include this page itself + x-default (English). */
  languages?: Partial<Record<HreflangKey, string>>;
  image?: OgImage;
}): Metadata {
  const lang = opts.lang ?? DEFAULT_LOCALE;
  const title = fullTitle(realText(opts.title, `${opts.path} title`) ?? facts.name);
  const description = realText(opts.description, `${opts.path} description`) ?? "";
  const image = opts.image ?? OG_IMAGE;
  lint(title, description, opts.path);
  const alternateLocale = opts.languages
    ? (Object.keys(opts.languages).filter((k) => k !== "x-default" && k !== lang) as Locale[]).map((l) => OG_LOCALE[l])
    : undefined;
  return {
    title: { absolute: title },
    description: description || undefined,
    alternates: { canonical: opts.path, languages: opts.languages },
    robots: robotsMeta,
    openGraph: {
      type: "website",
      url: opts.path,
      siteName: facts.name,
      title,
      description: description || undefined,
      locale: OG_LOCALE[lang],
      alternateLocale,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description: description || undefined, images: [image.url] },
  };
}

/** For pages that must never be indexed even on the live site: thank-you, invoice, handoff, review-request pages. */
export const privatePageMetadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};
