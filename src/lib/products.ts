// ONE catalog source of truth. Every CTA, price line, cart check and schema.org value derives from here.
// ponytail: typed module, not a CMS — four products, one editor. A status change ships as a new deploy,
// which replaces every cached page on Vercel (no stale catalog can survive a deploy).

export type Status = "draft" | "coming_soon" | "waitlist" | "available" | "sold_out" | "discontinued";
export type Slug = "barrier" | "renewal" | "calm" | "recovery";
export type Image = { src: string; width: number; height: number };

export type Product = {
  id: string;
  slug: Slug;
  name: string;
  sequence: "01" | "02" | "03" | "04";
  role: string;
  headline: string;
  status: Status;
  retailPrice: number | null; // USD as published; null = "announced at launch"
  memberPrice: number | null;
  currency: "USD";
  availabilityDate: string | null; // BLOCKED BY BDSG: no launch date announced
  waitlistEnabled: boolean;
  purchaseEnabled: boolean; // must stay false unless status === "available" (enforced by validateCatalog)
  featuredIngredients: string[];
  inci: string | null; // BLOCKED BY BDSG
  size: string | null; // BLOCKED BY BDSG: packaging photos conflict (6 oz vs 4 oz)
  directions: string | null; // BLOCKED BY BDSG
  warnings: string | null; // BLOCKED BY BDSG
  shortDescription: string;
  longDescription: string;
  whenToUse: string;
  seoTitle: string;
  seoDescription: string;
  images: Image[];
  imageAlt: string;
  relatedProducts: Slug[];
  stripePriceId?: string;
  updatedAt: string;
};

