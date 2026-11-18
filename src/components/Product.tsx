import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { canBuy, ctaLabel, statusLabel } from "@/lib/availability";
import { money } from "@/lib/products";
import { settings } from "@/lib/site";

/** Approved photo when one exists; otherwise a drawn tube, labelled as an illustration (no invented packaging details). */
export function ProductMedia({ p, sizes, priority }: { p: Product; sizes: string; priority?: boolean }) {
  const img = p.images[0];
  if (img) return <Image src={img.src} alt={p.imageAlt} width={img.width} height={img.height} sizes={sizes} priority={priority} />;
  return (
    <div className="tube-wrap" role="img" aria-label={`Illustration of the ${p.name} tube. Product photography coming soon.`}>
      <div className="tube">
        <img src="/brand/bdsg-apilado-negro.svg" alt="" />
        <b>{p.name}</b>
        <span>{p.sequence} / 04 · {p.role}</span>
        <i />
      </div>
    </div>
  );
}

export function StatusBadge({ p }: { p: Product }) {
  return <span className="badge" data-status={p.status}>{statusLabel(p.status)}</span>;
}

export function PriceLine({ p }: { p: Product }) {
  if (!settings.catalogLive || p.retailPrice == null) return <p className="price-note">Price announced at launch</p>;
  return (
    <p className="price">
      <span className="price-main">{money(p.retailPrice)}</span>
      {p.memberPrice != null && <span className="price-note">{money(p.memberPrice)} for Greatness members</span>}
      {!canBuy(p) && <span className="price-note">· launch price</span>}
    </p>
  );
}

export function ProductCard({ p, sizes = "(max-width: 480px) 100vw, (max-width: 1023px) 50vw, 25vw" }: { p: Product; sizes?: string }) {
  return (
    <article className="card">
      <div className="card-media"><ProductMedia p={p} sizes={sizes} /></div>
      <div className="card-row"><span className="card-num">{p.sequence} · {p.role}</span><StatusBadge p={p} /></div>
      <h3 className="card-title"><Link href={`/products/${p.slug}`}>{p.name}</Link></h3>
      <p>{p.shortDescription}</p>
      <p className="small muted">{p.featuredIngredients.join(" · ")}</p>
      <PriceLine p={p} />
      <span className="btn-link" aria-hidden="true">{ctaLabel(p)} →</span>
    </article>
  );
}
