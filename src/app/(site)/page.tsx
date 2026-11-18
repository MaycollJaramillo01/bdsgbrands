import Link from "next/link";
import Image from "next/image";
import { bySlug, featured, money, publicProducts as products } from "@/lib/products";
import { ProductCard, ProductMedia, PriceLine, StatusBadge } from "@/components/Product";
import { Waitlist } from "@/components/Waitlist";
import { ingredients } from "@/lib/ingredients";
import { AddButton } from "@/components/Cart";
import { anyPurchasable, canBuy, ctaLabel, statusLabel } from "@/lib/availability";
import { membership, site } from "@/lib/site";

export const metadata = { alternates: { canonical: "/" } };

const routine = [
  { img: "/img/gimnasio.jpg", alt: "Athlete training with weights in a gym", when: "After training", what: "Shower, then Recovery for a cool finish.", slug: "recovery" },
  { img: "/img/natacion.jpg", alt: "Swimmer in a pool lane", when: "After the pool", what: "Chlorine and repeated rinsing: Barrier, daily.", slug: "barrier" },
  { img: "/img/montana.jpg", alt: "Hiker on a mountain ridge", when: "After wind or cold", what: "When skin feels tight: Calm.", slug: "calm" },
  { img: "/img/pareja.jpg", alt: "Two people walking outdoors together", when: "Between hard weeks", what: "A surface reset: Renewal.", slug: "renewal" },
] as const;

export default function Home() {
  const barrier = featured;
  const ordered = products;
  return (
    <>
      {/* A. Hero */}
      <section className="hero dark" aria-labelledby="hero-h">
        <div className="container hero-in grid">
          <div className="hero-copy" data-reveal>
            <p className="eyebrow">Performance skincare</p>
            <h1 id="hero-h" className="display" style={{ marginTop: 20 }}>{site.promise}</h1>
            <p className="lead">Four goat milk-based formulas built around the moments skin goes through every day — training, cleansing, weather, travel and recovery.</p>
            <div className="cluster hero-ctas">
              <Link className="btn btn-primary" href={`/products/${barrier.slug}`}>{ctaLabel(barrier)}</Link>
              <Link className="btn btn-secondary" href="/shop">Explore the formulas</Link>
            </div>
          </div>
          <figure className="hero-pic">
            <ProductMedia p={barrier} priority sizes="(max-width: 1023px) 100vw, 36vw" />
            <figcaption className="small">{barrier.sequence} · {barrier.name}. {statusLabel(barrier.status)}{barrier.retailPrice != null && !canBuy(barrier) ? ` · ${money(barrier.retailPrice)} launch price` : ""}</figcaption>
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
          <p className="lines"><span>The 5 a.m. alarm.</span><span>The extra lap.</span><span>The routine that keeps you going.</span></p>
          <p style={{ marginTop: 24 }}>BDSG is skincare for people who keep showing up — daily, not only on race day. The summit matters, but the work happens during the climb.</p>
          <p style={{ marginTop: 12, fontWeight: 600 }}>{site.institutional}</p>
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
              <div className="tags">{g.in.map((s) => <Link className="chip" key={s} href={`/products/${s}`}>{bySlug(s)?.name}</Link>)}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 24 }}><Link className="btn-link" href="/science">How the formulas are built</Link></p>
      </section>

      {/* E. Barrier feature */}
      <section className="section band surface" aria-labelledby="b-h">
        <div className="container split flip">
          <figure className="split-media"><ProductMedia p={barrier} sizes="(max-width: 1023px) 100vw, 50vw" /></figure>
          <div className="split-copy stack" data-reveal>
            <p className="eyebrow">{barrier.sequence} · {barrier.role}</p>
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
          {routine.filter((r) => bySlug(r.slug) && bySlug(r.slug)!.status !== "draft").map((r) => (
            <li key={r.slug}>
              <figure><Image src={r.img} alt={r.alt} width={512} height={288} sizes="(max-width: 1023px) 50vw, 25vw" /></figure>
              <h3 className="h4">{r.when}</h3>
              <p>{r.what}</p>
              <Link className="btn-link small" href={`/products/${r.slug}`}>{bySlug(r.slug)?.name}<span className="sr-only"> formula</span></Link>
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
            <ul className="ticks"><li>Launch prices: {products.filter((p) => p.retailPrice != null).map((p) => `${p.name} ${money(p.retailPrice!)}`).join(", ")}</li><li>Free standard shipping from ${membership.standardShippingThreshold} (Terms of Sale §6)</li><li>15-day returns on unopened products</li></ul>
            <div className="actions"><Link className="btn btn-secondary" href="/shop">Shop without membership</Link></div>
          </div>
          <div className="plan plan-gp">
            <h3 className="h3">Greatness member</h3>
            <p className="plan-price">${membership.initialPrice}<small>first year, then ${membership.renewalPrice}/year</small></p>
            <ul className="ticks">{membership.benefits.slice(0, 4).map((b) => <li key={b.title}><span><b>{b.title}.</b> {b.body}</span></li>)}</ul>
            <div className="actions">
              <p className="small">Renews automatically at ${membership.renewalPrice}/year until you cancel.</p>
              <Link className="btn btn-primary" href="/greatness">{membership.enrollmentOpen ? "Join Greatness" : "Notify me when enrollment opens"}</Link>
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
            <p className="lead" style={{ marginTop: 20 }}>One email when the selected formula launches. Unsubscribe anytime.</p>
          </div>
          <div className="split-copy"><Waitlist chooseFormula cta="Notify me" source="home-launch" askName /></div>
        </div>
      </section>
    </>
  );
}
