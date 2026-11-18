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

  return (
    <>
      <Head title="Productos"><Link className="adm-btn adm-btn-primary" href="/admin/products/new">Nuevo producto</Link></Head>
      <Flash sp={sp} />
      <form className="adm-row" style={{ margin: "16px 0" }}>
        <input className="adm-input" style={{ maxWidth: 260 }} name="q" placeholder="Buscar por nombre" defaultValue={sp.q} aria-label="Buscar por nombre" />
        <select className="adm-input" style={{ maxWidth: 200 }} name="s" defaultValue={sp.s ?? ""} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option><option value="coming_soon">Próximamente</option><option value="waitlist">Waitlist</option>
          <option value="available">A la venta</option><option value="sold_out">Agotado</option><option value="discontinued">Descontinuado</option>
        </select>
        <button className="adm-btn">Filtrar</button>
      </form>
      {error && <p className="adm-alert">{error.message}</p>}
      {data?.length ? (
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th><span className="sr-only">Foto</span></th><th>Producto</th><th>Estado</th><th className="adm-num">Precio</th><th className="adm-num">Miembro</th><th className="adm-num">Inventario</th><th>Compra</th></tr></thead>
          <tbody>
            {data.map((p) => {
              const img = (p.images as { src: string }[])?.[0];
              return (
                <tr key={p.id}>
                  <td>{img ? <img className="adm-thumb" src={img.src} alt="" /> : <span className="adm-thumb" />}</td>
                  <td><Link href={`/admin/products/${p.id}`}><b>{p.name}</b></Link><br /><span className="adm-muted">{p.sequence} · {p.role} · /{p.slug}</span></td>
                  <td><Pill s={p.status} /></td>
                  <td className="adm-num">{usd(p.retail_price)}</td>
                  <td className="adm-num">{usd(p.member_price)}</td>
                  <td className="adm-num">{p.inventory ?? "—"}</td>
                  <td>{p.purchase_enabled ? "Activada" : "No"}</td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      ) : <div className="adm-card adm-empty">No hay productos con ese filtro. <Link href="/admin/products/new">Crea el primero</Link>.</div>}
    </>
  );
}
