// Regulatory + claims config. Nothing here renders publicly unless approved.

/** Cosmetic regulatory data (MoCRA). All BLOCKED until BDSG supplies it; never shown publicly by default. */
export const regulatory = {
  responsiblePerson: null as string | null,
  facilityRegistration: null as string | null,
  productListings: {} as Record<string, string>,
  safetyContactEmail: process.env.SAFETY_CONTACT_EMAIL || null, // server-only
  showPublicly: false,
};

/** Claims registry: only `approved` claims may be rendered as claims. Empty = site uses descriptive copy only. */
export type Claim = {
  claim: string;
  product: string;
  approvedWording: string;
  evidenceDocument: string;
  dateReviewed: string;
  reviewer: string;
  approved: boolean;
};
export const claims: Claim[] = [];
export const approvedClaims = (product: string) => claims.filter((c) => c.approved && c.product === product);

/** Testimonials render only when verified AND permission granted. None supplied → module not rendered. */
export type Testimonial = {
  id: string; name: string; content: string; product: string;
  verified: boolean; verifiedPurchase: boolean; materialConnection: boolean;
  disclosure: string | null; permission: boolean; approvedAt: string | null;
};
export const testimonials: Testimonial[] = [];
export const publishableTestimonials = () =>
  testimonials.filter((t) => t.verified && t.permission && (!t.materialConnection || t.disclosure));
