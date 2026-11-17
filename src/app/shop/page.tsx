import type { Metadata } from "next";
import Link from "next/link";
import { bySlug, shopOrder } from "@/lib/products";
import { ProductCard } from "@/components/Product";
import { Crumbs } from "@/components/Crumbs";
import { membership } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop All Formulas",
  description: "Barrier, Calm, Renewal and Recovery: four goat milk-based performance skincare formulas from BDSG. See status, launch prices and join the waitlist.",
  alternates: { canonical: "/shop" },
};

export default function Shop() {
  const ps = shopOrder.map((s) => bySlug(s)!);
  return (
    <div className="container">
      <Crumbs items={[["/shop", "Shop"]]} />
      <header className="page-hero">
        <p className="eyebrow">Shop</p>
        <h1 className="h1" style={{ marginTop: 12 }}>All formulas</h1>
        <p className="lead">Four formulas on one goat milk base. Each card shows its real status: you can buy what&apos;s in stock and join the waitlist for the rest.</p>
      </header>
      <div className="products">{ps.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      <aside className="notice" style={{ marginTop: 48, maxWidth: 720 }}>
        <b>Membership is optional.</b>
        <p className="small">Greatness members pay up to {membership.discountMax}% less on formulas. You never need it to buy. <Link className="inline" href="/greatness">How the program works</Link></p>
      </aside>
    </div>
  );
}
