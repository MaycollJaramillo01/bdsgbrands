import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { bySlug, money, publicProducts } from "@/lib/products";
import { canBuy, schemaAvailability } from "@/lib/availability";
import { ProductCard, ProductMedia, PriceLine, StatusBadge } from "@/components/Product";
import { AddButton } from "@/components/Cart";
import { Waitlist } from "@/components/Waitlist";
import { Crumbs } from "@/components/Crumbs";
import { TrackView } from "@/components/TrackView";
import { membership, site } from "@/lib/site";

type P = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => publicProducts.map((p) => ({ slug: p.slug }));
export const dynamicParams = false;

// Neutral pre-launch copy. Never invent the missing value.
const PENDING = {
  inci: "Full ingredient list will be published before launch.",
  size: "Size will be confirmed before launch.",
  directions: "Directions will be published with final packaging.",
  warnings: "Warnings will be published exactly as shown on final packaging.",
};

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = bySlug((await params).slug);
  if (!p || p.status === "draft") return {};
  const img = p.images[0];
  return {
    title: p.seoTitle,
    description: p.seoDescription,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: `${p.name} | BDSG`, description: p.seoDescription, url: `/products/${p.slug}`, images: img ? [{ url: img.src, width: img.width, height: img.height, alt: p.imageAlt }] : undefined },
    twitter: { card: "summary_large_image", title: `${p.name} | BDSG`, description: p.seoDescription },
  };
}

function disclosure(p: NonNullable<ReturnType<typeof bySlug>>) {
  if (canBuy(p)) return "Available now. Ships after your order is confirmed.";
  switch (p.status) {
    case "waitlist": return `${p.name} isn't on sale yet and no launch date has been announced. The price shown is the launch price.`;
    case "coming_soon": return `${p.name} is in development. Price and launch date will be announced.`;
    case "sold_out": return `${p.name} is sold out. Get notified when it's back.`;
    case "discontinued": return `${p.name} has been discontinued.`;
    default: return "Checkout isn't open yet.";
  }
}

