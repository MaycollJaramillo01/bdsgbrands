// Commerce adapter boundary. The storefront never talks to a payment provider directly.
// ponytail: checkout is the only operation with a real caller today. Add inventory/tax/refunds/membership
// methods to CommerceAdapter when BDSG confirms the provider that will answer them.
import { bySlug } from "./products";
import { canBuy } from "./availability";
import { settings } from "./site";

export type CartLine = { slug: string; qty: number };
export type PricedLine = { slug: string; qty: number; unitPrice: number; priceId?: string };
export type CheckoutResult = { ok: true; url: string } | { ok: false; code: "unavailable_item" | "invalid_cart" | "checkout_unavailable" | "provider_error"; message: string; slug?: string };

export interface CommerceAdapter {
  name: string;
  createCheckout(lines: PricedLine[], ctx: { origin: string; orderId: string; subtotal: number }): Promise<CheckoutResult>;
}

/** Server-side cart validation. Rejects anything not purchasable, whatever the client sent. */
export function validateCart(input: unknown): { ok: true; lines: PricedLine[]; subtotal: number } | Extract<CheckoutResult, { ok: false }> {
  if (!Array.isArray(input) || input.length === 0 || input.length > 10) return { ok: false, code: "invalid_cart", message: "Your bag is empty or invalid." };
  const lines: PricedLine[] = [];
  for (const raw of input as CartLine[]) {
    const p = bySlug(String(raw?.slug));
    const qty = Number(raw?.qty);
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 10) return { ok: false, code: "invalid_cart", message: "Your bag has an invalid item." };
    if (!canBuy(p)) return { ok: false, code: "unavailable_item", slug: p.slug, message: `${p.name} isn't available to buy yet.` };
    lines.push({ slug: p.slug, qty, unitPrice: p.retailPrice!, priceId: p.stripePriceId });
  }
  const subtotal = Math.round(lines.reduce((s, l) => s + l.unitPrice * l.qty, 0) * 100) / 100;
  return { ok: true, lines, subtotal };
}

const none: CommerceAdapter = {
  name: "none",
  async createCheckout() {
    return { ok: false, code: "checkout_unavailable", message: "Checkout isn't open yet. Nothing has been charged." };
  },
};

/** Dev-only mock. Never selectable in production. */
const mock: CommerceAdapter = {
  name: "mock",
  async createCheckout(_l, { origin, orderId }) { return { ok: true, url: `${origin}/checkout/success?order=${orderId}&mock=1` }; },
};

export function getAdapter(): CommerceAdapter {
  const want = process.env.COMMERCE_PROVIDER || "none";
  if (!settings.checkoutLive) return none;
  if (want === "mock" && process.env.NODE_ENV !== "production") return mock;
  // BLOCKED BY BDSG: add the confirmed provider's adapter here (e.g. InsForge Payments / Stripe once enabled).
  return none;
}
