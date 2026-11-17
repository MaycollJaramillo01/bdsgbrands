import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { legal } from "@/content/legal";
import { site } from "@/lib/site";

// Draft legal pages are noindex, so they stay out of the sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/shop", "/science", "/about", "/greatness", "/faq", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, lastModified: "2026-11-17" })),
    ...products.map((p) => ({ url: `${site.url}/products/${p.slug}`, lastModified: p.updatedAt })),
    ...Object.entries(legal).filter(([, d]) => !d.draft).map(([s]) => ({ url: `${site.url}/legal/${s}`, lastModified: "2026-11-17" })),
  ];
}
