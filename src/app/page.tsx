import Link from "next/link";
import Image from "next/image";
import { bySlug, money, products, shopOrder } from "@/lib/products";
import { ProductCard, PriceLine, StatusBadge } from "@/components/Product";
import { Waitlist } from "@/components/Waitlist";
import { AddButton } from "@/components/Cart";
import { anyPurchasable, canBuy, ctaLabel } from "@/lib/availability";
import { membership, site } from "@/lib/site";

export const metadata = { alternates: { canonical: "/" } };

const ingredients = [
  { name: "Goat milk", body: "The base of all four formulas. Naturally rich in fats and proteins that leave skin feeling soft and comfortable.", in: ["barrier", "renewal", "calm", "recovery"] },
  { name: "Ceramide NP", body: "A lipid found in skin's outer layer, used to support moisture retention.", in: ["barrier"] },
  { name: "Panthenol", body: "Provitamin B5, a humectant that helps skin hold water.", in: ["barrier", "calm"] },
  { name: "Hyaluronic acid", body: "A humectant that draws water into the surface of the skin.", in: ["barrier"] },
  { name: "Niacinamide", body: "Vitamin B3, used to support an even-looking, smooth surface.", in: ["renewal"] },
  { name: "Magnesium PCA", body: "A mineral salt that pairs with menthol and ginger for a cool, comfortable finish.", in: ["recovery"] },
] as const;

const routine = [
  { img: "/img/gimnasio.jpg", alt: "Athlete training with weights in a gym", when: "After training", what: "Shower, then Recovery for a cool finish.", slug: "recovery" },
  { img: "/img/natacion.jpg", alt: "Swimmer in a pool lane", when: "After the pool", what: "Chlorine and repeated rinsing: Barrier, daily.", slug: "barrier" },
  { img: "/img/montana.jpg", alt: "Hiker on a mountain ridge", when: "After sun, wind or cold", what: "When skin feels tight: Calm.", slug: "calm" },
  { img: "/img/pareja.jpg", alt: "Two people walking outdoors together", when: "Between hard weeks", what: "A surface reset: Renewal.", slug: "renewal" },
] as const;

