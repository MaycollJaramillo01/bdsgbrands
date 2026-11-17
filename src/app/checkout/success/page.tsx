import Link from "next/link";

export default function Success() {
  return (
    <section className="done" aria-labelledby="done-h">
      <h1 id="done-h" className="h1">Order in. Go train.</h1>
      <p className="lead">Stripe sends your receipt by email. Your order ships once payment clears.</p>
      <Link className="btn" href="/">Back to the formulas</Link>
    </section>
  );
}
