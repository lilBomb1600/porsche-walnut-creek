import type { NextConfig } from "next";
import { headersFor } from "./security-headers.mjs"; // KIT

const nextConfig: NextConfig = {
  poweredByHeader: false, // KIT: no "X-Powered-By: Next.js"
  // KIT: security headers on every response, plus X-Robots-Tag noindex while NEXT_PUBLIC_LICENSED is unset (preview).
  async headers() {
    return [{ source: "/:path*", headers: headersFor() }];
  },
};

export default nextConfig;
