/**
 * Arman Digital SEO kit: JSON-LD builders. Nothing here needs editing; facts come from ./config.ts.
 *
 * Rules baked in (LAUNCH-STANDARD.md B5):
 * - One @graph: the business (most specific LocalBusiness subtype), the WebSite, and one Service per real service.
 * - Empty fields are dropped, so a missing fact is never published as "" or "N/A".
 * - Placeholder text (SLOT:, TODO, TBD, lorem...) fails a live build and is dropped with a warning on a preview.
 * - No aggregateRating / review: Google ignores self-serving review stars on a business's own site, and we never publish
 *   ratings we can't source.
 */
import { DEFAULT_LOCALE, LOCALES, facts, services } from "./config";
import { SITE_URL, absoluteUrl } from "./env";
import { realText } from "./guard";
import type { BusinessFacts, FaqItem, Locale, ServiceFact } from "./types";

export const BUSINESS_ID = `${SITE_URL}/#business`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Recursively drops undefined/null/""/[]/{} and refuses placeholder strings. */
export function clean(value: unknown, where = "jsonld"): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string") return realText(value, where);
  if (Array.isArray(value)) {
    const items = value.map((item, i) => clean(item, `${where}[${i}]`)).filter((item) => item !== undefined);
    return items.length ? items : undefined;
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const cleaned = clean(item, `${where}.${key}`);
      if (cleaned !== undefined) out[key] = cleaned;
    }
    // A node that is only its @type has no facts left; drop it.
    const keys = Object.keys(out);
    return keys.length && !(keys.length === 1 && keys[0] === "@type") ? out : undefined;
  }
  return value;
}

const slug = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const cities = (f: BusinessFacts) => f.serviceArea?.map((name) => ({ "@type": "City", name }));

export function localBusinessNode(f: BusinessFacts = facts) {
  return {
    "@type": f.type,
    "@id": BUSINESS_ID,
    name: f.name,
    url: `${SITE_URL}/`,
    description: f.description,
    telephone: f.telephone,
    email: f.email,
    image: f.image?.map(absoluteUrl),
    logo: f.logo ? absoluteUrl(f.logo) : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: f.address.street,
      addressLocality: f.address.locality,
      addressRegion: f.address.region,
      postalCode: f.address.postalCode,
      addressCountry: f.address.country ?? "US",
    },
    areaServed: cities(f),
    geo: f.geo ? { "@type": "GeoCoordinates", latitude: f.geo.latitude, longitude: f.geo.longitude } : undefined,
    openingHoursSpecification: f.hours?.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    priceRange: f.priceRange,
    sameAs: f.sameAs,
    hasMap: f.hasMap,
    knowsLanguage: f.languages,
    founder: f.founder ? { "@type": "Person", name: f.founder } : undefined,
    menu: f.menu ? absoluteUrl(f.menu) : undefined,
    servesCuisine: f.servesCuisine,
    paymentAccepted: f.paymentAccepted,
  };
}

export function websiteNode(f: BusinessFacts = facts, locales: Locale[] = LOCALES) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: f.name,
    inLanguage: locales.length > 1 ? locales : (locales[0] ?? DEFAULT_LOCALE),
    publisher: { "@id": BUSINESS_ID },
  };
}

export function serviceNodes(list: ServiceFact[] = services, f: BusinessFacts = facts) {
  return list.map((s) => ({
    "@type": "Service",
    "@id": `${SITE_URL}/#service-${slug(s.name)}`,
    name: s.name,
    serviceType: s.serviceType ?? s.name,
    description: s.description,
    url: s.path ? absoluteUrl(s.path) : undefined,
    provider: { "@id": BUSINESS_ID },
    areaServed: cities(f),
  }));
}

/**
 * Only for a FAQ that is VISIBLE on that page, with the same words. Google stopped showing FAQ rich results in 2026,
 * so this adds meaning for crawlers, not stars. Render it on the page that shows the FAQ, not in the layout.
 */
export function faqNode(items: FaqItem[], pagePath: string) {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(pagePath)}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Wraps nodes in one @graph and cleans them. Pass the result to <JsonLd data={...} />. */
export function jsonLdGraph(...nodes: unknown[]) {
  return clean({ "@context": "https://schema.org", "@graph": nodes.flat() }) as Record<string, unknown>;
}

/** The site-wide graph for the root layout: business + website + services. */
export function siteJsonLd() {
  return jsonLdGraph(localBusinessNode(), websiteNode(), serviceNodes());
}
