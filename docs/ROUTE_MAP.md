# Route map

| Current route | New route | Status | Redirect |
|---|---|---|---|
| `/` | `/` | Rebuilt | — |
| `/formulas/barrier` | `/products/barrier` | Moved | 301 |
| `/formulas/renewal` | `/products/renewal` | Moved | 301 |
| `/formulas/calm` | `/products/calm` | Moved | 301 |
| `/formulas/recovery` | `/products/recovery` | Moved | 301 |
| `/legal/privacy` | `/legal/privacy` | Kept | — |
| `/legal/terms` | `/legal/terms` | Kept | — |
| `/legal/returns` | `/legal/returns` | Kept | — |
| `/legal/cookies` | `/legal/cookies` | Kept | — |
| `/legal/shipping` | `/legal/shipping` | Kept. Draft, noindex, marked not in effect. | — |
| `/legal/membership` | `/legal/membership` | Kept. Draft, noindex, marked not in effect. | — |
| `/checkout/success` | `/checkout/success` | Kept. noindex; only reachable after payment. | — |
| — | `/shop`, `/science`, `/about`, `/greatness`, `/faq`, `/contact` | New | — |

## Official site → new site (for when bdsgbrands.com points here)

| bdsgbrands.com | New | Redirect |
|---|---|---|
| `/index.php` | `/` | 301 |
| `/products.php` | `/shop` | 301 |
| `/greatness-program.php` | `/greatness` | 301 |
| `/contact.php` | `/contact` | 301 |
| `/privacy-policy.php` | `/legal/privacy` | 301 |
| `/terms.php` | `/legal/terms` | 301 |
| `/cookie-policy.php` | `/legal/cookies` | 301 |
| `/returns.php` | `/legal/returns` | 301 |

All of these redirects are already declared in `next.config.ts`. They only take effect once the domain serves this app. DNS was not changed.

## Not built, and why

- `/account`: there is no auth system and no existing member records.
- `/cart`: the bag is a drawer, and it is hidden while no product is `in_stock`.
- `/checkout`: payments are blocked. Checkout will be hosted by Stripe through InsForge.
- `/journal`: there is no content strategy.
- `/waitlist`: every product page already has its own waitlist.
- Search: with four products it would only be decorative.
