/**
 * Porsche film and photography used on the site, with the approval Arman obtained to use porsche.com imagery.
 * Source films live on newstv.porsche.com; the reel and loops are short muted cuts of them.
 */

export const reel = {
  src: "/media/reel.mp4",
  small: "/media/reel-720.mp4",
  poster: "/media/reel.jpg",
  // shot boundaries in seconds, measured from the encoded reel
  chapters: [
    { name: "911 Carrera GTS", start: 0, end: 5.56, href: "#lineup" },
    { name: "911 Turbo S", start: 5.56, end: 12.76, href: "#legends" },
    { name: "911 GT3 RS", start: 12.76, end: 17.22, href: "#legends" },
    { name: "Macan Electric", start: 17.22, end: 23.2, href: "#lineup" },
  ],
};

/** IMSA season finale, Road Atlanta. Facts from Porsche Motorsport's race report of October 3, 2026. */
export const petitLeMans = {
  report: "https://racing.porsche.com/en-US/articles/imsa-petit-le-mans-race-report-2026",
  date: "October 3, 2026",
  car: "#6 Porsche 963",
  team: "Porsche Penske Motorsport",
  drivers: ["Laurens Vanthoor", "Kévin Estre", "Matt Campbell"],
  laps: [
    { label: "Green flag", note: "Wet tires, damp track" },
    { label: "Red flag", note: "Severe weather stops the race" },
    { label: "16th restart", note: "Vanthoor holds the lead" },
    { label: "Checkered flag", note: "First 963 win at Road Atlanta" },
  ],
};

export const mediaCredit = {
  newsroom: "https://newsroom.porsche.com",
};

/**
 * Short films for the reels strip, all 4:5 and muted. Showroom films come from the store's Instagram; creator films
 * are shown with each creator's permission, obtained by the store. Every cut is car-only, with platform watermarks
 * cropped out.
 */
export type Reel = {
  id: string;
  title: string;
  src: string;
  poster: string;
  source: "showroom" | "creator";
  cgi?: boolean;
  handle: string;
  platform: "Instagram" | "TikTok";
  url: string;
};

const IG = "https://www.instagram.com/porschewalnutcreek/";

export const reels: Reel[] = [
  {
    id: "gts",
    title: "911 Carrera GTS",
    src: "/media/creator-brannon.mp4",
    poster: "/media/creator-brannon.jpg",
    source: "creator",
    handle: "brannoncjackson",
    platform: "TikTok",
    url: "https://www.tiktok.com/@brannoncjackson",
  },
  {
    id: "st",
    title: "911 S/T",
    src: "/media/showroom-911-m.mp4",
    poster: "/media/showroom-911-m.jpg",
    source: "showroom",
    handle: "porschewalnutcreek",
    platform: "Instagram",
    url: IG,
  },
  {
    id: "tunnel",
    title: "Tunnel run",
    src: "/media/creator-lxck.mp4",
    poster: "/media/creator-lxck.jpg",
    source: "creator",
    cgi: true,
    handle: "lxck.render",
    platform: "TikTok",
    url: "https://www.tiktok.com/@lxck.render",
  },
  {
    id: "macan",
    title: "Macan GTS Electric",
    src: "/media/showroom-macan-m.mp4",
    poster: "/media/showroom-macan-m.jpg",
    source: "showroom",
    handle: "porschewalnutcreek",
    platform: "Instagram",
    url: IG,
  },
  {
    id: "forest",
    title: "Forest light",
    src: "/media/creator-hitte69.mp4",
    poster: "/media/creator-hitte69.jpg",
    source: "creator",
    cgi: true,
    handle: "hitte69",
    platform: "TikTok",
    url: "https://www.tiktok.com/@hitte69",
  },
  {
    id: "gt3",
    title: "911 GT3",
    src: "/media/showroom-gt3-m.mp4",
    poster: "/media/showroom-gt3-m.jpg",
    source: "showroom",
    handle: "porschewalnutcreek",
    platform: "Instagram",
    url: IG,
  },
];
