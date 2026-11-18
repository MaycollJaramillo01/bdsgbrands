// ONE catalog source of truth: the `products` table in InsForge, edited in /admin.
// The prebuild step (scripts/pull-content.mjs) snapshots it into src/data/catalog.json; every CTA,
// price line, cart check and schema.org value derives from that snapshot. Publishing from the admin
// triggers a deploy, which replaces every cached page (no stale catalog survives a deploy).
import raw from "../data/catalog.json";

export type Status = "draft" | "coming_soon" | "waitlist" | "available" | "sold_out" | "discontinued";
export const STATUSES: Status[] = ["draft", "coming_soon", "waitlist", "available", "sold_out", "discontinued"];
export type Slug = string;
export type Image = { src: string; width: number; height: number; key?: string };

export type Product = {
  id: string;
  slug: Slug;
  name: string;
  sequence: string;
  role: string;
  headline: string;
  status: Status;
  retailPrice: number | null; // null = "announced at launch"
  memberPrice: number | null;
  currency: "USD";
  availabilityDate: string | null;
  waitlistEnabled: boolean;
  purchaseEnabled: boolean; // must stay false unless status === "available" (DB constraint + validateCatalog)
  inventory: number | null;
  featuredIngredients: string[];
  inci: string | null;
  size: string | null;
  directions: string | null;
  warnings: string | null;
  shortDescription: string;
  longDescription: string;
  whenToUse: string;
  seoTitle: string;
  seoDescription: string;
  images: Image[];
  imageAlt: string;
  relatedProducts: Slug[];
  providerPriceId?: string;
  updatedAt: string;
};

/** Database row (snake_case) → Product. */
export type ProductRow = Record<string, unknown>;
const num = (v: unknown) => (v == null || v === "" ? null : Number(v));
const txt = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);
export function fromRow(r: ProductRow): Product {
  return {
    id: String(r.id), slug: String(r.slug), name: String(r.name), sequence: String(r.sequence ?? ""), role: String(r.role ?? ""),
    headline: String(r.headline ?? ""), status: r.status as Status,
    retailPrice: num(r.retail_price), memberPrice: num(r.member_price), currency: "USD",
    availabilityDate: txt(r.availability_date), waitlistEnabled: !!r.waitlist_enabled, purchaseEnabled: !!r.purchase_enabled,
    inventory: num(r.inventory), featuredIngredients: (r.featured_ingredients as string[]) ?? [],
    inci: txt(r.inci), size: txt(r.size), directions: txt(r.directions), warnings: txt(r.warnings),
    shortDescription: String(r.short_description ?? ""), longDescription: String(r.long_description ?? ""), whenToUse: String(r.when_to_use ?? ""),
    seoTitle: String(r.seo_title || r.name), seoDescription: String(r.seo_description ?? ""),
    images: (r.images as Image[]) ?? [], imageAlt: String(r.image_alt ?? ""), relatedProducts: (r.related_products as string[]) ?? [],
    providerPriceId: txt(r.provider_price_id) ?? undefined, updatedAt: String(r.updated_at ?? ""),
  };
}

/** Throws at import (so at build time) if the catalog breaks a hard rule. */
export function validateCatalog(ps: Product[]) {
  for (const p of ps) {
    if (!STATUSES.includes(p.status)) throw new Error(`${p.slug}: unknown status "${p.status}"`);
    if (p.purchaseEnabled && p.status !== "available") throw new Error(`${p.slug}: purchaseEnabled requires status "available"`);
    if (p.purchaseEnabled && p.retailPrice == null) throw new Error(`${p.slug}: purchaseEnabled requires a retailPrice`);
    if (p.memberPrice != null && p.retailPrice != null && p.memberPrice > p.retailPrice) throw new Error(`${p.slug}: member price above retail`);
  }
  return ps;
}

export const products: Product[] = validateCatalog((raw as ProductRow[]).map(fromRow)); // sorted by `sort`

/** Public = everything except drafts. */
export const publicProducts = products.filter((p) => p.status !== "draft");
export const shopOrder: Slug[] = publicProducts.map((p) => p.slug);
export const bySlug = (s: string) => products.find((p) => p.slug === s);
/** Home feature: first available product, else first on a waitlist, else first public one. */
export const featured = publicProducts.find((p) => p.status === "available") ?? publicProducts.find((p) => p.status === "waitlist") ?? publicProducts[0];
export const money = (v: number) => `$${v.toFixed(2)}`;
