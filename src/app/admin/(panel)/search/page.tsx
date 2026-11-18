import Link from "next/link";
import { requireAdmin } from "@/lib/insforge/server";
import { Head, Pill, usd, when } from "../ui";

export const metadata = { title: "Buscar" };

export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  const { client } = await requireAdmin();
  const d = client.database;
  const like = `%${q.replace(/[%_,()]/g, " ")}%`;
  const [p, o, w, m] = q
    ? await Promise.all([
        d.from("products").select("id,name,status,retail_price").ilike("name", like).limit(10),
        d.from("orders").select("id,customer_name,customer_email,total,status,created_at").ilike("customer_email", like).limit(10),
        d.from("waitlist").select("id,email,topic,created_at").ilike("email", like).limit(10),
        d.from("contact_messages").select("id,name,email,status,created_at").ilike("email", like).limit(10),
      ])
    : [];
  const sections = [
    { t: "Productos", rows: (p?.data ?? []).map((r) => ({ k: r.id, href: `/admin/products/${r.id}`, a: r.name, b: usd(r.retail_price), s: r.status })) },
    { t: "Pedidos", rows: (o?.data ?? []).map((r) => ({ k: r.id, href: `/admin/orders/${r.id}`, a: r.customer_name || r.customer_email, b: `${usd(r.total)} · ${when(r.created_at)}`, s: r.status })) },
    { t: "Waitlist", rows: (w?.data ?? []).map((r) => ({ k: r.id, href: `/admin/waitlist`, a: r.email, b: `${r.topic} · ${when(r.created_at)}`, s: "" })) },
    { t: "Mensajes", rows: (m?.data ?? []).map((r) => ({ k: r.id, href: `/admin/messages?id=${r.id}`, a: `${r.name} (${r.email})`, b: when(r.created_at), s: r.status })) },
  ].filter((s) => s.rows.length);

  return (
    <>
      <Head title={q ? `Resultados para “${q}”` : "Buscar"} />
      {!q ? <p className="adm-muted">Escribe en la búsqueda (Ctrl K) un producto, email de cliente o mensaje.</p>
        : !sections.length ? <div className="adm-card adm-empty">Sin resultados. Prueba con parte del nombre o del email.</div>
        : <div className="adm-results">{sections.map((s) => (
            <section key={s.t} className="adm-table-wrap" aria-label={s.t}><table className="adm-table">
              <thead><tr><th colSpan={3}>{s.t}</th></tr></thead>
              <tbody>{s.rows.map((r) => <tr key={r.k}><td><Link href={r.href}>{r.a}</Link></td><td className="adm-muted">{r.b}</td><td className="adm-num">{r.s && <Pill s={r.s} />}</td></tr>)}</tbody>
            </table></section>))}</div>}
    </>
  );
}
