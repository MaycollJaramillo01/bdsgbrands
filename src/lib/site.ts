// SiteSetting + MembershipConfig. Edited in /admin → Settings (table `site_settings`), snapshotted at build
// into src/data/settings.json. Only the staging-only draft-policy switch stays an env var.
import s from "../data/settings.json";

const flag = (v: string | undefined, fallback = false) => (v == null || v === "" ? fallback : v === "true");
const n = (v: unknown, d: number) => (v == null || v === "" ? d : Number(v));

export type SettingsRow = typeof s;

export const settings = {
  catalogLive: !!s.catalog_live, // false hides prices and CTAs behind "coming soon"
  checkoutLive: !!s.checkout_live, // also needs a commerce adapter (BLOCKED BY BDSG)
  membershipEnrollmentLive: !!s.membership_enrollment_live, // also needs approved terms (effective date)
  // Lets staging show draft legal text; production builds fail if a draft would be public.
  showDraftPolicies: flag(process.env.NEXT_PUBLIC_SHOW_DRAFT_POLICIES),
  standardFreeShippingThreshold: n(s.standard_free_shipping_threshold, 70),
  memberFreeShippingThreshold: n(s.member_free_shipping_threshold, 50),
  currency: "USD" as const,
  supportEmail: s.support_email || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "", // hidden while empty
  privacyPolicyVersion: s.privacy_policy_version,
};

export const site = {
  name: "BDSG",
  longName: "Be D' Summit Greatness",
  entity: "BDSG Brands, LLC",
  institutional: "Built for the Journey. Not the Title.",
  promise: "Skincare that works as hard as you do.",
  positioning: "Performance skincare for people who keep showing up.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://bdsgbrands.com").replace(/\/$/, ""),
  indexable: process.env.NEXT_PUBLIC_SITE_ENV === "production",
  contactEmail: settings.supportEmail,
  social: (s.social as { label: string; href: string }[]).filter((x) => /^https:\/\//.test(x.href)),
};

const initialPrice = n(s.membership_initial_price, 55);
const renewalPrice = n(s.membership_renewal_price, 35);
const discountMax = n(s.membership_discount_max, 10);

export const membership = {
  name: "Greatness Program",
  initialPrice,
  renewalPrice,
  renewalPeriod: "year" as const,
  autoRenew: true,
  discountMax,
  shippingThreshold: settings.memberFreeShippingThreshold,
  standardShippingThreshold: settings.standardFreeShippingThreshold,
  benefits: [
    { title: "Member pricing", body: `Up to ${discountMax}% off every formula.` },
    { title: `Free shipping from $${settings.memberFreeShippingThreshold}`, body: `On eligible orders, instead of $${settings.standardFreeShippingThreshold}.` },
    { title: "Early access", body: "First access to new formulas and limited releases." },
    { title: "Community", body: "Access to the Greatness Program community." },
    { title: "Monthly content", body: "Wellness resources for a training routine." },
    { title: "Referral code", body: "Share your code. Rewards follow the program rules." },
  ],
  termsVersion: "draft-2026-11-17",
  effectiveDate: (s.membership_effective_date as string | null) ?? null, // set in /admin once terms are approved
  /** Enrollment opens only when the switch is on AND approved terms have an effective date. */
  get enrollmentOpen() { return settings.membershipEnrollmentLive && this.effectiveDate != null; },
};

// Hard stop: draft legal text can only be shown on a non-indexable (staging) build.
if (settings.showDraftPolicies && site.indexable) throw new Error("NEXT_PUBLIC_SHOW_DRAFT_POLICIES cannot be enabled on a production build");
