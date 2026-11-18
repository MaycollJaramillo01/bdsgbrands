import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs } from "@/components/Crumbs";
import { Waitlist } from "@/components/Waitlist";
import { membership } from "@/lib/site";

export const metadata: Metadata = {
  title: "Greatness Program Membership",
  description: `Optional BDSG membership: $${membership.initialPrice} the first year, then $${membership.renewalPrice}/year. Up to ${membership.discountMax}% off formulas, free shipping from $${membership.shippingThreshold}, early access. Not required to buy.`,
  alternates: { canonical: "/greatness" },
};

export default function Greatness() {
  const open = membership.enrollmentOpen;
  return (
    <div className="container">
      <Crumbs items={[["/greatness", "Greatness Program"]]} />
      <header className="page-hero read">
        <p className="eyebrow">Optional membership</p>
        <h1 className="h1" style={{ marginTop: 12 }}>The Greatness Program</h1>
        <p className="lead">For people who plan to keep the routine. You never need it to buy BDSG.</p>
      </header>

      <div className="compare" data-reveal>
        <div className="plan plan-std">
          <h2 className="h3">Without membership</h2>
          <p className="plan-price">$0</p>
          <ul className="ticks"><li>Standard prices</li><li>Free standard shipping from ${membership.standardShippingThreshold}</li><li>15-day returns on unopened products</li></ul>
          <div className="actions"><Link className="btn btn-secondary" href="/shop">Shop without membership</Link></div>
        </div>
        <div className="plan plan-gp">
          <h2 className="h3">Greatness member</h2>
          <p className="plan-price">${membership.initialPrice}<small>first year</small></p>
          <p>Then <b>${membership.renewalPrice}/year</b>, renewing automatically until you cancel.</p>
          <ul className="ticks">{membership.benefits.map((b) => <li key={b.title}><span><b>{b.title}.</b> {b.body}</span></li>)}</ul>
          <div className="actions" id="notify">
            <p className="small"><b>Automatic renewal:</b> ${membership.initialPrice} today, then ${membership.renewalPrice} charged automatically each year until you cancel. Cancel within 24 hours of joining for a full refund.</p>
            {open ? (
              // BLOCKED BY BDSG: the enrollment flow (provider, renewal consent, notices, cancellation) is built once terms are approved.
              <p className="small">Enrollment is opening. Check back shortly.</p>
            ) : (
              <>
                <p className="small">Enrollment isn&apos;t open yet.</p>
                <Waitlist topic="greatness-program" cta="Notify me when enrollment opens" source="greatness" />
              </>
            )}
          </div>
        </div>
      </div>

      <section className="section facts" aria-labelledby="terms-h">
        <h2 id="terms-h" className="h2">The fine print, up front</h2>
        <div className="acc" data-reveal style={{ marginTop: 32 }}>
          <details open><summary>Price and renewal</summary><div className="acc-body"><p>${membership.initialPrice} when you join. ${membership.renewalPrice} each year after, charged automatically at the end of each membership year. You&apos;ll get a renewal notice before you&apos;re charged. At enrollment you&apos;ll see an unchecked box to agree to automatic renewal; you can&apos;t join without choosing it yourself.</p></div></details>
          <details><summary>Cancelling</summary><div className="acc-body"><p>Cancel within 24 hours of joining for a full refund of the enrollment fee. After that, cancelling stops future renewals and benefits last until the end of the paid year.</p></div></details>
          <details><summary>Discount and shipping details</summary><div className="acc-body"><p>Member pricing is up to {membership.discountMax}% off formulas. Free shipping applies to eligible orders of ${membership.shippingThreshold} or more.</p></div></details>
        </div>
        <p className="small muted" style={{ marginTop: 24 }}>Full <Link className="inline" href="/legal/membership">Membership Terms</Link> will be published before enrollment opens.</p>
      </section>
    </div>
  );
}
