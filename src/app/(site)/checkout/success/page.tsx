import Link from "next/link";

export const metadata = { title: "Order received", robots: { index: false } };

// ponytail: copy says "received", not "paid" — payment state comes from the confirmed provider once checkout is live.
export default function Success() {
  return (
    <div className="container nf">
      <h1 className="h1">Order received.</h1>
      <p className="lead">You&apos;ll get a receipt by email once the payment is confirmed. We&apos;ll email you again when your order ships.</p>
      <Link className="btn btn-primary" href="/shop">Back to the shop</Link>
    </div>
  );
}
