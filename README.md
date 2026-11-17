# BDSG Store

The BDSG storefront, built with Next.js 15 (App Router), InsForge (database) and Stripe (through InsForge Payments, which is not yet enabled). The site is in U.S. English.

## Develop

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

## Test

```bash
npm test          # Vitest unit tests: availability, pricing, validation, compliance
npm run build
npm run e2e       # Playwright against `next start` on :3011, using the installed Chrome
```

## Deploy

The Vercel project is `bdsgbrands` and is connected to Git. A push to `main` deploys to https://bdsgbrands.vercel.app.

That deployment is staging: without `NEXT_PUBLIC_SITE_ENV=production` it is noindexed (robots.txt, meta robots and an `X-Robots-Tag` header).

Before pointing bdsgbrands.com at it:

1. Set `NEXT_PUBLIC_SITE_ENV=production` and `NEXT_PUBLIC_SITE_URL=https://bdsgbrands.com` in Vercel.
2. Close the items in `docs/BLOCKERS.md`.
3. Change DNS. This only happens with BDSG's explicit approval.

Database changes live in `migrations/` and are applied with `npx @insforge/cli db migrations up --all`. Migrations are additive only.

## Rollback

In Vercel, open Deployments, pick the last good deployment and choose **Promote to Production**, or run `npx vercel rollback`.

Code: `git revert <sha> && git push`.

Migrations are not rolled back automatically. Write a new forward migration instead.

## Where things live

| What | Where |
|---|---|
| Product data and status | `src/lib/products.ts`. Status drives every CTA through `src/lib/availability.ts` |
| Membership prices and site config | `src/lib/site.ts` |
| Claims, testimonials, regulatory data | `src/lib/compliance.ts`. Empty until approved, and nothing renders from it until then |
| Waitlist and contact APIs | `src/app/api/*`. Validation lives in `src/lib/validation.ts` |
| Consent and analytics | `src/components/Consent.tsx`, `src/lib/analytics.ts` |
| Legal texts | `src/content/legal.ts`. Drafts are noindex and labeled as not in effect |
| Design tokens | `src/app/globals.css`, documented in `design/guia-de-diseno.md` |
| Launch blockers | `docs/BLOCKERS.md` |
