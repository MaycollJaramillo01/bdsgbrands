# BDSG storefront architecture

How the site is put together, for the engineers and reviewers who maintain it. The public site is in U.S. English.

## 1. Sitemap

| Route | Purpose | Indexed |
|---|---|---|
| `/` | Home: hero, the system, story, ingredients, Barrier feature, routine, Greatness preview, launch list | yes |
| `/shop` | All formulas with their real status | yes |
| `/products/[slug]` | barrier, renewal, calm, recovery (drafts are excluded) | yes |
| `/science` | Why goat milk, formula matrix, glossary, claims stance, ingredient FAQ | yes |
| `/greatness` | Optional membership, comparison, renewal disclosure | yes |
| `/about` | Brand story, who we build for, formulation approach, company | yes |
| `/faq` | Availability, Products, Ingredients, Orders, Shipping, Returns, Membership, Safety | yes |
| `/contact` | Contact form (8 topics, including safety and privacy) | yes |
| `/legal/returns` `terms` `privacy` `cookies` | Published policies | yes |
| `/legal/shipping`, `/legal/membership` | Drafts. A "not published yet" stub is shown and the draft text is never public | no |
| `/checkout/success` | Post-checkout | no |
| 404, 500 | "Wrong trail. The work continues." and a 500 page with a safe reference ID | no |
| `/api/waitlist`, `/api/contact`, `/api/checkout` | JSON endpoints | — |

## 2. Product state architecture (single source of truth)

`src/lib/products.ts` is the only place the catalog lives.

- **Statuses:** `draft | coming_soon | waitlist | available | sold_out | discontinued`.
- **Build-time check:** `validateCatalog()` runs as the module loads, so it runs during the build. The build fails if:
  - `purchaseEnabled` is true without `status === "available"` and a price, or
  - a member price is higher than retail.
- **One gate for buying:** `src/lib/availability.ts → canBuy(p)`. It requires all of:
  - `catalogLive` and `checkoutLive` (site settings),
  - `status === "available"`,
  - `purchaseEnabled`,
  - a price.
- **Everything else derives from that gate:**

| Derived value | Function |
|---|---|
| CTA label | `ctaLabel()` |
| Status chip | `statusLabel()` |
| schema.org `availability` | `schemaAvailability()`. `null` means no Offer is emitted |
| Cart contents | the client cart drops lines that fail `canBuy`, and `validateCart()` in `src/lib/commerce.ts` repeats the check on the server |

- **Stale caches:** pages are static. A status change is a code or env change, and therefore a new deploy. Vercel serves only the newest deployment on the production alias. Old deployment URLs sit behind Vercel Deployment Protection (SSO), which has been verified.
- **Guards:**
  - Unit tests run as `prebuild`, so a catalog regression blocks the deploy.
  - Playwright regression tests check that the rendered DOM and JSON-LD contain no "add to bag", "buy", "ready" or InStock.

## 3. Site settings

`src/lib/site.ts → settings` holds the site settings:

- `catalogLive`, `checkoutLive`, `membershipEnrollmentLive` and `showDraftPolicies`, all set by `NEXT_PUBLIC_*` env vars.
- The thresholds, currency, `supportEmail` and the privacy policy version.

Membership settings are in `membership` in the same file. `enrollmentOpen` is true only when the env switch is on **and** an approved terms effective date exists.

Changing any of these switches in Vercel triggers a rebuild. Nothing needs a find-and-replace in the source.

## 4. Commerce adapter

`src/lib/commerce.ts` defines `CommerceAdapter`. It currently has only `createCheckout`, because that is the only operation with a caller today.

`getAdapter()` returns:

- `none` unless `checkoutLive` is on. `none` answers "Checkout isn't open yet".
- `mock` in non-production builds only.

The real provider adapter will be added once BDSG confirms the provider; that is **BLOCKED BY BDSG**. No provider SDK is called from the browser. `/api/checkout` validates origin, content type, the rate limit and the cart before it calls the adapter.

## 5. SEO metadata and structured data

