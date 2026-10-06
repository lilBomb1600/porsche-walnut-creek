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
