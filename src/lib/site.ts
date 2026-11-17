// Site-wide config. Anything unconfirmed comes from env and renders nothing when empty.
export const site = {
  name: "BDSG",
  longName: "Be D' Summit Greatness",
  entity: "BDSG Brands, LLC",
  institutional: "Built for the Journey. Not the Title.",
  promise: "Skincare that works as hard as you do.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://bdsgbrands.com").replace(/\/$/, ""),
  // Staging (bdsgbrands.vercel.app) is noindexed unless explicitly marked production.
  indexable: process.env.NEXT_PUBLIC_SITE_ENV === "production",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "", // BLOCKED: official address unconfirmed
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
  discountMax: 10, // "up to 10%" as published
  shippingThreshold: 50, // members, "eligible orders"
  standardShippingThreshold: 70, // published in Terms §6
  benefits: [
    { title: "Member pricing", body: "Up to 10% off every formula." },
    { title: "Free shipping from $50", body: "On eligible orders, instead of $70." },
    { title: "Early access", body: "First access to new formulas and limited releases." },
    { title: "Community", body: "Access to the Greatness Program community." },
    { title: "Monthly content", body: "Wellness resources for a training routine." },
    { title: "Referral code", body: "Share your code. Rewards follow the program rules." },
  ],
  termsVersion: "draft-2026-11-17",
  effectiveDate: null as string | null, // BLOCKED: Partner Agreement + approval
};
