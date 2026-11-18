import { describe, expect, it } from "vitest";
import { canBuy, ctaLabel, schemaAvailability, statusLabel } from "../../src/lib/availability";
import { bySlug, money, products, validateCatalog, type Product } from "../../src/lib/products";
import { badOrigin, parseContact, parseWaitlist, rateLimited } from "../../src/lib/validation";
import { membership, settings } from "../../src/lib/site";
import { publishableTestimonials } from "../../src/lib/compliance";
import { validateCart } from "../../src/lib/commerce";
import { legal } from "../../src/content/legal";

const on = { ...settings, catalogLive: true, checkoutLive: true };
const mk = (o: Partial<Product>): Product => ({ ...bySlug("barrier")!, ...o });

describe("catalog status", () => {
  it("only sells available + purchaseEnabled + priced + checkout live", () => {
    for (const s of ["draft", "coming_soon", "waitlist", "sold_out", "discontinued"] as const)
      expect(canBuy(mk({ status: s, purchaseEnabled: true }), on)).toBe(false);
    expect(canBuy(mk({ status: "available", purchaseEnabled: true }), on)).toBe(true);
    expect(canBuy(mk({ status: "available", purchaseEnabled: false }), on)).toBe(false);
    expect(canBuy(mk({ status: "available", purchaseEnabled: true }), { ...on, checkoutLive: false })).toBe(false);
    expect(canBuy(mk({ status: "available", purchaseEnabled: true, retailPrice: null }), on)).toBe(false);
  });
  it("rejects purchaseEnabled without available status at build time", () => {
    expect(() => validateCatalog([mk({ status: "waitlist", purchaseEnabled: true })])).toThrow();
    expect(() => validateCatalog([mk({ memberPrice: 99 })])).toThrow();
  });
  it("picks the CTA from status", () => {
    expect(ctaLabel(mk({ status: "waitlist" }))).toBe("Join the Barrier waitlist");
    expect(ctaLabel(mk({ status: "coming_soon" }))).toBe("Notify me");
    expect(ctaLabel(mk({ status: "sold_out" }))).toBe("Notify me when back");
    expect(ctaLabel(mk({ status: "available", purchaseEnabled: true }), on)).toBe("Add to bag — $33.00");
    expect(statusLabel("waitlist")).toBe("Not yet available");
  });
  it("schema availability follows status; no Offer for unreleased", () => {
    expect(schemaAvailability(mk({ status: "waitlist" }))).toBeNull();
    expect(schemaAvailability(mk({ status: "coming_soon" }))).toBeNull();
    expect(schemaAvailability(mk({ status: "available", purchaseEnabled: true }), on)).toBe("https://schema.org/InStock");
    expect(schemaAvailability(mk({ status: "sold_out" }))).toBe("https://schema.org/OutOfStock");
  });
});

describe("REGRESSION: current confirmed state (change only with BDSG confirmation)", () => {
  it("Barrier and Calm are waitlist, Renewal and Recovery coming soon, nothing purchasable", () => {
    expect(bySlug("barrier")!.status).toBe("waitlist");
    expect(bySlug("calm")!.status).toBe("waitlist");
    expect(bySlug("renewal")!.status).toBe("coming_soon");
    expect(bySlug("recovery")!.status).toBe("coming_soon");
    for (const p of products) {
      expect(p.purchaseEnabled).toBe(false);
      expect(canBuy(p)).toBe(false);
      expect(ctaLabel(p)).not.toMatch(/add to bag|buy|ready/i);
      expect(schemaAvailability(p)).not.toBe("https://schema.org/InStock");
    }
    expect(settings.checkoutLive).toBe(false);
    expect(membership.enrollmentOpen).toBe(false);
  });
  it("prices match the published values", () => {
    expect([bySlug("barrier")!.retailPrice, bySlug("barrier")!.memberPrice]).toEqual([33, 29.7]);
    expect([bySlug("calm")!.retailPrice, bySlug("calm")!.memberPrice]).toEqual([35, 31.5]);
    expect(bySlug("renewal")!.retailPrice).toBeNull();
    expect([membership.initialPrice, membership.renewalPrice, settings.standardFreeShippingThreshold, settings.memberFreeShippingThreshold]).toEqual([55, 35, 70, 50]);
    expect(money(29.7)).toBe("$29.70");
  });
});

