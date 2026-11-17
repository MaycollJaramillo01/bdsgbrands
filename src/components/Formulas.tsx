"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { money, products } from "@/lib/products";
import { AddButton } from "./Cart";
import { Notify } from "./Notify";
import { Tube } from "./Tube";

// The climb: the stage stays put, the formula on it changes step by step as you scroll.
export function Formulas() {
  const [active, setActive] = useState(0);
  const [member, setMember] = useState(false);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="formulas" className="climb" aria-labelledby="formulas-h">
      <div className="stage" aria-hidden="true">
        {products.map((p, i) => (
          <div key={p.slug} className={`frame${i === active ? " on" : ""}`}>
            {p.photo ? <img src={p.photo} alt="" width={800} height={1200} /> : <Tube p={p} />}
          </div>
        ))}
        <ol className="steps">
          {products.map((p, i) => (
            <li key={p.slug} className={i <= active ? "lit" : ""} style={{ height: `${(i + 1) * 25}%` }} />
          ))}
        </ol>
      </div>

      <div className="read">
        <header className="read-head">
          <h2 id="formulas-h" className="h2">Four formulas. One base.</h2>
          <p className="lead">Each one answers a moment of the work: defend, renew, calm, recover. All four start from goat milk.</p>
          <label className="switch">
            <input type="checkbox" checked={member} onChange={(e) => setMember(e.target.checked)} />
            <span>Show Greatness Program prices</span>
          </label>
        </header>

        {products.map((p, i) => (
          <article key={p.slug} id={p.slug} data-i={i} ref={(el) => { refs.current[i] = el; }} className="formula">
            <div className="m-photo">{p.photo ? <img src={p.photo} alt={`${p.name} tube on stone`} width={800} height={1200} loading="lazy" /> : <Tube p={p} />}</div>
            <p className="lbl">{p.n} / 04 · {p.role}</p>
            <h3 className="h1"><Link href={`/formulas/${p.slug}`}>{p.name}</Link></h3>
            <p className="sub">{p.line}</p>
            <p>{p.body}</p>
            <p className="actives">{p.actives.join(" · ")}</p>
            {p.price ? (
              <div className="buy">
                <p className="price num" aria-live="polite">
                  {money(member ? p.member! : p.price)}
                  <span>{member ? `Members · ${money(p.price)} without` : `Members ${money(p.member!)}`}</span>
                </p>
                <AddButton slug={p.slug} />
              </div>
            ) : (
              <div className="buy soon">
                <p className="price">Coming soon</p>
                <Notify topic={p.slug} />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