export default function Home() {
  const barrier = bySlug("barrier")!;
  const ordered = shopOrder.map((s) => bySlug(s)!);
  return (
    <>
      {/* A. Hero */}
      <section className="hero dark" aria-labelledby="hero-h">
        <div className="container hero-in grid">
          <div className="hero-copy" data-reveal>
            <p className="eyebrow">Performance skincare</p>
            <h1 id="hero-h" className="display" style={{ marginTop: 20 }}>{site.promise}</h1>
            <p className="lead">Four goat milk-based formulas for skin that trains, sweats, travels and keeps going. Barrier and Calm are first. Join the waitlist and hear the day they launch.</p>
            <div className="cluster hero-ctas">
              <Link className="btn btn-primary" href="/products/barrier">{ctaLabel(barrier)}</Link>
              <Link className="btn btn-secondary" href="/shop">See all four formulas</Link>
            </div>
          </div>
          <figure className="hero-pic">
            <Image src={barrier.image!.src} alt={barrier.image!.alt} width={800} height={1200} priority sizes="(max-width: 1023px) 100vw, 36vw" />
            <figcaption className="small">01 · Barrier. {barrier.price != null && !canBuy(barrier) ? `${money(barrier.price)} at launch.` : ""}</figcaption>
          </figure>
        </div>
      </section>

      {/* B. Four formulas */}
      <section className="container section" aria-labelledby="f-h">
        <div className="sec-head">
          <div><p className="eyebrow">The system</p><h2 id="f-h" className="h2" style={{ marginTop: 12 }}>Four formulas. One goat milk base.</h2></div>
          <p className="lead">Each one has a job in the routine. {anyPurchasable(products) ? "Available formulas ship now; the rest open to the waitlist." : "None is on sale yet. Prices shown are launch prices."}</p>
        </div>
        <div className="products" data-reveal>{ordered.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      </section>

      {/* C. Manifesto */}
      <section className="container section split" aria-labelledby="m-h">
        <figure className="split-media"><Image src="/img/gimnasio.jpg" alt="Athlete mid-set in a gym" width={512} height={288} sizes="(max-width: 1023px) 100vw, 50vw" style={{ aspectRatio: "16 / 9" }} /></figure>
        <div className="split-copy" data-reveal>
          <p className="eyebrow">{site.longName}</p>
          <h2 id="m-h" className="h1" style={{ marginTop: 12 }}>The work nobody sees.</h2>
          <p className="lines"><span>The 5 a.m. alarm.</span><span>The extra lap.</span><span>The skin that pays for it.</span></p>
          <p style={{ marginTop: 24 }}>BDSG is skincare for people who show up daily, not only on race day. {site.institutional}</p>
          <Link className="btn-link" href="/about" style={{ marginTop: 16 }}>Why BDSG exists</Link>
        </div>
      </section>

      {/* D. Ingredients */}
      <section className="container section" aria-labelledby="i-h">
        <div className="sec-head">
          <div><p className="eyebrow">Ingredients</p><h2 id="i-h" className="h2" style={{ marginTop: 12 }}>It starts with goat milk.</h2></div>
          <p>Then each formula adds what its job needs. Full ingredient lists (INCI) will be published on each product page before launch.</p>
        </div>
        <div className="ingredients">
          {ingredients.map((g) => (
            <div className="ingredient" key={g.name}>
              <h3 className="h4">{g.name}</h3>
              <p>{g.body}</p>
              <div className="tags">{g.in.map((s) => <Link className="chip" key={s} href={`/products/${s}`}>{bySlug(s)!.name}</Link>)}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 24 }}><Link className="btn-link" href="/science">How the formulas are built</Link></p>
      </section>

      {/* E. Barrier feature */}
      <section className="section band surface" aria-labelledby="b-h">
        <div className="container split flip">
          <figure className="split-media"><Image src={barrier.image!.src} alt={barrier.image!.alt} width={800} height={1200} sizes="(max-width: 1023px) 100vw, 50vw" /></figure>
          <div className="split-copy stack" data-reveal>
            <p className="eyebrow">01 · {barrier.role}</p>
            <h2 id="b-h" className="h1">{barrier.headline}</h2>
            <p className="lead">{barrier.longDescription}</p>
            <div className="cluster"><StatusBadge p={barrier} /><PriceLine p={barrier} /></div>
            <dl>
              <dt>Key ingredients</dt><dd>{barrier.featuredIngredients.join(", ")}</dd>
              <dt>When</dt><dd>{barrier.whenToUse}</dd>
            </dl>
            {canBuy(barrier) ? <AddButton slug="barrier" /> : <Waitlist topic="barrier" cta="Join the waitlist" source="home-barrier" />}
          </div>
        </div>
      </section>

      {/* F. Routine */}
      <section className="container section" aria-labelledby="r-h">
        <div className="sec-head">
          <div><p className="eyebrow">Routine</p><h2 id="r-h" className="h2" style={{ marginTop: 12 }}>Built around your day, not a shelf.</h2></div>
          <p>Pick by what your skin just went through.</p>
        </div>
        <ul className="routine" role="list" data-reveal>
          {routine.map((r) => (
            <li key={r.slug}>
              <figure><Image src={r.img} alt={r.alt} width={512} height={288} sizes="(max-width: 1023px) 50vw, 25vw" /></figure>
              <h3 className="h4">{r.when}</h3>
              <p>{r.what}</p>
              <Link className="btn-link small" href={`/products/${r.slug}`}>{bySlug(r.slug)!.name}<span className="sr-only"> formula</span></Link>
            </li>
          ))}
        </ul>
      </section>

      {/* G. Greatness preview */}
      <section className="container section" aria-labelledby="g-h">
        <div className="sec-head">
          <div><p className="eyebrow">Optional membership</p><h2 id="g-h" className="h2" style={{ marginTop: 12 }}>The Greatness Program.</h2></div>
          <p>Membership is never required to buy. It&apos;s for people who plan to keep the routine.</p>
        </div>
        <div className="compare" data-reveal>
          <div className="plan plan-std">
            <h3 className="h3">Shop without membership</h3>
            <p className="plan-price">$0<small>to join</small></p>
            <ul className="ticks"><li>Standard prices: {products.filter((p) => p.price != null).map((p) => `${p.name} ${money(p.price!)}`).join(", ")}</li><li>Free standard shipping from ${membership.standardShippingThreshold} (Terms of Sale §6)</li><li>15-day returns on unopened products</li></ul>
            <div className="actions"><Link className="btn btn-secondary" href="/shop">Shop without membership</Link></div>
          </div>
          <div className="plan plan-gp">
            <h3 className="h3">Greatness member</h3>
            <p className="plan-price">${membership.initialPrice}<small>first year, then ${membership.renewalPrice}/year</small></p>
            <ul className="ticks">{membership.benefits.slice(0, 4).map((b) => <li key={b.title}><span><b>{b.title}.</b> {b.body}</span></li>)}</ul>
            <div className="actions">
              <Link className="btn btn-primary" href="/greatness">See membership details</Link>
              <p className="small muted">Renews automatically at ${membership.renewalPrice}/year until you cancel. Enrollment opens at launch.</p>
            </div>
          </div>
        </div>
      </section>

      {/* I. Email capture */}
      <section className="container section" aria-labelledby="e-h">
        <div className="split" style={{ alignItems: "start" }}>
          <div className="split-media" style={{ borderRadius: 0 }}>
            <p className="eyebrow">Launch list</p>
            <h2 id="e-h" className="h1" style={{ marginTop: 12 }}>Stay ahead of the launch.</h2>
            <p className="lead" style={{ marginTop: 20 }}>One email when Barrier and Calm go on sale. No daily newsletter.</p>
          </div>
          <div className="split-copy"><Waitlist topic="launch" cta="Notify me" source="home-launch" askName /></div>
        </div>
      </section>
    </>
  );
}
