import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs } from "@/components/Crumbs";
import { bySlug, money, publicProducts } from "@/lib/products";
import { canBuy, statusLabel } from "@/lib/availability";
import { membership, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ — Availability, Ingredients, Shipping & Membership",
  description: "Direct answers about BDSG: what it is, which formulas are available, what's in Barrier and Calm, shipping, returns and the optional Greatness Program.",
  alternates: { canonical: "/faq" },
};

const status = publicProducts.map((p) => `${p.name}: ${statusLabel(p.status).toLowerCase()}`).join("; ");
const buyable = publicProducts.filter((p) => canBuy(p)).map((p) => p.name);
const b = bySlug("barrier")!, c = bySlug("calm")!;
const price = (p: typeof b) => (p.retailPrice != null ? ` Launch price: ${money(p.retailPrice)}.` : "");

// Plain strings only, so FAQPage JSON-LD matches the visible text exactly. Every answer derives from catalog/settings.
const qa: [group: string, q: string, a: string][] = [
  ["Availability", "What is BDSG?", `BDSG (${site.longName}) is performance skincare built on a goat milk base, for people who keep up demanding routines. It is made by ${site.entity} in Utah.`],
  ["Availability", "Can I buy BDSG now?", buyable.length ? `Yes: ${buyable.join(", ")}. Current status — ${status}.` : `Not yet. No formula is on sale. Current status — ${status}.`],
  ["Availability", "When does Barrier launch?", canBuy(b) ? "Barrier is available now." : `No launch date has been announced. Join the Barrier waitlist and we'll email you when it launches.${price(b)}`],
  ["Products", "What is in Barrier?", `Featured ingredients: ${b.featuredIngredients.join(", ")}. The full ingredient list will be published before launch.`],
  ["Products", "What is in Calm?", `Featured ingredients: ${c.featuredIngredients.join(", ")}. The full ingredient list will be published before launch.`],
  ["Products", "What sizes are the formulas?", "Sizes will be confirmed on each product page before launch."],
  ["Ingredients", "What is goat milk skincare?", "Skincare that uses goat milk as an ingredient. Goat milk is naturally rich in fats and proteins and is used for the soft, comfortable feel it leaves on skin. Every BDSG formula is built on it."],
  ["Ingredients", "Are BDSG products medical treatments?", "No. BDSG products are cosmetics. They are not intended to diagnose, treat, cure or prevent any disease."],
  ["Orders", "Can I place an order today?", buyable.length ? "Yes, for the formulas marked available." : "Not yet. Checkout opens when the first formula launches."],
  ["Shipping", "How much is shipping?", `Standard shipping is free on qualifying orders of ${money(membership.standardShippingThreshold)} or more under the Terms of Sale. Greatness members get free shipping from ${money(membership.shippingThreshold)} on eligible orders. Other rates and delivery times will be published before launch.`],
  ["Returns", "What's the return policy?", "Unopened products can be returned within 15 days of purchase. Damaged, leaking or incorrect orders are handled separately under the Return Policy."],
  ["Membership", "Is BDSG a membership brand?", "No. You can buy every formula without a membership. The Greatness Program is optional."],
  ["Membership", "Do I need Greatness to buy?", "No. Membership is never required."],
  ["Membership", "How does the membership renew?", `$${membership.initialPrice} the first year, then $${membership.renewalPrice} per year, renewing automatically until you cancel. Enrollment isn't open yet.`],
  ["Safety", "I had a reaction. What should I do?", "Stop using the product. If the reaction is severe, seek medical help right away. Then contact us and choose the topic \"Skin reaction or product safety\"."],
];

export default function Faq() {
  const groups = [...new Set(qa.map((q) => q[0]))];
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: qa.map(([, q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return (
    <div className="container">
      <Crumbs items={[["/faq", "FAQ"]]} />
      <header className="page-hero read">
        <h1 className="h1">Questions, answered</h1>
        <p className="lead">Can&apos;t find yours? <Link className="inline" href="/contact">Ask us</Link>. Policies: <Link className="inline" href="/legal/returns">Returns</Link>, <Link className="inline" href="/legal/terms">Terms of Sale</Link>.</p>
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
