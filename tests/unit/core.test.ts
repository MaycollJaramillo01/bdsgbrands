import { describe, expect, it } from "vitest";
import { fromText, toText } from "../../src/app/admin/(panel)/policies/format";
import { canBuy, ctaLabel, schemaAvailability, statusLabel } from "../../src/lib/availability";
import { money, products, validateCatalog, type Product } from "../../src/lib/products";
import { WAITLIST_TOPICS, badOrigin, parseContact, parseWaitlist, rateLimited } from "../../src/lib/validation";
import { membership, settings } from "../../src/lib/site";
import { publishableTestimonials } from "../../src/lib/compliance";
import { validateCart } from "../../src/lib/commerce";
import { legal } from "../../src/content/legal";

const on = { ...settings, catalogLive: true, checkoutLive: true };
// Fixture, independent of whatever the admin has in the catalog today.
const base: Product = {
  id: "t-barrier", slug: "barrier", name: "Barrier", sequence: "01", role: "Repair & Protect", headline: "Hold the line.",
  status: "waitlist", retailPrice: 33, memberPrice: 29.7, currency: "USD", availabilityDate: null, waitlistEnabled: true,
  purchaseEnabled: false, inventory: null, featuredIngredients: ["Goat Milk"], inci: null, size: null, directions: null, warnings: null,
  shortDescription: "", longDescription: "", whenToUse: "", seoTitle: "", seoDescription: "", images: [], imageAlt: "",
  relatedProducts: [], updatedAt: "",
};
const mk = (o: Partial<Product>): Product => ({ ...base, ...o });
const unbuyable = products.find((p) => !canBuy(p));
const topic = WAITLIST_TOPICS[0];

describe("catalog status", () => {
  it("only sells available + purchaseEnabled + priced + checkout live", () => {
    for (const s of ["draft", "coming_soon", "waitlist", "sold_out", "discontinued"] as const)
      expect(canBuy(mk({ status: s, purchaseEnabled: true }), on)).toBe(false);
    expect(canBuy(mk({ status: "available", purchaseEnabled: true }), on)).toBe(true);
    expect(canBuy(mk({ status: "available", purchaseEnabled: false }), on)).toBe(false);
    expect(canBuy(mk({ status: "available", purchaseEnabled: true }), { ...on, checkoutLive: false })).toBe(false);
    expect(canBuy(mk({ status: "available", purchaseEnabled: true, retailPrice: null }), on)).toBe(false);
    expect(canBuy(mk({ status: "available", purchaseEnabled: true, inventory: 0 }), on)).toBe(false);
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

describe("REGRESSION: whatever the admin publishes, nothing unreleased can be sold", () => {
  it("only status available + purchaseEnabled + priced + checkout live can show Add to bag or InStock", () => {
    for (const p of products) {
      const sellable = p.status === "available" && p.purchaseEnabled && p.retailPrice != null && settings.catalogLive && settings.checkoutLive && (p.inventory == null || p.inventory > 0);
      expect(canBuy(p)).toBe(sellable);
      if (!sellable) {
        expect(ctaLabel(p)).not.toMatch(/add to bag|buy|ready/i);
        expect(schemaAvailability(p)).not.toBe("https://schema.org/InStock");
      }
    }
  });
  it("membership enrollment needs both the switch and approved terms", () => {
    expect(membership.enrollmentOpen).toBe(settings.membershipEnrollmentLive && membership.effectiveDate != null);
  });
  it("prices are sane", () => {
    for (const p of products) if (p.memberPrice != null) expect(p.retailPrice).not.toBeNull();
    expect(membership.renewalPrice).toBeLessThanOrEqual(membership.initialPrice);
    expect(money(29.7)).toBe("$29.70");
  });
});

describe("cart (server-side)", () => {
  it("rejects unavailable SKUs even if the client sends them", () => {
    if (!unbuyable) return;
    const r = validateCart([{ slug: unbuyable.slug, qty: 1 }]);
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
    expect(parseWaitlist({ email: "a@b.co", topic }).ok).toBe(false);
    expect(parseWaitlist({ email: "nope", topic, consent: true }).ok).toBe(false);
    expect(parseWaitlist({ email: "a@b.co", topic: "x", consent: true }).ok).toBe(false);
    const r = parseWaitlist({ email: " A@B.co ", topic, consent: true });
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
  it("a published policy has no unresolved (tbc) blocks", () => {
    for (const [slug, d] of Object.entries(legal)) if (!d.draft) expect(d.blocks.filter((b) => b.t === "tbc").map((b) => `${slug}: ${b.text}`)).toEqual([]);
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
  it("test data never reaches a production build", () => {
    if (process.env.NEXT_PUBLIC_SITE_ENV === "production") expect(JSON.stringify([products, legal])).not.toContain("[TEST DATA]");
  });
});

describe("admin policy editor", () => {
  it("text format round-trips every stored policy without loss", () => {
    const norm = (bs: { t: string; text: string; label?: string }[]) => bs.map(({ label, ...b }) => (label ? { ...b, label } : b));
    for (const [slug, d] of Object.entries(legal)) expect([slug, fromText(toText(d.blocks))]).toEqual([slug, norm(d.blocks)]);
  });
});
