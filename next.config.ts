import type { NextConfig } from "next";
import path from "node:path";

const GA = "https://www.googletagmanager.com https://*.google-analytics.com";
const META = "https://connect.facebook.net https://www.facebook.com";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${GA} ${META}${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${GA} ${META}`,
  "font-src 'self'",
  `connect-src 'self' ${process.env.NEXT_PUBLIC_INSFORGE_URL ?? ""} ${GA} ${META}`,
  "frame-src https://checkout.stripe.com",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const old: [string, string][] = [
  ["/formulas/:slug", "/products/:slug"],
  ["/index.php", "/"], ["/products.php", "/shop"], ["/greatness-program.php", "/greatness"], ["/contact.php", "/contact"],
  ["/privacy-policy.php", "/legal/privacy"], ["/terms.php", "/legal/terms"], ["/cookie-policy.php", "/legal/cookies"], ["/returns.php", "/legal/returns"],
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  redirects: async () => old.map(([source, destination]) => ({ source, destination, statusCode: 301 as const })),
  headers: async () => [{
    source: "/:path*",
    headers: [
      { key: "Content-Security-Policy", value: csp },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.stripe.com\")" },
      { key: "X-Frame-Options", value: "DENY" },
      ...(process.env.NEXT_PUBLIC_SITE_ENV === "production" ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
    ],
  }],
};
export default nextConfig;
