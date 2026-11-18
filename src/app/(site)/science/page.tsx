import type { Metadata } from "next";
import Link from "next/link";
import { bySlug, publicProducts as products } from "@/lib/products";
import { ingredients } from "@/lib/ingredients";
import { Crumbs } from "@/components/Crumbs";

export const metadata: Metadata = {
  title: "The Science: Goat Milk Base & Ingredients",
  description: "How BDSG formulas are built: a goat milk base plus the ingredients each formula needs for its job. What we say, and what we don't claim.",
  alternates: { canonical: "/science" },
};

export default function Science() {
  return (
    <div className="container">
      <Crumbs items={[["/science", "Science"]]} />
      <header className="page-hero read">
        <p className="eyebrow">Science</p>
        <h1 className="h1" style={{ marginTop: 12 }}>One base. Four jobs.</h1>
        <p className="lead">Every BDSG formula starts with goat milk, then adds the ingredients its role in the routine calls for.</p>
      </header>

      <section className="read prose" aria-labelledby="base-h">
        <h2 id="base-h" className="h2">Why goat milk</h2>
        <p style={{ marginTop: 16 }}>Goat milk is naturally rich in fats and proteins. In skincare it&apos;s used for the soft, comfortable feel it leaves on skin, which matters when skin is washed, sweated on and exposed to the elements every day.</p>
      </section>

      <section className="section" aria-labelledby="by-h">
        <h2 id="by-h" className="h2">Formula by formula</h2>
        <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="by-h" style={{ marginTop: 32 }}>
          <table className="t">
            <thead><tr><th scope="col">Formula</th><th scope="col">Role</th><th scope="col">Featured ingredients</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.slug}>
                  <th scope="row"><Link className="inline" href={`/products/${p.slug}`}>{p.sequence} · {p.name}</Link></th>
                  <td>{p.role}</td>
                  <td>{p.featuredIngredients.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="gl-h">
        <h2 id="gl-h" className="h2">Ingredient glossary</h2>
        <dl className="ingredients" style={{ marginTop: 32 }}>
          {ingredients.map((g) => (
            <div className="ingredient" key={g.name}>
              <dt className="h4">{g.name}</dt>
              <dd>{g.body}</dd>
              <dd className="small muted">In: {g.in.map((s) => bySlug(s)!.name).join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section read prose" aria-labelledby="say-h">
        <h2 id="say-h" className="h2">What we say, and what we don&apos;t</h2>
        <p style={{ marginTop: 16 }}><b>BDSG products are cosmetics.</b> We describe what each ingredient is and why it&apos;s in the formula. We don&apos;t claim to treat, heal or cure disease, and we don&apos;t publish performance claims without appropriate support.</p>
        <p>Full ingredient lists (INCI) will be published on each product page before launch.</p>
      </section>

      <section className="section facts" aria-labelledby="ifaq-h">
        <h2 id="ifaq-h" className="h2">Ingredient FAQ</h2>
        <div className="acc" data-reveal style={{ marginTop: 32 }}>
          <details><summary>Why goat milk instead of a water base alone?</summary><div className="acc-body"><p>Goat milk brings fats and proteins that give the formulas a soft, comfortable feel. Each formula then adds what its job needs.</p></div></details>
          <details><summary>Where is the full ingredient list?</summary><div className="acc-body"><p>It will be published on each product page before that formula goes on sale.</p></div></details>
          <details><summary>I have an allergy. Can I check an ingredient?</summary><div className="acc-body"><p>Yes. <Link className="inline" href="/contact">Contact us</Link> with the formula and the ingredient you&apos;re asking about.</p></div></details>
        </div>
      </section>
    </div>
  );
}
