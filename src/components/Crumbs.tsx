import Link from "next/link";
import { site } from "@/lib/site";

/** Visible breadcrumb + BreadcrumbList JSON-LD. Last item is the current page. */
export function Crumbs({ items }: { items: [href: string, label: string][] }) {
  const all: [string, string][] = [["/", "Home"], ...items];
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map(([h, l], i) => ({ "@type": "ListItem", position: i + 1, name: l, item: `${site.url}${h === "/" ? "" : h}` })),
  };
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {all.map(([h, l], i) => (
          <li key={h}>{i === all.length - 1 ? <span aria-current="page">{l}</span> : <Link href={h}>{l}</Link>}</li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </nav>
  );
}
