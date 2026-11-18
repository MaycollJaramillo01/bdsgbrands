import Link from "next/link";
import { requireAdmin } from "@/lib/insforge/server";
import { Pill, TOPIC_ES, usd, when } from "./ui";

export const metadata = { title: "Inicio" };

export default async function Dashboard() {
  const { client } = await requireAdmin();
  const d = client.database;
  const week = new Date(Date.now() - 7 * 864e5).toISOString();
  const [products, settings, orders, wl, wlWeek, msgs, policies, newMsgs] = await Promise.all([
    d.from("products").select("id,slug,name,status,retail_price,inci,size,directions,warnings,images,image_alt,purchase_enabled").order("sort"),
    d.from("site_settings").select("*").eq("id", 1).single(),
    d.from("orders").select("id,total,subtotal,status,fulfillment_status,created_at").order("created_at", { ascending: false }).limit(200),
    d.from("waitlist").select("id", { count: "exact", head: true }),
    d.from("waitlist").select("id", { count: "exact", head: true }).gte("created_at", week),
    d.from("contact_messages").select("id,name,topic,created_at,status").order("created_at", { ascending: false }).limit(5),
    d.from("policies").select("slug,title,draft,blocks,effective"),
    d.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
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

  const fichas = P.filter((p) => p.status !== "draft" && missing(p).length).length;
  const borradores = (policies.data ?? []).filter((p) => p.draft || JSON.stringify(p).includes("[TEST DATA]")).length;
  const chips: [string, number, string][] = ([["Preparar pedidos", toShip, "/admin/orders?f=to_ship"], ["Responder mensajes", newMsgs.count ?? 0, "/admin/messages"], ["Completar fichas", fichas, "/admin/products"], ["Revisar políticas", borradores, "/admin/policies"]] as [string, number, string][]).filter((c) => c[1] > 0);

  return (
    <div className="adm-home">
      <h1 className="sr-only">Inicio</h1>
      <div className="adm-metrics" role="list" aria-label="Resumen">
        <Link role="listitem" href="/admin/orders"><span>Ventas pagadas</span><b>{usd(revenue)}</b></Link>
        <Link role="listitem" href="/admin/orders"><span>Pedidos</span><b>{paid.length}</b></Link>
        <Link role="listitem" href="/admin/waitlist"><span>Waitlist</span><b>{wl.count ?? 0} <small className="adm-muted">+{wlWeek.count ?? 0} en 7 días</small></b></Link>
        <Link role="listitem" href="/admin/products"><span>A la venta</span><b>{P.filter((p) => p.status === "available" && p.purchase_enabled).length} / {P.length}</b></Link>
      </div>
      <p className="adm-hello">¡Hola! Sigamos haciendo crecer BDSG.</p>
      <nav className="adm-chips" aria-label="Pendientes">
        {chips.length ? chips.map(([t, n, href]) => <Link key={t} href={href}>{t} <b>{n}</b></Link>) : <span className="adm-muted">Nada pendiente.</span>}
        <Link href="/admin/products/new">Nuevo producto</Link>
      </nav>
      <div className="adm-stack" style={{ gap: 16 }}>
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
        <section className="adm-table-wrap" aria-label="Catálogo"><table className="adm-table">
          <thead><tr><th>Producto</th><th>Estado</th><th className="adm-num">Precio</th></tr></thead>
          <tbody>{P.map((p) => <tr key={p.slug}><td><Link href={`/admin/products/${p.id}`}>{p.name}</Link></td><td><Pill s={p.status} /></td><td className="adm-num">{usd(p.retail_price)}</td></tr>)}</tbody>
        </table></section>
      </div>
    </div>
  );
}
