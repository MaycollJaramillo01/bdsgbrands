# Tech audit · BDSG web

Audited 2026-11-17 from the repo (`web/`), `package.json`, the InsForge backend and the Vercel project.

| Area | Finding (evidence) | Decision |
|---|---|---|
| Framework | Next.js **15.5.29**, App Router (`src/app/`), React 19.1 (`package.json`) | Keep. Healthy, no reason to migrate. |
| Language | TypeScript 5, strict (`tsconfig.json`) | Keep. |
| Package manager | npm (`package-lock.json`) | Keep. |
| Styling | One global stylesheet, CSS custom properties (`src/app/globals.css`). No Tailwind. | Keep approach; replace tokens with the new palette. |
| CMS | None. Content lives in typed TS/JSON (`src/lib/products.ts`, `src/content/legal.*`). | No CMS. Four products don't justify one. Centralized typed data instead. |
| Ecommerce | Client cart in `localStorage` (`Cart.tsx`) + InsForge Payments checkout code. Payments are **not enabled** on the backend (`payments status`: "not available"). | Keep the cart code, but gate it on `status === "in_stock"`. Commerce stays off (Phase 5). |
| Backend / DB | InsForge project `bdsg-store` (us-west), Postgres. Tables: `orders`, `waitlist` (migration `migrations/20261117223845_store.sql`). RLS: anonymous INSERT only. | Keep. Extend `waitlist`, add `contact_messages` through new migrations. No data deleted. |
| Auth | None. | `/account` not built (no valid auth exists). |
| Payments | InsForge Payments (Stripe), not enabled. | BLOCKED. See BLOCKERS.md. |
| Email | None configured. | Contact messages are stored with an ID; delivery to an inbox is BLOCKED until the official address is confirmed. |
| Analytics | None installed. | Consent-gated loader; activates only when IDs are set in env. |
| Env vars | `NEXT_PUBLIC_INSFORGE_URL`, `NEXT_PUBLIC_INSFORGE_ANON_KEY` (`.env.local`, Vercel prod and dev). | Add server-only and analytics vars to `.env.example` (empty). |
| Deploy | Vercel project `bdsgbrands` (personal team), Git-connected to `MaycollJaramillo01/bdsgbrands`, `main` → production alias `bdsgbrands.vercel.app`. | Keep. Treat it as **staging**: noindex unless `NEXT_PUBLIC_SITE_ENV=production`. |
| Images | Plain `<img>` from `/public/img` (JPG, 800×1200 and 512×288). No `next/image`. | Move to `next/image` for AVIF/WebP and responsive sizes. |
| Fonts | Archivo variable, self-hosted (`/public/fonts`), OFL. | Keep. The owner chose Archivo over the brief's fonts. |
| Tests | None. | Add Vitest (unit) and Playwright (E2E, system Chrome). |
| CI/CD | Vercel Git integration only. | Keep. |
