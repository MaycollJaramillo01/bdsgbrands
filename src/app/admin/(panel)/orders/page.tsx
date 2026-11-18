import Link from "next/link";
import { requireAdmin } from "@/lib/insforge/server";
import { Flash, Head, Pill, usd, when } from "../ui";

export const metadata = { title: "Pedidos" };

const FILTERS: [string, string][] = [["", "Todos"], ["to_ship", "Por enviar"], ["pending", "Pendientes de pago"], ["shipped", "Enviados"], ["refunded", "Reembolsados"], ["cancelled", "Cancelados"]];

export default async function Orders({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const { client } = await requireAdmin();
  let q = client.database.from("orders").select("id,customer_name,customer_email,items,subtotal,total,status,fulfillment_status,created_at").order("created_at", { ascending: false }).limit(200);
  if (sp.f === "to_ship") q = q.eq("status", "paid").eq("fulfillment_status", "unfulfilled");
  else if (sp.f === "shipped") q = q.eq("fulfillment_status", "shipped");
  else if (sp.f) q = q.eq("status", sp.f);
  if (sp.q) q = q.ilike("customer_email", `%${sp.q.replace(/[%_]/g, "")}%`);
  const { data, error } = await q;

  return (
    <div className="adm-wide">
      <Head title="Pedidos" />
      <Flash sp={sp} />
      <p className="adm-warn" style={{ marginBottom: 16 }}>Los pedidos llegan aquí cuando el checkout esté activo con un proveedor de pago (pendiente de confirmar por BDSG). Los reembolsos se hacen en el proveedor; aquí solo se registran.</p>
      {error && <p className="adm-alert">{error.message}</p>}
      <div className="adm-table-wrap">
        <div className="adm-toolbar"><nav className="adm-tabs" aria-label="Filtrar">{FILTERS.map(([k, l]) => <Link key={k} href={k ? `/admin/orders?f=${k}` : "/admin/orders"} aria-current={(sp.f ?? "") === k ? "page" : undefined}>{l}</Link>)}</nav><form role="search" className="adm-tsearch">{sp.f && <input type="hidden" name="f" value={sp.f} />}<input className="adm-input" name="q" placeholder="Buscar por email" defaultValue={sp.q} aria-label="Buscar pedidos por email" /></form></div>
      {data?.length ? (
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Pago</th><th>Envío</th><th className="adm-num">Artículos</th><th className="adm-num">Total</th></tr></thead>
          <tbody>{data.map((o) => (
            <tr key={o.id}>
              <td><Link href={`/admin/orders/${o.id}`}><b>#{String(o.id).slice(0, 8)}</b></Link></td>
              <td>{when(o.created_at)}</td>
              <td>{o.customer_name ?? "—"}<br /><span className="adm-muted">{o.customer_email ?? ""}</span></td>
              <td><Pill s={o.status} /></td>
              <td><Pill s={o.fulfillment_status} /></td>
              <td className="adm-num">{(o.items as { qty: number }[]).reduce((a, l) => a + (l.qty ?? 0), 0)}</td>
              <td className="adm-num">{usd(o.total ?? o.subtotal)}</td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <div className="adm-empty">Todavía no hay pedidos{sp.f ? " con este filtro" : ""}.</div>}
      </div>
    </div>
  );
}
