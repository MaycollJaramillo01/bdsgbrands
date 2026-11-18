import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/insforge/server";
import { Flash, Head, Pill, usd, when, STATUS_ES } from "../../ui";

export const metadata = { title: "Pedido" };

async function update(f: FormData) {
  "use server";
  const { client } = await requireAdmin();
  const id = String(f.get("id"));
  const s = (k: string) => String(f.get(k) ?? "").trim() || null;
  const { error } = await client.database.from("orders").update({
    status: s("status"), fulfillment_status: s("fulfillment_status"), tracking_number: s("tracking_number"), carrier: s("carrier"), notes: s("notes"),
  }).eq("id", id);
  revalidatePath(`/admin/orders/${id}`);
  redirect(`/admin/orders/${id}?${error ? `err=${encodeURIComponent(error.message)}` : "ok=Pedido%20actualizado."}`);
}

export default async function Order({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { client } = await requireAdmin();
  const { data: o } = await client.database.from("orders").select("*").eq("id", id).maybeSingle();
  if (!o) notFound();
  const items = o.items as { slug: string; name?: string; qty: number; unitPrice: number }[];
  const addr = o.shipping_address as Record<string, string> | null;

  return (
    <>
      <Head title={`Pedido #${String(o.id).slice(0, 8)}`} back="/admin/orders" />
      <Flash sp={sp} />
      <div className="adm-two">
        <div className="adm-stack">
          <section className="adm-card">
            <div className="adm-row" style={{ marginBottom: 12 }}><Pill s={o.status} /><Pill s={o.fulfillment_status} /><span className="adm-muted">{when(o.created_at)}</span></div>
            <table className="adm-table">
              <thead><tr><th>Producto</th><th className="adm-num">Cant.</th><th className="adm-num">Precio</th><th className="adm-num">Total</th></tr></thead>
              <tbody>{items.map((l, i) => <tr key={i}><td>{l.name ?? l.slug}</td><td className="adm-num">{l.qty}</td><td className="adm-num">{usd(l.unitPrice)}</td><td className="adm-num">{usd(l.qty * l.unitPrice)}</td></tr>)}</tbody>
              <tfoot>
                <tr><td colSpan={3}>Subtotal</td><td className="adm-num">{usd(o.subtotal)}</td></tr>
                {Number(o.discount_amount) > 0 && <tr><td colSpan={3}>Descuento {o.discount_code}</td><td className="adm-num">−{usd(o.discount_amount)}</td></tr>}
                <tr><td colSpan={3}>Envío</td><td className="adm-num">{usd(o.shipping_amount)}</td></tr>
                <tr><td colSpan={3}>Impuestos</td><td className="adm-num">{usd(o.tax_amount)}</td></tr>
                <tr><td colSpan={3}><b>Total</b></td><td className="adm-num"><b>{usd(o.total ?? o.subtotal)}</b></td></tr>
              </tfoot>
            </table>
          </section>
          <form action={update} className="adm-card adm-stack">
            <input type="hidden" name="id" value={o.id} />
            <h2 className="adm-h2">Gestionar</h2>
            <div className="adm-fields">
              <label className="adm-field">Pago<select name="status" defaultValue={o.status}>{["pending", "paid", "fulfilled", "cancelled", "refunded"].map((s) => <option key={s} value={s}>{STATUS_ES[s]}</option>)}</select></label>
              <label className="adm-field">Envío<select name="fulfillment_status" defaultValue={o.fulfillment_status}>{["unfulfilled", "shipped", "delivered", "returned"].map((s) => <option key={s} value={s}>{STATUS_ES[s]}</option>)}</select></label>
              <label className="adm-field">Paquetería<input name="carrier" defaultValue={o.carrier ?? ""} /></label>
              <label className="adm-field">Número de guía<input name="tracking_number" defaultValue={o.tracking_number ?? ""} /></label>
            </div>
            <label className="adm-field">Notas internas<textarea name="notes" defaultValue={o.notes ?? ""} /></label>
            <p className="adm-muted">Marcar «Reembolsado» no devuelve el dinero: hazlo primero en el proveedor de pago.</p>
            <div><button className="adm-btn adm-btn-primary">Guardar</button></div>
          </form>
        </div>
        <aside className="adm-card adm-stack">
          <h2 className="adm-h2">Cliente</h2>
          <p style={{ margin: 0 }}>{o.customer_name ?? "—"}<br />{o.customer_email ? <a href={`mailto:${o.customer_email}`}>{o.customer_email}</a> : "—"}</p>
          <h2 className="adm-h2">Dirección de envío</h2>
          <p style={{ margin: 0, whiteSpace: "pre-line" }}>{addr ? Object.values(addr).filter(Boolean).join("\n") : "—"}</p>
          <h2 className="adm-h2">Proveedor</h2>
          <p className="adm-muted" style={{ margin: 0 }}>{o.provider ?? "—"} {o.provider_ref ?? ""}</p>
        </aside>
      </div>
    </>
  );
}
