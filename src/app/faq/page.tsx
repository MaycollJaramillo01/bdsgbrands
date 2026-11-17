import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs } from "@/components/Crumbs";
import { products } from "@/lib/products";
import { canBuy, statusLabel } from "@/lib/availability";
import { membership } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about BDSG availability, ingredients, shipping, returns and the optional Greatness Program membership.",
  alternates: { canonical: "/faq" },
};

const avail = products.map((p) => `${p.name}: ${statusLabel(p.status).toLowerCase()}`).join("; ");
const buyable = products.filter(canBuy).map((p) => p.name);

const qa: [string, string, React.ReactNode][] = [
  ["Availability", "Can I buy BDSG now?", buyable.length ? `Yes: ${buyable.join(", ")}. Current status — ${avail}.` : `Not yet. Current status — ${avail}. Join a waitlist on any product page to hear the day it launches.`],
  ["Availability", "When do Barrier and Calm launch?", "We haven't announced a date. Waitlist members get one email the day they go on sale."],
  ["Ingredients", "What are the formulas made with?", <>Every formula is built on goat milk. Featured ingredients are listed on each <Link key="s" className="inline" href="/shop">product page</Link>; full INCI lists will be published before launch.</>],
  ["Ingredients", "I had a reaction. What should I do?", <>Stop using the product. If it&apos;s serious, get medical help. Then tell us through the <Link key="c" className="inline" href="/contact">contact form</Link> using the &quot;Skin reaction or product safety&quot; topic.</>],
  ["Orders", "How much is shipping?", `Standard shipping is free on qualifying orders of $${membership.standardShippingThreshold} or more under the Terms of Sale. Rates below that and delivery times will be confirmed before launch.`],
  ["Orders", "What's the return policy?", <>Unopened products can be returned within 15 days. Damaged or incorrect orders are always handled. <Link key="r" className="inline" href="/legal/returns">Return Policy</Link></>],
  ["Membership", "Do I need a membership to buy?", "No. The Greatness Program is optional."],
  ["Membership", "How does the membership renew?", `$${membership.initialPrice} the first year, then $${membership.renewalPrice}/year, renewing automatically until you cancel. You agree to renewal with a box you check yourself.`],
];

export default function Faq() {
  const groups = [...new Set(qa.map((q) => q[0]))];
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: qa.filter((q) => typeof q[2] === "string").map(([, q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return (
    <div className="container">
      <Crumbs items={[["/faq", "FAQ"]]} />
      <header className="page-hero read">
        <h1 className="h1">Questions, answered</h1>
        <p className="lead">Can&apos;t find yours? <Link className="inline" href="/contact">Ask us</Link>.</p>
      </header>
      <div className="facts">
        {groups.map((g) => (
          <section key={g} aria-labelledby={`g-${g}`} style={{ marginBottom: 56 }}>
            <h2 id={`g-${g}`} className="h3">{g}</h2>
            <div className="acc" data-reveal style={{ marginTop: 16 }}>
              {qa.filter((q) => q[0] === g).map(([, q, a]) => <details key={q}><summary>{q}</summary><div className="acc-body"><p>{a}</p></div></details>)}
            </div>
          </section>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
