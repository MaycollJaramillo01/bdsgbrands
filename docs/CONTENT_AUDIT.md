# Content audit

Sources checked 2026-11-17: bdsgbrands.com (home, `products.php`, `greatness-program.php`, `contact.php`, all four policies), the previous Vercel build, and the brand manual v3 (Novarius).

## Products

| Fact | bdsgbrands.com | Previous Vercel build | Used now |
|---|---|---|---|
| Availability | All four show "GET NOTIFIED" | Barrier and Calm had "Add to bag" | **waitlist** (Barrier, Calm) / **coming_soon** (Renewal, Recovery) |
| Barrier price | $33.00, members $29.70 | same | same; labeled "price at launch" |
| Calm price | $35.00, members $31.50 | same | same |
| Renewal / Recovery price | "Coming Soon" | same | not shown |
| Size | Not stated as text. Photos show 6 oz / 177 ml (Barrier, Calm) and **4 oz / 118 ml (Recovery)** | "6 oz" on every tube | **Not shown.** Conflict → BLOCKED |
| Calm "Science layer" | "Anti-inflammatory + recovery" | — | **Not used.** Unapproved claim |
| Product copy | Uses "clinically effective actives", "strengthen", "restore" | — | Rewritten as "support", "help"; no clinical wording |
| INCI, directions, warnings | Not published | — | Not shown; slots exist in the data model |

## Brand

| Item | Source | Used |
|---|---|---|
| BDSG = Be D' Summit Greatness | site, manual | yes |
| "Built for the Journey. Not the Title." | site | yes, institutional line |
| "Skincare that works as hard as you do." | brief | yes, hero |
| Four steps (Show up · Put in the work · Pursue greatness · Earn greatest) | site | Rewritten in the About values as Show up · Put in the work · Pursue greatness · Keep going (from the brief) |
| Founder story | none | omitted |
| Testimonials (Alex M., Jordan K., Sam R.) | site | **Removed.** Not verifiable |
| Apparel / For Him / For Her | site, "soon" | Mentioned only on About as future; no pages |

## Policies

| Policy | Status |
|---|---|
| Privacy, Terms, Returns, Cookies | Published by BDSG, effective Aug 21, 2026. Shown verbatim. |
| Shipping | Not published by BDSG. **Draft**: noindex, labeled "not yet in effect". |
| Membership terms | Assembled from Returns §6 and the program page. **Draft**: the Partner Agreement is missing. |

## Contact

`contact@bdsgbrands.com` is marked on bdsgbrands.com itself as a placeholder. It is not hard-coded as final: it comes from `NEXT_PUBLIC_CONTACT_EMAIL` and is hidden when empty.

## Social links (from bdsgbrands.com)

Instagram `bdsg.official` · TikTok `@bdsg.official` · Facebook `profile.php?id=61586803785256` · X `BDSGofficial1` · LinkedIn `company/bdsg-brands`.
