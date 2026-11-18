import Link from "next/link";
import { requireAdmin } from "@/lib/insforge/server";
import { Head, Pill, TOPIC_ES, usd, when } from "./ui";

export const metadata = { title: "Inicio" };

export default async function Dashboard() {
  const { client } = await requireAdmin();
  const d = client.database;
  const week = new Date(Date.now() - 7 * 864e5).toISOString();
  const [products, settings, orders, wl, wlWeek, msgs, policies] = await Promise.all([
    d.from("products").select("id,slug,name,status,retail_price,inci,size,directions,warnings,images,image_alt,purchase_enabled").order("sort"),
    d.from("site_settings").select("*").eq("id", 1).single(),
    d.from("orders").select("id,total,subtotal,status,fulfillment_status,created_at").order("created_at", { ascending: false }).limit(200),
    d.from("waitlist").select("id", { count: "exact", head: true }),
    d.from("waitlist").select("id", { count: "exact", head: true }).gte("created_at", week),
    d.from("contact_messages").select("id,name,topic,created_at,status").order("created_at", { ascending: false }).limit(5),
    d.from("policies").select("slug,title,draft,blocks,effective"),
  ]);
  const P = products.data ?? [], S = settings.data, O = orders.data ?? [];
  const paid = O.filter((o) => o.status === "paid" || o.status === "fulfilled");
  const toShip = O.filter((o) => o.status === "paid" && o.fulfillment_status === "unfulfilled").length;
  const revenue = paid.reduce((a, o) => a + Number(o.total ?? o.subtotal ?? 0), 0);

  // What still stands between BDSG and its first sale, derived from live data.
  const missing = (p: (typeof P)[number]) => [!p.inci && "INCI", !p.size && "tamaño", !p.directions && "modo de uso", !p.warnings && "advertencias", !(p.images as unknown[])?.length && "foto", JSON.stringify(p).includes("[TEST DATA]") && "reemplazar datos de prueba"].filter(Boolean);
  const todo: [string, string][] = [
    ...(!S?.checkout_live ? [["Checkout apagado: falta confirmar el proveedor de pago.", "/admin/settings"] as [string, string]] : []),
    ...(!S?.support_email ? [["Falta el email de soporte.", "/admin/settings"] as [string, string]] : []),
    ...(policies.data ?? []).filter((p) => p.draft || JSON.stringify(p).includes("[TEST DATA]")).map((p) => [`${p.draft ? "Política en borrador" : "Política con datos de prueba"}: ${p.title}.`, `/admin/policies/${p.slug}`] as [string, string]),
    ...P.filter((p) => p.status !== "draft" && missing(p).length).map((p) => [`${p.name}: falta ${missing(p).join(", ")}.`, `/admin/products/${p.id}`] as [string, string]),
  ];

  return (
    <>
      <Head title="Inicio"><Link className="adm-btn" href="/admin/products/new">Nuevo producto</Link></Head>
      <div className="adm-grid" style={{ marginBottom: 24 }}>
        <div className="adm-card adm-kpi"><span className="adm-muted">Ventas (pagadas)</span><b>{usd(revenue)}</b><span className="adm-muted">{paid.length} pedidos</span></div>
        <div className="adm-card adm-kpi"><span className="adm-muted">Por enviar</span><b>{toShip}</b><Link className="adm-muted" href="/admin/orders?f=to_ship">Ver pedidos</Link></div>
        <div className="adm-card adm-kpi"><span className="adm-muted">Waitlist</span><b>{wl.count ?? 0}</b><span className="adm-muted">+{wlWeek.count ?? 0} en 7 días</span></div>
        <div className="adm-card adm-kpi"><span className="adm-muted">Productos a la venta</span><b>{P.filter((p) => p.status === "available" && p.purchase_enabled).length} / {P.length}</b><Link className="adm-muted" href="/admin/products">Ver catálogo</Link></div>
      </div>
      <div className="adm-two">
        <section className="adm-card">
          <h2 className="adm-h2">Lo que falta para vender ({todo.length})</h2>
          {todo.length ? <ul className="adm-stack" style={{ margin: 0, paddingLeft: 18 }}>{todo.map(([t, href]) => <li key={t}><Link href={href}>{t}</Link></li>)}</ul> : <p className="adm-note">Todo listo.</p>}
        </section>
        <section className="adm-card">
          <h2 className="adm-h2">Últimos mensajes</h2>
          {(msgs.data ?? []).length ? (
            <ul className="adm-stack" style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {msgs.data!.map((m) => <li key={m.id}><Link href={`/admin/messages?id=${m.id}`}><b>{m.name}</b></Link> · {TOPIC_ES[m.topic] ?? m.topic} <Pill s={m.status} /><br /><span className="adm-muted">{when(m.created_at)}</span></li>)}
            </ul>
          ) : <p className="adm-muted">Sin mensajes todavía.</p>}
        </section>
      </div>
      <section style={{ marginTop: 24 }}>
        <h2 className="adm-h2">Catálogo</h2>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Producto</th><th>Estado</th><th className="adm-num">Precio</th></tr></thead>
          <tbody>{P.map((p) => <tr key={p.slug}><td><Link href={`/admin/products/${p.id}`}>{p.name}</Link></td><td><Pill s={p.status} /></td><td className="adm-num">{usd(p.retail_price)}</td></tr>)}</tbody>
        </table></div>
      </section>
    </>
  );
}
