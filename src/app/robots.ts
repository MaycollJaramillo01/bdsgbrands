import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Staging (anything not NEXT_PUBLIC_SITE_ENV=production) blocks all crawling.
export default function robots(): MetadataRoute.Robots {
  if (!site.indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/checkout/", "/admin"] }, sitemap: `${site.url}/sitemap.xml` };
}