export default async function ProductPage({ params }: P) {
  const p = bySlug((await params).slug);
  if (!p || p.status === "draft") notFound();
  const related = p.relatedProducts.map((s) => bySlug(s)!).filter((r) => r.status !== "draft");
  const avail = schemaAvailability(p);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `BDSG ${p.name}`,
    description: p.longDescription,
    sku: p.id,
    brand: { "@type": "Brand", name: "BDSG" },
    image: p.images.map((i) => `${site.url}${i.src}`),
    url: `${site.url}/products/${p.slug}`,
    // Offer only when status says it's purchasable/out of stock/discontinued. Never ratings we don't have.
    ...(avail && p.retailPrice != null ? { offers: { "@type": "Offer", price: p.retailPrice.toFixed(2), priceCurrency: p.currency, availability: avail, url: `${site.url}/products/${p.slug}` } } : {}),
  };

  const faqs: [string, React.ReactNode][] = [
    [`When does ${p.name} launch?`, canBuy(p) ? "It's available now." : "No launch date has been announced. Join the list on this page and we'll email you when it launches."],
    [`What is in ${p.name}?`, <>Featured ingredients: {p.featuredIngredients.join(", ")}. {p.inci ? "The full list is above." : PENDING.inci}</>],
    ["Do I need a membership to buy?", <>No. The Greatness Program is optional. <Link key="g" className="inline" href="/greatness">See what it includes</Link>.</>],
    ["What if I have a reaction?", <>Stop using the product and seek medical help if needed. Then <Link key="c" className="inline" href="/contact">tell us</Link> using the &quot;Skin reaction or product safety&quot; topic.</>],
  ];

  return (
    <div className="container">
      <TrackView event="view_product" params={{ item_id: p.slug }} />
      <Crumbs items={[["/shop", "Shop"], [`/products/${p.slug}`, p.name]]} />
      <div className="pdp">
        <div className="pdp-gallery">
          <div className="main"><ProductMedia p={p} sizes="(max-width: 1023px) 100vw, 55vw" priority /></div>
        </div>
        <div className="pdp-info">
          <p className="eyebrow">{p.sequence} · {p.role}</p>
          <h1 className="h1">{p.name}</h1>
          <p className="lead">{p.shortDescription}</p>
          <div className="cluster"><StatusBadge p={p} /></div>
          <PriceLine p={p} />
          <p>{disclosure(p)}</p>
          {canBuy(p) ? (
            <AddButton slug={p.slug} />
          ) : p.waitlistEnabled && p.status !== "discontinued" ? (
            <div className="notice" id="notify">
              <b>{p.status === "waitlist" ? `Join the ${p.name} waitlist` : "Get notified"}</b>
              <Waitlist topic={p.slug} cta={p.status === "waitlist" ? "Join waitlist" : p.status === "sold_out" ? "Notify me when back" : "Notify me"} source={`pdp-${p.slug}`} />
            </div>
          ) : null}
          <div>
            <p className="small" style={{ fontWeight: 600, marginBottom: 8 }}>Featured ingredients</p>
            <ul className="ing" role="list">{p.featuredIngredients.map((i) => <li className="chip" key={i}>{i}</li>)}</ul>
          </div>
          <p className="muted">Shipping: free standard shipping on qualifying orders from {money(membership.standardShippingThreshold)}. Returns: unopened products within 15 days. <Link className="inline" href="/legal/returns">Return Policy</Link></p>
        </div>
      </div>

      <section className="section facts" aria-labelledby="about-h">
        <h2 id="about-h" className="h2">{p.headline}</h2>
        <p className="lead" style={{ marginTop: 16, maxWidth: "60ch" }}>{p.longDescription}</p>
        <div className="acc" data-reveal style={{ marginTop: 32 }}>
          <details open><summary>How and when to use it</summary><div className="acc-body"><p>{p.whenToUse}</p></div></details>
          <details><summary>Directions</summary><div className="acc-body"><p>{p.directions ?? PENDING.directions}</p></div></details>
          <details><summary>Warnings</summary><div className="acc-body"><p>{p.warnings ?? PENDING.warnings}</p></div></details>
          <details><summary>Full ingredients (INCI)</summary><div className="acc-body"><p>{p.inci ?? PENDING.inci}</p></div></details>
          <details><summary>Size</summary><div className="acc-body"><p>{p.size ?? PENDING.size}</p></div></details>
        </div>
      </section>

      {p.retailPrice != null && p.memberPrice != null && (
        <section className="section" aria-labelledby="mem-h">
          <h2 id="mem-h" className="h2">With or without membership</h2>
          <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="mem-h" style={{ marginTop: 32, maxWidth: 880 }}>
            <table className="t">
              <thead><tr><th scope="col"><span className="sr-only">Item</span></th><th scope="col">Standard</th><th scope="col">Greatness member</th></tr></thead>
              <tbody>
                <tr><th scope="row">{p.name} {canBuy(p) ? "price" : "launch price"}</th><td className="num">{money(p.retailPrice)}</td><td className="num">{money(p.memberPrice)}</td></tr>
                <tr><th scope="row">Free standard shipping</th><td>From {money(membership.standardShippingThreshold)}</td><td>From {money(membership.shippingThreshold)} on eligible orders</td></tr>
                <tr><th scope="row">Membership fee</th><td>None</td><td>${membership.initialPrice} first year, then ${membership.renewalPrice}/year, renews automatically</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="section facts" aria-labelledby="faq-h">
        <h2 id="faq-h" className="h2">Questions about {p.name}</h2>
        <div className="acc" data-reveal style={{ marginTop: 32 }}>
          {faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><div className="acc-body"><p>{a}</p></div></details>)}
        </div>
      </section>

      {related.length > 0 && (
        <section className="section" aria-labelledby="rel-h">
          <h2 id="rel-h" className="h2">Related formulas</h2>
          <div className="products" style={{ marginTop: 32 }}>{related.map((r) => <ProductCard key={r.slug} p={r} />)}</div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