export const products: Product[] = [
  {
    id: "bdsg-barrier", slug: "barrier", name: "Barrier", sequence: "01", role: "Repair & Protect",
    headline: "Hold the line.",
    status: "waitlist", retailPrice: 33, memberPrice: 29.7, currency: "USD",
    availabilityDate: null, waitlistEnabled: true, purchaseEnabled: false,
    featuredIngredients: ["Goat Milk", "Ceramide NP", "Rice Peptides", "Panthenol", "Hyaluronic Acid"],
    inci: null, size: null, directions: null, warnings: null,
    shortDescription: "Supports moisture retention with goat milk, Ceramide NP, panthenol and hyaluronic acid.",
    longDescription: "A daily formula built around goat milk, Ceramide NP, panthenol and hyaluronic acid to support moisture retention and everyday barrier care.",
    whenToUse: "Daily, morning or evening, and after cleansing on training days.",
    seoTitle: "Barrier — Goat Milk & Ceramide NP Moisture Support",
    seoDescription: "BDSG Barrier: goat milk, Ceramide NP, panthenol and hyaluronic acid to support moisture retention. $33.00 at launch. Join the waitlist.",
    images: [{ src: "/img/sitio-actual-barrier.jpg", width: 800, height: 1200 }],
    imageAlt: "BDSG Barrier tube standing on stone beside rice and a dish of cream",
    relatedProducts: ["calm"], updatedAt: "2026-11-17",
  },
  {
    id: "bdsg-renewal", slug: "renewal", name: "Renewal", sequence: "02", role: "Renew & Revitalize",
    headline: "Clear the surface. Keep the comfort.",
    status: "coming_soon", retailPrice: null, memberPrice: null, currency: "USD",
    availabilityDate: null, waitlistEnabled: true, purchaseEnabled: false,
    featuredIngredients: ["Niacinamide", "Honey", "Propolis", "Aloe", "Papain Enzyme"],
    inci: null, size: null, directions: null, warnings: null,
    shortDescription: "Papain enzyme and niacinamide for surface renewal, with honey and aloe for comfort.",
    longDescription: "Papain enzyme and niacinamide support surface renewal while goat milk, honey and aloe help maintain hydration and skin comfort.",
    whenToUse: "When skin texture needs a reset between hard training weeks.",
    seoTitle: "Renewal — Niacinamide & Papain Enzyme Formula",
    seoDescription: "BDSG Renewal: niacinamide, papain enzyme, honey, propolis and aloe. In development. Get notified at launch.",
    images: [], imageAlt: "",
    relatedProducts: ["barrier"], updatedAt: "2026-11-17",
  },
  {
    id: "bdsg-calm", slug: "calm", name: "Calm", sequence: "03", role: "Soothe & Calm",
    headline: "Reset after the day takes its toll.",
    status: "waitlist", retailPrice: 35, memberPrice: 31.5, currency: "USD",
    availabilityDate: null, waitlistEnabled: true, purchaseEnabled: false,
    featuredIngredients: ["Goat Milk", "Beta-Glucan", "Botanical Oils", "Panthenol", "Adaptogens"],
    inci: null, size: null, directions: null, warnings: null,
    shortDescription: "Beta-glucan, botanical oils and panthenol on goat milk for skin that feels dry or tight.",
    longDescription: "A goat milk-based formula featuring beta-glucan, botanical oils, panthenol and adaptogens for skin that feels dry, tight or overexposed after long days and hard sessions.",
    whenToUse: "After sun, wind, cold or a long day, whenever skin feels tight.",
    seoTitle: "Calm — Goat Milk & Beta-Glucan Comfort Formula",
    seoDescription: "BDSG Calm: goat milk, beta-glucan, botanical oils and panthenol for skin that feels dry or tight. $35.00 at launch. Join the waitlist.",
    images: [{ src: "/img/sitio-actual-calm.jpg", width: 800, height: 1200 }],
    imageAlt: "BDSG Calm tube on stone with chia seeds, a glass of milk and dropper bottles",
    relatedProducts: ["recovery"], updatedAt: "2026-11-17",
  },
  {
    id: "bdsg-recovery", slug: "recovery", name: "Recovery", sequence: "04", role: "Deep Recovery",
    headline: "For skin after the session.",
    status: "coming_soon", retailPrice: null, memberPrice: null, currency: "USD",
    availabilityDate: null, waitlistEnabled: true, purchaseEnabled: false,
    featuredIngredients: ["Goat Milk", "Magnesium PCA", "Menthol", "Ginger", "Copaiba"],
    inci: null, size: null, directions: null, warnings: null,
    shortDescription: "Magnesium PCA, menthol and ginger on goat milk for a cool, comfortable finish.",
    longDescription: "Goat milk, magnesium PCA, menthol, ginger and copaiba bring a cool, comfortable finish to post-activity skin care.",
    whenToUse: "Right after training, once you've showered.",
    seoTitle: "Recovery — Magnesium PCA & Menthol Post-Activity Formula",
    seoDescription: "BDSG Recovery: goat milk, magnesium PCA, menthol, ginger and copaiba for a cool finish. In development. Get notified at launch.",
    images: [{ src: "/img/sitio-actual-recovery.jpg", width: 800, height: 1200 }],
    imageAlt: "BDSG Recovery tube on stone beside ginger root and a glass of milk",
    relatedProducts: ["renewal"], updatedAt: "2026-11-17",
  },
];

/** Throws at import (so at build time) if the catalog breaks a hard rule. */
export function validateCatalog(ps: Product[]) {
  for (const p of ps) {
    if (p.purchaseEnabled && p.status !== "available") throw new Error(`${p.slug}: purchaseEnabled requires status "available"`);
    if (p.purchaseEnabled && p.retailPrice == null) throw new Error(`${p.slug}: purchaseEnabled requires a retailPrice`);
    if (p.memberPrice != null && p.retailPrice != null && p.memberPrice > p.retailPrice) throw new Error(`${p.slug}: member price above retail`);
  }
  return ps;
}
validateCatalog(products);

/** Public = everything except drafts. */
export const publicProducts = products.filter((p) => p.status !== "draft");
export const shopOrder: Slug[] = ["barrier", "calm", "renewal", "recovery"];
export const bySlug = (s: string) => products.find((p) => p.slug === s);
export const money = (v: number) => `$${v.toFixed(2)}`;
