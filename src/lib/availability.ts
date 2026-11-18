import type { Product, Status } from "./products";
import { settings } from "./site";

type P = Pick<Product, "status" | "purchaseEnabled" | "retailPrice">;

/** The only gate for buying. Status, the product flag, a price AND the site-wide switches must all agree. */
export const canBuy = (p: P, s = settings) =>
  s.catalogLive && s.checkoutLive && p.status === "available" && p.purchaseEnabled && p.retailPrice != null;

export function statusLabel(s: Status): string {
  switch (s) {
    case "available": return "Available";
    case "waitlist": return "Not yet available";
    case "coming_soon": return "Coming soon";
    case "sold_out": return "Sold out";
    case "discontinued": return "Discontinued";
    case "draft": return "Draft";
  }
}

export function ctaLabel(p: P & Pick<Product, "name">, s = settings): string {
  if (canBuy(p, s)) return `Add to bag — $${p.retailPrice!.toFixed(2)}`;
  switch (p.status) {
    case "waitlist": return `Join the ${p.name} waitlist`;
    case "coming_soon": return "Notify me";
    case "sold_out": return "Notify me when back";
    case "discontinued": return "No longer available";
    default: return "View formula"; // available but checkout off, or draft
  }
}

/** schema.org availability, from the same status. null = emit no Offer at all. */
export function schemaAvailability(p: P, s = settings): string | null {
  if (p.status === "available") return canBuy(p, s) ? "https://schema.org/InStock" : null;
  if (p.status === "sold_out") return "https://schema.org/OutOfStock";
  if (p.status === "discontinued") return "https://schema.org/Discontinued";
  return null;
}

export const anyPurchasable = (ps: P[], s = settings) => ps.some((p) => canBuy(p, s));