describe("cart (server-side)", () => {
  it("rejects unavailable SKUs even if the client sends them", () => {
    const r = validateCart([{ slug: "barrier", qty: 1 }]);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.code).toBe("unavailable_item");
  });
  it("rejects malformed carts", () => {
    for (const bad of [null, [], [{ slug: "x", qty: 1 }], [{ slug: "barrier", qty: 0 }], [{ slug: "barrier", qty: 1.5 }]])
      expect(validateCart(bad).ok).toBe(false);
  });
});

describe("forms", () => {
  it("waitlist needs email, a known formula and explicit consent", () => {
    expect(parseWaitlist({ email: "a@b.co", topic: "barrier" }).ok).toBe(false);
    expect(parseWaitlist({ email: "nope", topic: "barrier", consent: true }).ok).toBe(false);
    expect(parseWaitlist({ email: "a@b.co", topic: "x", consent: true }).ok).toBe(false);
    const r = parseWaitlist({ email: " A@B.co ", topic: "calm", consent: true });
    expect(r.ok && r.data.email).toBe("a@b.co");
  });
  it("contact keeps safety fields only for reactions; privacy topic exists", () => {
    expect(parseContact({ name: "", email: "a@b.co", topic: "other", message: "hello there!" }).ok).toBe(false);
    expect(parseContact({ name: "A", email: "a@b.co", topic: "privacy", message: "delete my data" }).ok).toBe(true);
    const r = parseContact({ name: "Ana", email: "a@b.co", topic: "other", message: "hello there!", product: "calm" });
    expect(r.ok && r.data.product).toBeNull();
  });
  it("rate limit and CSRF guard", () => {
    const k = `t${Math.random()}`;
    expect(Array.from({ length: 4 }, () => rateLimited(k, 3, 1000, 0))).toEqual([false, false, false, true]);
    const req = (h: Record<string, string>) => new Request("https://bdsgbrands.com/api/x", { method: "POST", headers: h });
    expect(badOrigin(req({ origin: "https://evil.test", "content-type": "application/json" }))).toBe(true);
    expect(badOrigin(req({ "content-type": "text/plain" }))).toBe(true);
    expect(badOrigin(req({ origin: "https://bdsgbrands.com", "content-type": "application/json" }))).toBe(false);
  });
});

describe("LEGAL + compliance gate (runs before every build)", () => {
  const forbidden = /\bTBD\b|\bTODO\b|To confirm before launch|Draft — not yet in effect|Awaiting client|To confirm with BDSG/i;
  it("every published (non-draft) policy is free of placeholders", () => {
    for (const [slug, d] of Object.entries(legal)) if (!d.draft) expect(`${slug}: ${JSON.stringify(d)}`).not.toMatch(forbidden);
  });
  it("draft text is only allowed on non-production builds", () => {
    if (process.env.NEXT_PUBLIC_SITE_ENV === "production") expect(settings.showDraftPolicies).toBe(false);
  });
  it("public product copy has no placeholders or prohibited claims", () => {
    const text = JSON.stringify(products);
    expect(text).not.toMatch(forbidden);
    for (const bad of ["clinically proven", "anti-inflammatory", "heals", "cures", "repairs damaged skin", "fda approved", "dermatologist approved", "medical grade"])
      expect(text.toLowerCase()).not.toContain(bad);
  });
  it("publishes no unverified testimonials", () => expect(publishableTestimonials()).toEqual([]));
});
