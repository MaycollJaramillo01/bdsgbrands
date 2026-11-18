# Pre-launch checklist

The site is **not production-ready** until every box is checked. Items marked **BDSG** need data or approval from BDSG. Items marked **eng** are engineering work.

## Already verified

- [x] Single catalog source with build-time validation (`validateCatalog`) and unit tests run as `prebuild`
- [x] No "Add to bag" or InStock for waitlist or coming-soon products (unit and E2E regression tests)
- [x] Cart is rejected on the server for unavailable SKUs (`/api/checkout` returns 409)
- [x] Draft policies are never rendered publicly, and the build fails if draft text is enabled on production
- [x] Waitlist and contact store real records with server validation, a honeypot, a rate limit and a CSRF guard
- [x] 301 redirects for legacy URLs
- [x] Staging is noindexed; `robots.txt` and `sitemap.xml` are generated
- [x] Old Vercel deployment URLs are protected (SSO)
- [x] axe WCAG 2.2 AA passes on 8 routes at desktop and mobile widths; no horizontal overflow at 360px
- [x] Lighthouse mobile in local testing: Performance 97–99, Accessibility 100, Best Practices 100. SEO scores below target only because staging is noindexed.

## Blocked

- [ ] **BDSG:** catalog status confirmed for each SKU
- [ ] **BDSG:** support email confirmed. Set `NEXT_PUBLIC_CONTACT_EMAIL`, then set up contact delivery (inbox or helpdesk) and an SLA.
- [ ] **BDSG:** Shipping Policy approved (destinations, APO/FPO, PO boxes, territories, rate under $70, processing days, carrier, transit times, expedited option, lost-package process)
- [ ] **BDSG:** Membership Terms approved, or enrollment kept off
- [ ] **BDSG:** Returns Policy confirmed as current (15 days, unopened products)
- [ ] **BDSG:** INCI, directions, warnings and size for every product that will be sold
- [ ] **BDSG:** final packaging images (Renewal has none; image rights still need confirming)
- [ ] **BDSG:** commerce provider confirmed. **eng:** adapter, tax and shipping configuration
- [ ] **BDSG:** enrollment state on bdsgbrands.com aligned with this site (see BLOCKERS)
- [ ] **eng:** consent behavior verified once a GA or Meta ID is supplied
- [ ] **eng:** manual accessibility audit (NVDA/VoiceOver, 200% and 400% zoom)
- [ ] **eng:** mobile QA on real devices at 360, 390, 430 and 768px
- [ ] **eng:** Lighthouse CI against the production URL
- [ ] **eng:** schema checked in the Rich Results Test on the production domain
- [ ] **eng:** canonical domain validated after the DNS change
- [ ] **BDSG:** no testimonial published unless it is verified

## Switching to production

1. In Vercel, set `NEXT_PUBLIC_SITE_ENV=production` and `NEXT_PUBLIC_SITE_URL=https://bdsgbrands.com`.
2. When approved, set `NEXT_PUBLIC_CHECKOUT_LIVE` and `NEXT_PUBLIC_MEMBERSHIP_ENROLLMENT_LIVE`.
3. Redeploy. The unit tests run first and block the build on any violation.
4. Change DNS, with BDSG's explicit approval only.
