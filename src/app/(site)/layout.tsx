import Link from "next/link";
import { CartProvider } from "@/components/Cart";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import { Consent, ConsentLink } from "@/components/Consent";
import { site } from "@/lib/site";
import { publicProducts } from "@/lib/products";

const orgLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${site.url}/#org`, name: site.entity, alternateName: [site.name, site.longName], url: site.url, logo: `${site.url}/brand/bdsg-apilado-negro.svg`, sameAs: site.social.map((s) => s.href) },
    { "@type": "WebSite", "@id": `${site.url}/#site`, name: site.name, url: site.url, inLanguage: "en-US", publisher: { "@id": `${site.url}/#org` } },
  ],
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <CartProvider>
        <Header />
        <main id="main">{children}</main>
        <footer className="footer dark">
          <div className="container">
            <div className="footer-top">
              <div className="footer-brand stack">
                <img src="/brand/bdsg-horizontal-blanco.svg" alt="BDSG" width={150} height={44} />
                <p className="small" style={{ maxWidth: "34ch", color: "var(--bone-100)" }}>{site.institutional} Performance skincare on a goat milk base, from West Jordan, Utah.</p>
              </div>
              <nav aria-labelledby="f-shop"><h2 id="f-shop">Shop</h2><ul>
                <li><Link href="/shop">All formulas</Link></li>
                {publicProducts.map((p) => <li key={p.slug}><Link href={`/products/${p.slug}`}>{p.name}</Link></li>)}
              </ul></nav>
              <nav aria-labelledby="f-learn"><h2 id="f-learn">Learn</h2><ul>
                <li><Link href="/science">Science</Link></li>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/greatness">Greatness Program</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul></nav>
              <nav aria-labelledby="f-help"><h2 id="f-help">Help</h2><ul>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/legal/shipping">Shipping</Link></li>
                <li><Link href="/legal/returns">Returns &amp; refunds</Link></li>
                <li><Link href="/legal/membership">Membership terms</Link></li>
              </ul></nav>
              <nav aria-labelledby="f-follow"><h2 id="f-follow">Follow</h2><ul>
                {site.social.map((s) => <li key={s.href}><a href={s.href} rel="noopener" target="_blank">{s.label}<span className="sr-only"> (opens in a new tab)</span></a></li>)}
              </ul></nav>
            </div>
            <div className="footer-bottom">
              <span>© 2026 {site.entity}</span>
              <span className="cluster" style={{ gap: "4px 20px" }}>
                <Link href="/legal/terms">Terms of Sale</Link>
                <Link href="/legal/privacy">Privacy</Link>
                <Link href="/legal/cookies">Cookies</Link>
                <ConsentLink />
              </span>
              <span>Cosmetic products. Not intended to diagnose, treat, cure, or prevent any disease.</span>
            </div>
          </div>
        </footer>
      </CartProvider>
      <Consent />
      <Reveal />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
    </>
  );
}
