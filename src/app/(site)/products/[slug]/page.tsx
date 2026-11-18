import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { bySlug, money, publicProducts } from "@/lib/products";
import { canBuy, schemaAvailability } from "@/lib/availability";
import { ProductMedia } from "@/components/Product";
import { AddButton } from "@/components/Cart";
import { Waitlist } from "@/components/Waitlist";
import { Crumbs } from "@/components/Crumbs";
import { TrackView } from "@/components/TrackView";
import { membership, settings, site } from "@/lib/site";

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
    [`What is in ${p.name}?`, <>Featured ingredients: {p.featuredIngredients.join(", ")}. {p.inci ? "The full list is on the label above." : PENDING.inci}</>],
    [`How big is the tube?`, p.size ?? PENDING.size],
    ["Do I need a membership to buy?", <>No. The Greatness Program is optional. <Link key="g" className="inline" href="/greatness">See what it includes</Link>.</>],
    ["What if I have a reaction?", <>Stop using the product and seek medical help if needed. Then <Link key="c" className="inline" href="/contact">tell us</Link> using the &quot;Skin reaction or product safety&quot; topic.</>],
    ["Can I return it?", <>Unopened products can be returned within 15 days. <Link key="r" className="inline" href="/legal/returns">Return Policy</Link>.</>],
  ];
  const climb = [...publicProducts].sort((x, y) => x.sequence.localeCompare(y.sequence));
  const step = climb.findIndex((x) => x.slug === p.slug) + 1;
  const label: [string, string][] = [["Directions", p.directions ?? PENDING.directions], ["Warnings", p.warnings ?? PENDING.warnings], ["Ingredients (INCI)", p.inci ?? PENDING.inci], ["Size", p.size ?? PENDING.size]];
  const notify = !canBuy(p) && p.waitlistEnabled && p.status !== "discontinued";

  return (
    <div className="pd">
      <TrackView event="view_product" params={{ item_id: p.slug }} />
      <div className="sr-only"><Crumbs items={[["/shop", "Shop"], [`/products/${p.slug}`, p.name]]} /></div>

      <div className="pd-mosaic">
        <div className="pd-m-product"><ProductMedia p={p} sizes="(max-width: 767px) 66vw, 34vw" priority /></div>
        <img className="pd-m-photo pd-m-wide" src="/img/montana.jpg" alt="Mountain ridge above the tree line" width={512} height={288} />
        <span className="pd-m-tile pd-m-plum" aria-hidden="true" />
        <img className="pd-m-photo" src="/img/gimnasio.jpg" alt="Athlete training in a gym" width={512} height={288} />
        <span className="pd-m-tile pd-m-haze" aria-hidden="true" />
        <img className="pd-m-photo" src="/img/natacion.jpg" alt="Swimmer in a pool lane" width={512} height={288} />
        <span className="pd-m-tile pd-m-orchid" aria-hidden="true" />
      </div>

      <section className="pd-head" aria-labelledby="pd-title">
        <p className="pd-stand">{p.role}. Formula {step} of {climb.length} in the BDSG routine, made on a goat milk base.</p>
        <div className="pd-axis">
          <h1 id="pd-title" className="pd-title"><span><span>{p.name}</span></span></h1>
          <p className="pd-sub">{p.shortDescription}</p>
          <div className="pd-buy">
            <div className="pd-price">
              {settings.catalogLive && p.retailPrice != null ? <><b>{money(p.retailPrice)}</b>{p.memberPrice != null && <span>{money(p.memberPrice)} for Greatness members</span>}</> : <span className="pd-tbd">Price announced at launch</span>}
            </div>
            <p className="pd-disc">{disclosure(p)}</p>
            {canBuy(p) ? <AddButton slug={p.slug} /> : notify ? (
              <div id="notify" className="pd-form">
                <Waitlist topic={p.slug} cta={p.status === "waitlist" ? "Join waitlist" : p.status === "sold_out" ? "Notify me when back" : "Notify me"} source={`pdp-${p.slug}`} />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="pd-fields" aria-label={`About ${p.name}`}>
        <div className="pd-field pd-plum" data-reveal><h2 className="pd-phrase">{p.headline}</h2><p>{p.longDescription}</p></div>
        <div className="pd-field pd-haze pd-mirror" data-reveal><h2 className="pd-phrase">When to use it</h2><p>{p.whenToUse}</p></div>
        <div className="pd-field pd-orchid" data-reveal><h2 className="pd-phrase">What carries it</h2><ul role="list">{p.featuredIngredients.map((i) => <li key={i}>{i}</li>)}</ul></div>
      </section>

      <section className="pd-label pd-wrap" aria-labelledby="label-h">
        <h2 id="label-h" className="pd-h2" data-reveal><span>From the tube.</span></h2>
        <dl className="pd-bands" data-reveal>{label.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      </section>

      {p.retailPrice != null && p.memberPrice != null && (
        <section className="pd-plans pd-wrap" aria-labelledby="mem-h">
          <h2 id="mem-h" className="pd-h2">With or without membership</h2>
          <div className="pd-steps" data-reveal>
            <div className="pd-plan pd-haze">
              <h3>Standard</h3><b>{money(p.retailPrice)}</b>
              <ul role="list"><li>No membership fee</li><li>Free standard shipping from {money(membership.standardShippingThreshold)}</li></ul>
              {notify ? <a className="pd-strip" href="#notify">Join the {p.name} waitlist</a> : <Link className="pd-strip" href="/shop">Shop all formulas</Link>}
            </div>
            <div className="pd-plan pd-plum">
              <h3>Greatness member</h3><b>{money(p.memberPrice)}</b>
              <ul role="list"><li>${membership.initialPrice} first year, then ${membership.renewalPrice}/year, renews automatically</li><li>Free standard shipping from {money(membership.shippingThreshold)} on eligible orders</li><li>Member pricing on every formula</li></ul>
              <Link className="pd-strip" href="/greatness">See the Greatness Program</Link>
            </div>
          </div>
        </section>
      )}

      <section className="pd-faq pd-wrap" aria-labelledby="faq-h">
        <h2 id="faq-h" className="pd-h2">Questions about {p.name}</h2>
        <div className="pd-tiles" data-reveal>
          {faqs.map(([q, a]) => <details key={q} name="pd-faq"><summary>{q}</summary><p>{a}</p></details>)}
        </div>
      </section>

      <section className="pd-climb pd-wrap" aria-labelledby="climb-h">
        <h2 id="climb-h" className="pd-h2">Four formulas, one climb.</h2>
        <ol className="pd-stairs">
          {climb.map((x, i) => (
            <li key={x.slug} style={{ ["--h" as string]: `${45 + i * 18}%` }}>
              <Link href={`/products/${x.slug}`} aria-current={x.slug === p.slug ? "page" : undefined}>
                <b>{x.name}</b><span>{x.role}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
