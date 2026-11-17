import Link from "next/link";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="container nf">
      <p className="eyebrow">404</p>
      <h1 className="h1">Wrong turn. The journey continues.</h1>
      <p className="lead">This page doesn&apos;t exist or has moved.</p>
      <div className="cluster"><Link className="btn btn-primary" href="/shop">Shop the formulas</Link><Link className="btn btn-secondary" href="/">Go home</Link></div>
    </div>
  );
}
