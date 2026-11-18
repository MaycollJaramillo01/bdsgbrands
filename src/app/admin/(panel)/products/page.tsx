import Link from "next/link";
import { requireAdmin } from "@/lib/insforge/server";
import { Flash, Head, Pill, usd } from "../ui";

export const metadata = { title: "Productos" };

export default async function Products({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const { client } = await requireAdmin();
  let q = client.database.from("products").select("id,slug,name,sequence,role,status,retail_price,member_price,inventory,images,purchase_enabled,updated_at").order("sort").order("name");
  if (sp.s) q = q.eq("status", sp.s);
  if (sp.q) q = q.ilike("name", `%${sp.q.replace(/[%_]/g, "")}%`);
  const { data, error } = await q;

  const tabs: [string, string][] = [["", "Todos"], ["available", "A la venta"], ["waitlist", "Waitlist"], ["coming_soon", "Próximamente"], ["draft", "Borrador"], ["sold_out", "Agotado"], ["discontinued", "Descontinuado"]];
  const stock = (n: number | null) => (n == null ? <span className="adm-muted">Sin control</span> : <span className={n > 0 ? "" : "adm-bad"}>{n} en existencias</span>);

  return (
    <div className="adm-wide">
      <Head title="Productos"><Link className="adm-btn adm-btn-primary" href="/admin/products/new">Agregar producto</Link></Head>
      <Flash sp={sp} />
      {error && <p className="adm-alert">{error.message}</p>}
      <div className="adm-table-wrap">
        <div className="adm-toolbar">
          <nav className="adm-tabs" aria-label="Filtrar por estado">{tabs.map(([v, t]) => <Link key={v} href={v ? `?s=${v}` : "?"} aria-current={(sp.s ?? "") === v ? "page" : undefined}>{t}</Link>)}</nav>
          <form role="search" className="adm-tsearch">{sp.s && <input type="hidden" name="s" value={sp.s} />}<input className="adm-input" name="q" placeholder="Buscar y filtrar" defaultValue={sp.q} aria-label="Buscar productos por nombre" /></form>
        </div>
        {data?.length ? (
          <table className="adm-table">
            <thead><tr><th>Producto</th><th>Estado</th><th>Inventario</th><th className="adm-num">Precio</th><th className="adm-num">Miembro</th><th>Compra</th></tr></thead>
            <tbody>
              {data.map((p) => {
                const img = (p.images as { src: string }[])?.[0];
                return (
                  <tr key={p.id}>
                    <td><Link className="adm-prod" href={`/admin/products/${p.id}`}>{img ? <img className="adm-thumb" src={img.src} alt="" /> : <span className="adm-thumb" />}<span><b>{p.name}</b><small>{p.sequence} · {p.role}</small></span></Link></td>
                    <td><Pill s={p.status} /></td>
                    <td>{stock(p.inventory)}</td>
                    <td className="adm-num">{usd(p.retail_price)}</td>
                    <td className="adm-num">{usd(p.member_price)}</td>
                    <td>{p.purchase_enabled ? "Activada" : <span className="adm-muted">No</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : <div className="adm-empty">No hay productos con ese filtro. <Link href="/admin/products/new">Agrega uno</Link>.</div>}
      </div>
    </div>
  );
}
