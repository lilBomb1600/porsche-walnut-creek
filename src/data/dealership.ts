// Verified from porschewalnutcreek.com on 2026-10-04. Do not add facts that aren't on the official site.

const OFFICIAL = "https://www.porschewalnutcreek.com";

export type DayHours = { open: string; close: string } | null; // 24h "HH:MM", null = closed

export type Department = {
  id: "sales" | "service" | "parts";
  name: string;
  // index 0 = Sunday ... 6 = Saturday
  week: DayHours[];
};

const weekday = (open: string, close: string): DayHours => ({ open, close });

export const dealership = {
  name: "Porsche Walnut Creek",
  parent: "a Sonic Automotive® Company",
  address: {
    street: "2555 N Main St",
    city: "Walnut Creek",
    state: "CA",
    zip: "94597",
    oneLine: "2555 N Main St, Walnut Creek, CA 94597",
    note: "Right off the 680, near Concord and Alamo.",
  },
  geo: { lat: 37.918514, lng: -122.065973 },
  phone: { display: "925-532-0016", tel: "+19255320016" },
  directionsUrl:
    "https://www.google.com/maps/place/Porsche+Walnut+Creek/@37.918514,-122.065973,15z",
  social: {
    instagram: "https://www.instagram.com/porschewalnutcreek/",
    facebook: "https://www.facebook.com/porschewalnutcreek",
  },
  official: OFFICIAL,
  links: {
    newInventory: `${OFFICIAL}/new-vehicles/`,
    usedInventory: `${OFFICIAL}/used-vehicles/`,
    cpo: `${OFFICIAL}/used-vehicles/certified-pre-owned-vehicles/`,
    electric: `${OFFICIAL}/new-vehicles/electric/`,
    offers: `${OFFICIAL}/current-offers/`,
    scheduleService: `${OFFICIAL}/service/schedule/`,
    serviceSpecials: `${OFFICIAL}/service/service-specials/`,
    orderParts: `${OFFICIAL}/parts/order-parts/`,
    finance: `${OFFICIAL}/finance/`,
    applyFinancing: `${OFFICIAL}/finance/apply-for-financing/`,
    tradeIn: `${OFFICIAL}/value-your-trade/`,
    contact: `${OFFICIAL}/contact-us/`,
    affirm: `${OFFICIAL}/affirm/`,
  },
  departments: [
    {
      id: "sales",
      name: "Sales",
      week: [
        weekday("11:00", "17:00"),
        weekday("08:00", "18:00"),
        weekday("08:00", "18:00"),
        weekday("08:00", "18:00"),
        weekday("08:00", "18:00"),
        weekday("08:00", "18:00"),
        weekday("09:00", "18:00"),
      ],
    },
    {
      id: "service",
      name: "Service",
      week: [
        null,
        weekday("07:30", "18:00"),
        weekday("07:30", "18:00"),
        weekday("07:30", "18:00"),
        weekday("07:30", "18:00"),
        weekday("07:30", "18:00"),
        weekday("08:00", "14:00"),
      ],
    },
    {
      id: "parts",
      name: "Parts",
      week: [
        null,
        weekday("07:30", "18:00"),
        weekday("07:30", "18:00"),
        weekday("07:30", "18:00"),
        weekday("07:30", "18:00"),
        weekday("07:30", "18:00"),
        weekday("09:00", "17:00"),
      ],
    },
  ] satisfies Department[],
  promises: {
    transparentPricing:
      "Porsche Walnut Creek Transparent Pricing: no hidden fees. The price you see is the price you can get.",
    trust:
      "Sonic Automotive was named one of Newsweek's 2026 Most Trustworthy Companies in America.",
    network: "Part of Sonic Automotive, with more than 140 locations nationwide.",
    tires:
      "Eligible tires purchased here come with complimentary 100% road hazard replacement coverage for 24 months.",
    anyVehicle: "Our certified Porsche technicians will service any vehicle you drive.",
    payLater: "Service Now, Pay Later financing is available on service visits.",
  },
};

export type DealershipLinks = typeof dealership.links;
