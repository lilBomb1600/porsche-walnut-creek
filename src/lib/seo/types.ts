/**
 * Arman Digital SEO kit: shared types. Nothing here needs editing.
 * Standard: Websites/LAUNCH-STANDARD.md
 */

export type Locale = "en" | "es";
export type HreflangKey = Locale | "x-default";

/**
 * schema.org LocalBusiness subtypes for the trades we build for. Use the most specific one that is TRUE for the business.
 * There is no BarberShop or HouseCleaning type: barbers are HairSalon, cleaners are LocalBusiness.
 * ProfessionalService is left out on purpose: schema.org deprecated it for local businesses.
 * The trade table is in LAUNCH-STANDARD.md, section B5.
 */
export type BusinessType =
  | "LocalBusiness"
  // automotive
  | "AutomotiveBusiness"
  | "AutoBodyShop"
  | "AutoRepair"
  | "AutoWash"
  | "AutoPartsStore"
  | "TireShop"
  // beauty, fitness
  | "HealthAndBeautyBusiness"
  | "HairSalon"
  | "BeautySalon"
  | "NailSalon"
  | "DaySpa"
  | "TattooParlor"
  | "HealthClub"
  | "ExerciseGym"
  | "SportsActivityLocation"
  // food
  | "FoodEstablishment"
  | "Restaurant"
  | "FastFoodRestaurant"
  | "Bakery"
  | "CafeOrCoffeeShop"
  | "IceCreamShop"
  // home + construction
  | "HomeAndConstructionBusiness"
  | "GeneralContractor"
  | "Electrician"
  | "Plumber"
  | "HVACBusiness"
  | "HousePainter"
  | "Locksmith"
  | "MovingCompany"
  | "RoofingContractor"
  // everything else we have built for
  | "DryCleaningOrLaundry"
  | "ChildCare"
  | "AccountingService"
  | "RealEstateAgent"
  | "EntertainmentBusiness"
  | "Store"
  | "ClothingStore"
  | "PetStore";

export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

/**
 * The facts JSON-LD is built from. Every value must come from the project's data file, which only holds what the
 * owner told us or what their own listing shows. Leave a field out when we don't know it. Never fill one in to look complete.
 */
export type BusinessFacts = {
  /** Exactly as on their Google Business Profile / signage. */
  name: string;
  type: BusinessType | BusinessType[];
  description?: string;
  /** E.164 with country + area code, e.g. "+19255550123". Same number as the tel: links on the page. */
  telephone?: string;
  email?: string;
  /**
   * Google requires an address. Storefronts: the full public address, identical to their GBP.
   * Service-area businesses (they go to the customer): locality + region only. Never a street we were not given.
   */
  address: { street?: string; locality: string; region: string; postalCode?: string; country?: string };
  /** Cities they really serve, written "Concord, CA". Empty when they haven't told us. */
  serviceArea?: string[];
  /** Only from their own map pin. At least 5 decimals (Google). */
  geo?: { latitude: number; longitude: number };
  /** Only real posted hours. "HH:MM" 24h. Closes earlier than opens = past midnight. */
  hours?: { days: DayOfWeek[]; opens: string; closes: string }[];
  /** e.g. "$$" or "$40-$120". Only if their prices are public. Under 100 characters. */
  priceRange?: string;
  /** Photos of THEIR business/work. Site-relative ("/og.jpg") or absolute. */
  image?: string[];
  logo?: string;
  /** Their real profiles: Google Business Profile share link, Instagram, Facebook, Yelp, TikTok. */
  sameAs?: string[];
  /** Their Google Maps / GBP link. */
  hasMap?: string;
  /** Languages they serve customers in, e.g. ["en", "es"]. */
  languages?: string[];
  founder?: string;
  /** Food only: the menu page path. */
  menu?: string;
  servesCuisine?: string[];
  /** Only what they told us, e.g. "Cash, Zelle, Card". */
  paymentAccepted?: string;
};

export type ServiceFact = {
  /** As the owner names it. */
  name: string;
  description?: string;
  /** Page for this service, if it has one. */
  path?: string;
  /** Generic category, e.g. "House cleaning". Defaults to name. */
  serviceType?: string;
};

export type FaqItem = { question: string; answer: string };

/** One indexable URL for sitemap.xml. List each language version as its own entry ("/" and "/es"). */
export type PageEntry = {
  path: string;
  /** ISO date of the last REAL content change ("2026-11-14"). Leave it out rather than guess: Google ignores lastmod it can't trust. */
  lastModified?: string;
  /** Photos on that page worth an image sitemap entry. */
  images?: string[];
};

export type OgImage = { url: string; width: number; height: number; alt: string };
