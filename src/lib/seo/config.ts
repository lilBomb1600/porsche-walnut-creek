/**
 * ADAPT ME: the only kit file you edit per project.
 *
 * Facts come from src/data/dealership.ts only. This is an UNOFFICIAL concept for a real dealer (Porsche Walnut Creek,
 * a Sonic Automotive store), so the layout does NOT render a LocalBusiness node: the JSON-LD is a WebSite node that
 * says it's an independent concept by Arman Digital. Never present this site as the dealer's official site.
 */
import { dealership } from "@/data/dealership";
import type { BusinessFacts, Locale, OgImage, PageEntry, ServiceFact } from "./types";

/** dealership.ts has no siteUrl, so the preview's vercel.app origin is the fallback. */
export const FALLBACK_URL: string = "https://porsche-walnut-creek.vercel.app";

/** One URL per page, no /es route. */
export const LOCALES: Locale[] = ["en"];
export const DEFAULT_LOCALE: Locale = "en";

/** public/og.jpg: 1200x630 crop of the hero poster (public/media/hero.jpg). */
export const OG_IMAGE: OgImage = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "White Porsche 911 GT3 RS with red wheels on a race track",
};

/**
 * Used for titles and og:site_name. Not rendered as a LocalBusiness node (see the note at the top).
 * AutomotiveBusiness is the closest kit type; schema.org's AutoDealer isn't in the kit's list.
 */
export const facts: BusinessFacts = {
  name: dealership.name,
  type: "AutomotiveBusiness",
  telephone: dealership.phone.tel,
  address: {
    street: dealership.address.street,
    locality: dealership.address.city,
    region: dealership.address.state,
    postalCode: dealership.address.zip,
  },
  image: [OG_IMAGE.url],
};

/** No Service nodes: this concept doesn't speak for the dealer. */
export const services: ServiceFact[] = [];

/** Every indexable URL (used only on a licensed build; this concept stays a preview). */
export const pages: PageEntry[] = [{ path: "/" }, { path: "/studio" }];
