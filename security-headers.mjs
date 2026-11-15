/**
 * Arman Digital SEO kit: ONE list of response headers for every host. Goes in the project root next to next.config.ts.
 *   - next.config.ts headers()          Vercel, normal (server) build
 *   - scripts/write-host-config.mjs     static export: writes out/vercel.json (Vercel) and out/.htaccess (Hostinger)
 *
 * HSTS is not here: Vercel already sends Strict-Transport-Security (max-age=63072000) on vercel.app and custom domains,
 * and hosting/.htaccess sets it for Hostinger.
 *
 * CSP: this is the baseline that can't break a brochure site (no default-src/script-src). A full script CSP needs
 * per-request nonces (dynamic rendering, Next docs) or hashes; for one, ship it as Content-Security-Policy-Report-Only
 * first and watch the console on every page, embed (Cal.com, Maps, YouTube) and form.
 */

/** Who may put this site in an iframe. Add "https://arman-digital.vercel.app" here to frame it from the portfolio. */
export const FRAME_ANCESTORS = ["'self'"];

export const CSP = [
  `frame-ancestors ${FRAME_ANCESTORS.join(" ")}`,
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self' https:",
  "upgrade-insecure-requests",
].join("; ");

export const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Legacy twin of frame-ancestors for old browsers. Keep the two in agreement.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Content-Security-Policy", value: CSP },
];

/** Unpaid previews also say noindex in the HTTP header (covers images, PDFs, videos, robots.txt...). */
export const noindexHeader = { key: "X-Robots-Tag", value: "noindex, nofollow" };

export const isLicensed = (env = process.env) => env.NEXT_PUBLIC_LICENSED === "true";

/** Headers for every response of this build. */
export function headersFor(licensed = isLicensed()) {
  return licensed ? [...securityHeaders] : [...securityHeaders, noindexHeader];
}

/** Long cache for content-hashed build files only. HTML stays revalidated so a redeploy shows up at once. */
export const IMMUTABLE = "public, max-age=31536000, immutable";
