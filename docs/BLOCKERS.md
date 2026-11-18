# Launch blockers. These need BDSG confirmation.

Nothing below has been invented. Each item has a typed placeholder in the code, so it can be filled in without a redesign.

## Discrepancies between bdsgbrands.com and this site

These are not resolved arbitrarily. Each one is held off by a switch until BDSG decides.

- [ ] **Greatness enrollment:** bdsgbrands.com shows "Create Account & Join"; this site says enrollment isn't open. → `NEXT_PUBLIC_MEMBERSHIP_ENROLLMENT_LIVE` (default off) plus `membership.effectiveDate` (null). Enrollment cannot open until both are set.
- [ ] **Testimonials:** bdsgbrands.com shows testimonials; none were migrated. → `testimonials` in `src/lib/compliance.ts`, which needs a source record, permission and disclosure for each one.
- [ ] **Contact email:** bdsgbrands.com lists contact@bdsgbrands.com as "address to be confirmed". → `NEXT_PUBLIC_CONTACT_EMAIL` (hidden while empty).
- [ ] **Canonical property:** which domain is the real store? → `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_SITE_ENV`.

## Product and commerce

- [ ] Are Barrier units actually available for sale? → `status` in `src/lib/products.ts`
- [ ] Are Calm units actually available for sale?
- [ ] Confirmed launch date
- [ ] Are $33.00 / $35.00 the final retail prices?
- [ ] Are $29.70 / $31.50 the final member prices?
- [ ] Product size: photos show 6 oz / 177 ml (Barrier, Calm) and 4 oz / 118 ml (Recovery) → `size: null`
- [ ] Full INCI for each formula → `inci: null`
- [ ] Directions for each formula → `directions: null`
- [ ] Warnings (packaging-approved wording) → `warnings: null`
- [ ] Manufacturer / Responsible Person data → `regulatory` in `src/lib/compliance.ts`
- [ ] Claims substantiation (current copy avoids every clinical claim) → `claims` in `src/lib/compliance.ts`
- [ ] Commerce provider confirmed → adapter in `src/lib/commerce.ts`; `NEXT_PUBLIC_CHECKOUT_LIVE` stays off until then
- [ ] Tax solution (e.g. Stripe Tax)
- [ ] Fulfillment provider

## Shipping

- [ ] Destinations: all 50 states or contiguous 48; APO/FPO; PR and territories; PO boxes
- [ ] Carrier(s)
- [ ] Processing time
- [ ] Shipping rate below the $70 threshold
- [ ] Expedited option

**Until these are answered, `/legal/shipping` stays a noindex draft** and the site does not promise free shipping in any banner.

## Membership

- [ ] Greatness Program & Partner Agreement (full text)
- [ ] Referral reward rules
- [ ] Auth/account requirements for members
- [ ] Existing customer/member records to migrate (bdsgbrands.com has a sign-up form)

## Operations

- [ ] Official contact email → `NEXT_PUBLIC_CONTACT_EMAIL`
- [ ] Contact delivery destination (inbox, helpdesk or CRM). Messages are currently **stored** in InsForge `contact_messages` with an ID and are not emailed.
- [ ] Product-safety contact / adverse-event owner
- [ ] Email/CRM provider for waitlist launch emails

## Legal and content

- [ ] Final approved Shipping Policy and Membership Terms (effective dates)
- [ ] Testimonial verification. The testimonial module is **not built**.
- [ ] Image rights for the photos taken from bdsgbrands.com
- [ ] Renewal product photography (currently a drawn tube)

## Tracking

- [ ] GA4 Measurement ID → `NEXT_PUBLIC_GA_ID`
- [ ] Meta Pixel ID → `NEXT_PUBLIC_META_PIXEL_ID`
- [ ] Meta CAPI token (server-only) → `META_CAPI_TOKEN`

## Domain

- [ ] Does bdsgbrands.com move to this app? DNS has not been touched. Until then, Vercel is staging and is noindexed.
