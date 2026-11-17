import type { Product, Status } from "./products";

export const PURCHASABLE: Status[] = ["in_stock", "low_stock"];

export const canBuy = (p: Pick<Product, "status" | "price">) => PURCHASABLE.includes(p.status) && p.price != null;

/** Label shown next to the price. Never invents scarcity: low_stock says nothing about counts. */
export function statusLabel(s: Status): string {
  switch (s) {
    case "in_stock": return "In stock";
    case "low_stock": return "Limited availability";
    case "waitlist": return "Not yet available";
    case "coming_soon": return "Coming soon";
    case "out_of_stock": return "Out of stock";
    case "discontinued": return "Discontinued";
  }
}

export function ctaLabel(p: Pick<Product, "status" | "name" | "price">): string {
  if (canBuy(p)) return `Add to bag — $${p.price!.toFixed(2)}`;
  if (p.status === "out_of_stock") return "Notify me when it's back";
  if (p.status === "discontinued") return "No longer available";
  return p.status === "waitlist" ? `Join the ${p.name} waitlist` : "Notify me at launch";
}

/** schema.org availability. Waitlist/coming soon are never InStock; returns null when no Offer should exist. */
export function schemaAvailability(s: Status): string | null {
  if (s === "in_stock") return "https://schema.org/InStock";
  if (s === "low_stock") return "https://schema.org/LimitedAvailability";
  if (s === "out_of_stock") return "https://schema.org/OutOfStock";
  if (s === "discontinued") return "https://schema.org/Discontinued";
  return null;
}

export const anyPurchasable = (ps: Pick<Product, "status" | "price">[]) => ps.some(canBuy);
