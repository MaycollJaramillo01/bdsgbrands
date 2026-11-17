import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { bySlug, money, products } from "@/lib/products";
import { canBuy, schemaAvailability } from "@/lib/availability";
import { ProductCard, ProductMedia, PriceLine, StatusBadge } from "@/components/Product";
import { AddButton } from "@/components/Cart";
import { Waitlist } from "@/components/Waitlist";
import { Crumbs } from "@/components/Crumbs";
import { membership, site } from "@/lib/site";

type P = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));
export const dynamicParams = false;

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = bySlug((await params).slug);
  if (!p) return {};
  return {
    title: p.seo.title,
    description: p.seo.description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: `${p.name} | BDSG`, description: p.seo.description, images: p.image ? [{ url: p.image.src, width: p.image.width, height: p.image.height, alt: p.image.alt }] : undefined },
  };
}

export default async function ProductPage({ params }: P) {
  const p = bySlug((await params).slug);
  if (!p) notFound();
  const related = bySlug(p.related)!;
  const avail = schemaAvailability(p.status);
  // No Offer for waitlist/coming-soon products, and never ratings or reviews we don't have.
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `BDSG ${p.name}`,
    description: p.longDescription,
    sku: p.id,
    brand: { "@type": "Brand", name: "BDSG" },
    image: p.image ? `${site.url}${p.image.src}` : undefined,
    url: `${site.url}/products/${p.slug}`,
    ...(avail && p.price != null ? { offers: { "@type": "Offer", price: p.price.toFixed(2), priceCurrency: "USD", availability: avail, url: `${site.url}/products/${p.slug}` } } : {}),
  };

  const faqs: [string, React.ReactNode][] = [
    ["When can I buy it?", canBuy(p) ? "Now. Add it to your bag." : p.status === "waitlist" ? `${p.name} is not on sale yet. Join the waitlist and we'll email you the day it launches. We haven't announced a date.` : `${p.name} is in development. Get notified and you'll hear first.`],
    ["What's the full ingredient list?", p.inci ?? "The full INCI list will be published here before launch. If you have an allergy question now, contact us."],
    ["What size is it?", p.size ?? "Size will be confirmed on this page before launch."],
    ["Do I need a membership?", <>No. Membership is optional. <Link key="g" className="inline" href="/greatness">See what it includes</Link>.</>],
  ];

  return (
    <div className="container">
      <Crumbs items={[["/shop", "Shop"], [`/products/${p.slug}`, p.name]]} />
      <div className="pdp">
        <div className="pdp-gallery">
          <div className="main"><ProductMedia p={p} sizes="(max-width: 1023px) 100vw, 55vw" priority /></div>
        </div>
        <div className="pdp-info">
          <p className="eyebrow">{p.number} · {p.role}</p>
          <h1 className="h1">{p.name}</h1>
          <p className="lead">{p.shortDescription}</p>
          <p className="h4">{p.headline}</p>
          <div className="cluster"><StatusBadge p={p} /></div>
          <PriceLine p={p} />
          <p>{p.longDescription}</p>
          <div>
            <p className="small" style={{ fontWeight: 600, marginBottom: 8 }}>Key ingredients</p>
            <div className="ing">{p.featuredIngredients.map((i) => <span className="chip" key={i}>{i}</span>)}</div>
          </div>
          {canBuy(p) ? (
            <AddButton slug={p.slug} />
          ) : (
            <div className="notice">
              <b>{p.status === "waitlist" ? "Not on sale yet" : "Coming soon"}</b>
              <p className="small">{p.status === "waitlist" ? `Be first when ${p.name} launches. One email, no newsletter.` : `We'll email you once when ${p.name} launches.`}</p>
              <Waitlist topic={p.slug} cta={p.status === "waitlist" ? "Join waitlist" : "Notify me"} source={`pdp-${p.slug}`} />
            </div>
          )}
          <p className="small muted">Shipping: free standard shipping from ${membership.standardShippingThreshold} per the <Link className="inline" href="/legal/terms">Terms of Sale</Link>. Returns: unopened products within 15 days. <Link className="inline" href="/legal/returns">Return Policy</Link></p>
        </div>
      </div>

      <section className="section facts" aria-labelledby="use-h">
        <h2 id="use-h" className="h2">How and when to use it</h2>
        <div className="acc" data-reveal style={{ marginTop: 32 }}>
          <details open><summary>When</summary><div className="acc-body"><p>{p.whenToUse}</p></div></details>
          <details><summary>Directions</summary><div className="acc-body"><p>{p.directions ?? "Directions will be published here with the final packaging."}</p></div></details>
          <details><summary>Warnings</summary><div className="acc-body"><p>{p.warnings ?? "Warnings will be published here exactly as printed on the final packaging."}</p></div></details>
        </div>
      </section>

      <section className="section facts" aria-labelledby="faq-h">
        <h2 id="faq-h" className="h2">Questions about {p.name}</h2>
        <div className="acc" data-reveal style={{ marginTop: 32 }}>
          {faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><div className="acc-body"><p>{a}</p></div></details>)}
        </div>
      </section>

      {p.price != null && p.memberPrice != null && (
        <section className="section" aria-labelledby="mem-h">
          <h2 id="mem-h" className="h2">With or without membership</h2>
          <div className="table-wrap" style={{ marginTop: 32, maxWidth: 880 }}>
            <table className="t">
              <thead><tr><th scope="col"></th><th scope="col">Standard</th><th scope="col">Greatness member</th></tr></thead>
              <tbody>
                <tr><th scope="row">{p.name} price</th><td className="num">{money(p.price)}</td><td className="num">{money(p.memberPrice)}</td></tr>
                <tr><th scope="row">Free standard shipping</th><td>From ${membership.standardShippingThreshold}</td><td>From ${membership.shippingThreshold} (eligible orders)</td></tr>
                <tr><th scope="row">Membership fee</th><td>None</td><td>${membership.initialPrice} first year, then ${membership.renewalPrice}/year, auto-renews</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="rel-h">
        <h2 id="rel-h" className="h2">Pairs with</h2>
        <div className="products" style={{ marginTop: 32 }}><ProductCard p={related} /></div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
