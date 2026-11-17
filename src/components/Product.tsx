import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { canBuy, ctaLabel, statusLabel } from "@/lib/availability";
import { money } from "@/lib/products";

/** Photo when one exists; otherwise the drawn tube (brand manual packaging), labelled as an illustration. */
export function ProductMedia({ p, sizes, priority }: { p: Product; sizes: string; priority?: boolean }) {
  if (p.image) return <Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes={sizes} priority={priority} />;
  return (
    <div className="tube-wrap" role="img" aria-label={`Illustration of the ${p.name} tube. Product photography coming soon.`}>
      <div className="tube">
        <img src="/brand/bdsg-apilado-negro.svg" alt="" />
        <b>{p.name}</b>
        <span>{p.number} / 04 · {p.role}</span>
        <i />
      </div>
    </div>
  );
}

export function StatusBadge({ p }: { p: Product }) {
  return <span className="badge" data-status={p.status}>{statusLabel(p.status)}</span>;
}

export function PriceLine({ p }: { p: Product }) {
  if (p.price == null) return <p className="price-note">Price announced at launch</p>;
  return (
    <p className="price">
      <span className="price-main">{money(p.price)}</span>
      {p.memberPrice != null && <span className="price-note">{money(p.memberPrice)} for Greatness members</span>}
      {!canBuy(p) && <span className="price-note">· at launch</span>}
    </p>
  );
}

export function ProductCard({ p, sizes = "(max-width: 480px) 100vw, (max-width: 1023px) 50vw, 25vw" }: { p: Product; sizes?: string }) {
  return (
    <article className="card">
      <div className="card-media"><ProductMedia p={p} sizes={sizes} /></div>
      <div className="card-row"><span className="card-num">{p.number} · {p.role}</span><StatusBadge p={p} /></div>
      <h3 className="card-title"><Link href={`/products/${p.slug}`}>{p.name}</Link></h3>
      <p>{p.shortDescription}</p>
      <PriceLine p={p} />
      <span className="btn-link" aria-hidden="true">{ctaLabel(p)} →</span>
    </article>
  );
}
