import { Formulas } from "@/components/Formulas";
import { Notify } from "@/components/Notify";
import { products } from "@/lib/products";

const faq: [string, string][] = [
  ["What is the base?", "Goat milk. Every formula starts there and adds its own actives for one job: barrier, texture, calm or post-session comfort."],
  ["Who is it for?", "People who train often: gym, pool, trail. Sweat, chlorine, cold air and friction all take something out of skin."],
  ["When does everything ship?", "Barrier and Calm are priced and ready. Renewal and Recovery are coming soon; leave your email on either and you hear first."],
  ["How much is shipping?", "Free on orders of $70.00 or more. Greatness Program members get free shipping from $50.00."],
  ["Can I return something?", "Yes, within 15 days of purchase, unopened and in its original packaging. Damaged or wrong items are handled separately; see the Return & Refund Policy."],
  ["How does the membership renew?", "$55 to join for the first year, then $35 a year. It renews automatically; cancel at least 24 hours before the renewal date to stop the charge."],
  ["Can I get the membership fee back?", "Request it within 24 hours of joining."],
  ["Is this a medical product?", "No. These are cosmetics. They are not intended to diagnose, treat, cure or prevent any disease."],
];

export default function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-h">
        <div className="hero-text">
          <h1 id="hero-h" className="display">Earn it daily.</h1>
          <p className="lead">Performance skincare on a goat milk base. Four formulas for skin that trains every day.</p>
          <div className="hero-cta">
            <a className="btn" href="#formulas">Shop the formulas</a>
            <a className="btn ghost" href="#program">Greatness Program</a>
          </div>
          <p className="hero-note muted">Barrier $33.00 · Calm $35.00 · Free shipping from $70.00</p>
        </div>
        <figure className="hero-pic">
          <img className="shutter" src="/img/sitio-actual-barrier.jpg" alt="Barrier tube on stone with rice and goat milk" width={800} height={1200} />
          <figcaption>Barrier. Goat milk, ceramide NP, rice peptides.</figcaption>
        </figure>
        <figure className="hero-side">
          <img src="/img/natacion.jpg" alt="Swimmer at the edge of the pool before a session" width={512} height={288} />
          <figcaption>Before the session.</figcaption>
        </figure>
      </section>

      <Formulas />

      <section className="base" aria-labelledby="base-h">
        <div className="base-photo">
          <img src="/img/montana.jpg" alt="Two hikers on a desert trail" width={512} height={288} loading="lazy" />
        </div>
        <div className="base-text">
          <h2 id="base-h" className="h2">What goes into each one.</h2>
          <table>
            <caption className="sr">Featured ingredients by formula</caption>
            <thead><tr><th scope="col">Formula</th><th scope="col">Featured ingredients</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.slug}><th scope="row"><span className="num">{p.n}</span> {p.name}</th><td>{p.actives.join(", ")}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="program" className="plans" aria-labelledby="program-h">
        <h2 id="program-h" className="sr">Greatness Program</h2>
        <div className="plan std">
          <h3 className="h2">Standard</h3>
          <p className="sub">Buy a formula when you need it.</p>
          <p>Regular prices. Free shipping on orders of $70.00 or more. Returns within 15 days, unopened.</p>
          <p className="plan-price num">$0<span>to start</span></p>
          <a className="btn" href="#formulas">Shop formulas</a>
        </div>
        <div className="plan gp">
          <h3 className="h2">Greatness Program</h3>
          <p className="sub">Show up daily. Pay less for it.</p>
          <p>Member pricing on every formula. Free shipping from $50.00. First access to new formulas, monthly wellness content and a referral code to share.</p>
          <p className="plan-price num">$55<span>first year, then $35 a year</span></p>
          <Notify topic="greatness-program" label="Get notified" />
        </div>
      </section>

      <section id="questions" className="faq" aria-labelledby="faq-h">
        <h2 id="faq-h" className="h2">Questions.</h2>
        <div className="faq-cols">
          {faq.map(([q, a]) => (<p key={q}><b>{q}</b> {a}</p>))}
        </div>
      </section>

      <section className="closer" aria-labelledby="closer-h">
        <img src="/img/pareja.jpg" alt="Two people resting together on a sofa after training" width={512} height={288} loading="lazy" />
        <div>
          <h2 id="closer-h" className="h2">Nobody claps at 5 a.m.</h2>
          <p className="lead">Show up anyway. We&apos;ll look after the skin that does the work.</p>
          <a className="btn" href="#formulas">Shop the formulas</a>
        </div>
      </section>
    </>
  );
}
