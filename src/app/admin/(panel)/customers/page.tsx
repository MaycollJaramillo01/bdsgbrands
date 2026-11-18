import Link from "next/link";
import { requireAdmin } from "@/lib/insforge/server";
import { Head, day, usd } from "../ui";

export const metadata = { title: "Clientes" };

export default async function Customers() {
  const { client } = await requireAdmin();
  const { data, error } = await client.database.rpc("admin_customers");
  const rows = (data ?? []) as { email: string; name: string | null; orders: number; spent: number; last_order: string; on_waitlist: boolean }[];

  return (
    <>
      <Head title="Clientes" />
      <p className="adm-muted" style={{ marginBottom: 16 }}>Cada persona que ha hecho un pedido, agrupada por email. Las personas que solo se apuntaron a la lista están en <Link href="/admin/waitlist">Waitlist</Link>.</p>
      {error && <p className="adm-alert">{error.message}</p>}
      {rows.length ? (
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Cliente</th><th className="adm-num">Pedidos</th><th className="adm-num">Gastado</th><th>Último pedido</th><th>En waitlist</th></tr></thead>
          <tbody>{rows.map((c) => (
            <tr key={c.email}>
              <td>{c.name ?? "—"}<br /><Link className="adm-muted" href={`/admin/orders?q=${encodeURIComponent(c.email)}`}>{c.email}</Link></td>
              <td className="adm-num">{c.orders}</td><td className="adm-num">{usd(c.spent)}</td><td>{day(c.last_order)}</td><td>{c.on_waitlist ? "Sí" : "No"}</td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <div className="adm-card adm-empty">Aún no hay clientes: aparecerán con el primer pedido.</div>}
    </>
  );
}
