# Launch blockers. These need BDSG confirmation.

Nothing below has been invented. Each item has a typed placeholder in the code, so it can be filled in without a redesign.

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
- [ ] Payment provider enabled (InsForge Payments access requested)
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
