import { notFound } from "next/navigation";
import Link from "next/link";
import { bySlug, money, products } from "@/lib/products";
import { AddButton } from "@/components/Cart";
import { Notify } from "@/components/Notify";
import { Tube } from "@/components/Tube";

export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = bySlug((await params).slug);
  return p ? { title: `${p.name} · ${p.role} · BDSG`, description: `${p.line} ${p.actives.join(", ")}.` } : {};
}

export default async function FormulaPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = bySlug((await params).slug);
  if (!p) notFound();
  const next = products[(Number(p.n)) % 4];
  return (
    <section className="pdp" aria-labelledby="pdp-h">
      <div className="pdp-photo">{p.photo ? <img className="shutter" src={p.photo} alt={`${p.name} tube on stone`} width={800} height={1200} /> : <Tube p={p} />}</div>
      <div className="pdp-text">
        <p className="lbl">{p.n} / 04 · {p.role}</p>
        <h1 id="pdp-h" className="display">{p.name}</h1>
        <p className="sub">{p.line}</p>
        <p>{p.body}</p>
        <h2 className="h3">Featured ingredients</h2>
        <ul className="ing">{p.actives.map((a) => <li key={a}>{a}</li>)}</ul>
        <p className="small muted">Net Wt. 6 oz / 177 ml. Full INCI list on the tube.</p>
        {p.price ? (
          <div className="buy">
            <p className="price num">{money(p.price)}<span>Members {money(p.member!)}</span></p>
            <AddButton slug={p.slug} />
          </div>
        ) : (
          <div className="buy soon"><p className="price">Coming soon</p><Notify topic={p.slug} /></div>
        )}
        <p className="next">Next step: <Link href={`/formulas/${next.slug}`}>{next.n} {next.name}</Link></p>
      </div>
    </section>
  );
}
