// SiteSetting + MembershipConfig. Production-impacting switches read env first, so they change in Vercel, not in code.
const flag = (v: string | undefined, fallback = false) => (v == null || v === "" ? fallback : v === "true");

export const settings = {
  catalogLive: flag(process.env.NEXT_PUBLIC_CATALOG_LIVE, true), // false hides prices and CTAs behind "coming soon"
  checkoutLive: flag(process.env.NEXT_PUBLIC_CHECKOUT_LIVE), // BLOCKED BY BDSG: no commerce provider confirmed
  // BLOCKED BY BDSG: bdsgbrands.com offers "Create Account & Join" while this site does not. Off until terms are approved.
  membershipEnrollmentLive: flag(process.env.NEXT_PUBLIC_MEMBERSHIP_ENROLLMENT_LIVE),
  // Lets staging show draft legal text; production builds fail if a draft would be public.
  showDraftPolicies: flag(process.env.NEXT_PUBLIC_SHOW_DRAFT_POLICIES),
  standardFreeShippingThreshold: 70, // published in Terms of Sale §6
  memberFreeShippingThreshold: 50, // published, "eligible orders"
  currency: "USD" as const,
  supportEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "", // BLOCKED BY BDSG: hidden while empty
  privacyPolicyVersion: "2026-08-21", // effective date of the published Privacy Policy
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
  social: [
    { label: "Instagram", href: "https://www.instagram.com/bdsg.official/" },
    { label: "TikTok", href: "https://www.tiktok.com/@bdsg.official" },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61586803785256" },
    { label: "X", href: "https://x.com/BDSGofficial1" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/bdsg-brands" },
  ],
};

export const membership = {
  name: "Greatness Program",
  initialPrice: 55,
  renewalPrice: 35,
  renewalPeriod: "year" as const,
  autoRenew: true,
  discountMax: 10,
  shippingThreshold: settings.memberFreeShippingThreshold,
  standardShippingThreshold: settings.standardFreeShippingThreshold,
  benefits: [
    { title: "Member pricing", body: "Up to 10% off every formula." },
    { title: "Free shipping from $50", body: "On eligible orders, instead of $70." },
    { title: "Early access", body: "First access to new formulas and limited releases." },
    { title: "Community", body: "Access to the Greatness Program community." },
    { title: "Monthly content", body: "Wellness resources for a training routine." },
    { title: "Referral code", body: "Share your code. Rewards follow the program rules." },
  ],
  termsVersion: "draft-2026-11-17",
  effectiveDate: null as string | null, // BLOCKED BY BDSG
  /** Enrollment opens only when the switch is on AND approved terms have an effective date. */
  get enrollmentOpen() { return settings.membershipEnrollmentLive && this.effectiveDate != null; },
};

// Hard stop: draft legal text can only be shown on a non-indexable (staging) build.
if (settings.showDraftPolicies && site.indexable) throw new Error("NEXT_PUBLIC_SHOW_DRAFT_POLICIES cannot be enabled on a production build");