- **Per-route metadata:** each route has its own title, description and canonical (relative to `NEXT_PUBLIC_SITE_URL`, which defaults to https://bdsgbrands.com). Open Graph and Twitter data come from the layout and are overridden per product.
- **Robots:** `robots: noindex` and the `X-Robots-Tag` header apply unless `NEXT_PUBLIC_SITE_ENV=production`. `robots.txt` disallows everything on staging.
- **Sitemap:** `sitemap.xml` lists only public, non-draft pages.
- **JSON-LD:**

| Schema | Where | Notes |
|---|---|---|
| Organization + WebSite | Every page (layout) | |
| BreadcrumbList | Inner pages (`Crumbs`) | |
| Product | Product pages | Offer only from `schemaAvailability`. Never `aggregateRating` or `review` |
| FAQPage | `/faq` | Plain-string answers, identical to the visible text |

## 6. Accessibility

- **Structure:** a skip link, landmarks, one H1 per page and ordered headings. Every form field has a real label, and dynamic changes are announced through `aria-live`.
- **Forms:** errors are linked to their field with `aria-describedby`. Focus moves to the first invalid field or to the error summary.
- **Dialogs:** the bag and the mobile menu are native `<dialog>` elements, which trap focus, close on Escape and return focus to the opener.
- **Visual and touch:** focus is visible and sits below the header thanks to `scroll-padding`. Targets are at least 40px, and `prefers-reduced-motion` is honored.
- **Automated checks:** axe tests WCAG 2.2 AA tags on 8 routes at desktop and mobile widths, and a test checks for horizontal overflow at 360px.
- **Still needed:** a manual audit with a screen reader at 200% and 400% zoom. See `DEPLOY_CHECKLIST.md`.

## 7. Privacy and consent

- **No vendor configured, no banner.** No non-essential technology is installed unless `NEXT_PUBLIC_GA_ID` or `NEXT_PUBLIC_META_PIXEL_ID` is set. Without either, the consent banner and the "Cookie settings" link do not render, because there is nothing to consent to.
- **When a vendor is configured:**
  - The banner offers Accept, Reject and Manage, with equal weight.
  - It lists only the configured categories.
  - The choice is versioned and stored, and the banner can be reopened from the footer.
  - Withdrawing consent reloads the page.
- **Global Privacy Control:** the signal forces marketing off.
- **Analytics:** `track()` pushes to a provider-neutral `dataLayer` only after analytics consent. The allowed events are typed in `EVENTS`, and params never contain PII. `purchase` is never emitted without a provider-confirmed transaction.
- **Waitlist records** store the email, an optional first name, the formula, the source page, the consent timestamp, the consent version and the privacy policy version. A waitlist sign-up never subscribes the person to general marketing. UTM capture is deliberately skipped until a legal basis is confirmed.

## 8. Security

- **Headers** (`next.config.ts`): a CSP that allows only self plus the configured vendors, HSTS, nosniff, `frame-ancestors 'none'` and `X-Frame-Options: DENY`, a Referrer-Policy and a Permissions-Policy.
- **APIs:** each endpoint checks for same origin and a JSON content type (the CSRF guard), applies a rate limit, validates on the server and includes a honeypot field.
- **Secrets:** no secret keys reach the browser, since only the anonymous, insert-only InsForge key is public. InsForge applies row-level security with INSERT-only grants.
- **Errors:** responses never include stack traces, and no personal data is logged.

## 9. Redirect map (301)

| From | To |
|---|---|
| `/formulas/:slug` | `/products/:slug` |
| `/index.php` | `/` |
| `/products.php` | `/shop` |
| `/greatness-program.php` | `/greatness` |
| `/contact.php` | `/contact` |
| `/privacy-policy.php` | `/legal/privacy` |
| `/terms.php` | `/legal/terms` |
| `/cookie-policy.php` | `/legal/cookies` |
| `/returns.php` | `/legal/returns` |

## 10. Design system

The tokens live in `src/app/globals.css`, and the rules are in `design/guia-de-diseno.md` v2.

- **Tokens:**
  - **Color:** ink, stone, bone, milk and sage.
  - **Spacing:** a 4px scale.
  - **Radius:** sm, md, lg, xl and pill.
  - **Type scale:** display through small, using Archivo.
  - **Elevation and layering:** shadows and z-index levels.
  - **Motion:** durations and easing.
  - **Layout:** container 1360px, reading width 720px.
- **Grid:** 12, 8 and 4 columns.
- **Components:** Header, Bag, ProductCard, ProductMedia, StatusBadge, PriceLine, Waitlist, ContactForm, Consent, Crumbs, and accordions built on native `<details>`.
