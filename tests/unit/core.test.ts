import { describe, expect, it } from "vitest";
import { canBuy, ctaLabel, schemaAvailability, statusLabel } from "../../src/lib/availability";
import { bySlug, money, products } from "../../src/lib/products";
import { parseContact, parseWaitlist, rateLimited } from "../../src/lib/validation";
import { membership } from "../../src/lib/site";
import { publishableTestimonials } from "../../src/lib/compliance";

describe("availability", () => {
  it("never sells waitlist or coming-soon products", () => {
    for (const s of ["waitlist", "coming_soon", "out_of_stock", "discontinued"] as const) expect(canBuy({ status: s, price: 33 })).toBe(false);
    expect(canBuy({ status: "in_stock", price: 33 })).toBe(true);
    expect(canBuy({ status: "in_stock", price: null })).toBe(false);
  });
  it("labels CTAs by status", () => {
    expect(ctaLabel({ status: "waitlist", name: "Barrier", price: 33 })).toBe("Join the Barrier waitlist");
    expect(ctaLabel({ status: "coming_soon", name: "Renewal", price: null })).toBe("Notify me at launch");
    expect(ctaLabel({ status: "in_stock", name: "Barrier", price: 33 })).toBe("Add to bag — $33.00");
    expect(statusLabel("low_stock")).toBe("Limited availability");
  });
  it("emits no schema Offer availability for unreleased products", () => {
    expect(schemaAvailability("waitlist")).toBeNull();
    expect(schemaAvailability("coming_soon")).toBeNull();
    expect(schemaAvailability("in_stock")).toBe("https://schema.org/InStock");
  });
  it("matches the current catalog status from the official site", () => {
    expect(bySlug("barrier")!.status).toBe("waitlist");
    expect(bySlug("calm")!.status).toBe("waitlist");
    expect(products.some((p) => canBuy(p))).toBe(false);
  });
});

describe("pricing", () => {
  it("member prices are 10% off and never above retail", () => {
    for (const p of products) if (p.price != null && p.memberPrice != null) expect(p.memberPrice).toBeCloseTo(p.price * 0.9, 2);
    expect(money(29.7)).toBe("$29.70");
    expect([membership.initialPrice, membership.renewalPrice]).toEqual([55, 35]);
  });
});

describe("validation", () => {
  it("requires email + explicit consent for the waitlist", () => {
    expect(parseWaitlist({ email: "a@b.co", topic: "barrier" }).ok).toBe(false);
    expect(parseWaitlist({ email: "nope", topic: "barrier", consent: true }).ok).toBe(false);
    expect(parseWaitlist({ email: "a@b.co", topic: "x", consent: true }).ok).toBe(false);
    const r = parseWaitlist({ email: " A@B.co ", topic: "barrier", consent: true });
    expect(r.ok && r.data.email).toBe("a@b.co");
  });
  it("validates contact messages and keeps safety fields only for reactions", () => {
    expect(parseContact({ name: "", email: "a@b.co", topic: "other", message: "hello there!" }).ok).toBe(false);
    const r = parseContact({ name: "Ana", email: "a@b.co", topic: "other", message: "hello there!", product: "calm" });
    expect(r.ok && r.data.product).toBeNull();
    const s = parseContact({ name: "Ana", email: "a@b.co", topic: "reaction", message: "red patch on cheek", product: "calm", reactionDate: "2026-11-01" });
    expect(s.ok && s.data.product).toBe("calm");
  });
  it("rate limits after the window max", () => {
    const k = `t${Math.random()}`;
    const r = Array.from({ length: 4 }, () => rateLimited(k, 3, 1000, 0));
    expect(r).toEqual([false, false, false, true]);
    expect(rateLimited(k, 3, 1000, 2000)).toBe(false);
  });
});

describe("compliance", () => {
  it("publishes no testimonials until verified", () => expect(publishableTestimonials()).toEqual([]));
  it("copy avoids prohibited claims", () => {
    const text = JSON.stringify(products).toLowerCase();
    for (const bad of ["clinically proven", "anti-inflammatory", "heals", "repairs damaged skin", "fda approved"]) expect(text).not.toContain(bad);
  });
});
