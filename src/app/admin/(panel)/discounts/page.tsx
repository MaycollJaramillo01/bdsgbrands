import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/insforge/server";
import { Flash, Head, Pill, day, usd } from "../ui";
import { Confirm } from "../Confirm";

export const metadata = { title: "Descuentos" };

const back = (q: string) => { revalidatePath("/admin/discounts"); redirect(`/admin/discounts?${q}`); };

async function create(f: FormData) {
  "use server";
  const { client } = await requireAdmin();
  const s = (k: string) => String(f.get(k) ?? "").trim();
  const code = s("code").toUpperCase();
  const kind = s("kind");
  const value = Number(s("value"));
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return back("err=El%20c%C3%B3digo%20debe%20tener%203-32%20letras%2C%20n%C3%BAmeros%2C%20-%20o%20_.");
  if (!(value > 0) || (kind === "percent" && value > 100)) return back("err=Valor%20no%20v%C3%A1lido.");
  const { error } = await client.database.from("discounts").insert([{
    code, kind, value, min_subtotal: Number(s("min_subtotal") || 0),
    starts_at: s("starts_at") || null, ends_at: s("ends_at") || null, max_uses: s("max_uses") ? Number(s("max_uses")) : null,
  }]);
  back(error ? `err=${encodeURIComponent(/unique|duplicate/i.test(error.message ?? "") ? "Ese código ya existe." : error.message)}` : "ok=Descuento%20creado.");
}

async function toggle(f: FormData) {
  "use server";
  const { client } = await requireAdmin();
  const op = String(f.get("op"));
  const id = String(f.get("id"));
  const r = op === "delete" ? await client.database.from("discounts").delete().eq("id", id) : await client.database.from("discounts").update({ active: op === "on" }).eq("id", id);
  back(r.error ? `err=${encodeURIComponent(r.error.message)}` : "ok=Actualizado.");
}

export default async function Discounts({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const { client } = await requireAdmin();
  const { data, error } = await client.database.from("discounts").select("*").order("created_at", { ascending: false });

  return (
    <>
      <Head title="Descuentos" />
      <Flash sp={sp} />
      <div className="adm-two">
        <div>
          {error && <p className="adm-alert">{error.message}</p>}
          {data?.length ? (
            <div className="adm-table-wrap"><table className="adm-table">
              <thead><tr><th>Código</th><th>Descuento</th><th className="adm-num">Mínimo</th><th>Vigencia</th><th className="adm-num">Usos</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead>
              <tbody>{data.map((d) => (
                <tr key={d.id}>
                  <td><b>{d.code}</b></td>
                  <td>{d.kind === "percent" ? `${Number(d.value)}%` : usd(d.value)}</td>
                  <td className="adm-num">{Number(d.min_subtotal) ? usd(d.min_subtotal) : "—"}</td>
                  <td>{d.starts_at || d.ends_at ? `${day(d.starts_at)} → ${day(d.ends_at)}` : "Siempre"}</td>
                  <td className="adm-num">{d.uses}{d.max_uses ? ` / ${d.max_uses}` : ""}</td>
                  <td><Pill s={d.active ? "active" : "inactive"} label={d.active ? "Activo" : "Pausado"} /></td>
                  <td className="adm-row">
                    <form action={toggle}><input type="hidden" name="id" value={d.id} /><input type="hidden" name="op" value={d.active ? "off" : "on"} /><button className="adm-link">{d.active ? "Pausar" : "Activar"}</button></form>
                    <form action={toggle}><input type="hidden" name="id" value={d.id} /><input type="hidden" name="op" value="delete" /><Confirm className="adm-link" message={`¿Eliminar ${d.code}?`}>Eliminar</Confirm></form>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
          ) : <div className="adm-card adm-empty">Sin códigos de descuento.</div>}
        </div>
        <form action={create} className="adm-card adm-stack">
          <h2 className="adm-h2">Nuevo código</h2>
          <label className="adm-field">Código<input name="code" required placeholder="LAUNCH10" style={{ textTransform: "uppercase" }} /></label>
          <div className="adm-fields">
            <label className="adm-field">Tipo<select name="kind"><option value="percent">Porcentaje</option><option value="fixed">Monto fijo (USD)</option></select></label>
            <label className="adm-field">Valor<input name="value" inputMode="decimal" required /></label>
            <label className="adm-field">Pedido mínimo<input name="min_subtotal" inputMode="decimal" placeholder="0" /></label>
            <label className="adm-field">Usos máximos<input name="max_uses" inputMode="numeric" placeholder="Sin límite" /></label>
            <label className="adm-field">Desde<input type="datetime-local" name="starts_at" /></label>
            <label className="adm-field">Hasta<input type="datetime-local" name="ends_at" /></label>
          </div>
          <p className="adm-muted">Se valida en el servidor al pagar. No muestres precios tachados salvo que la comparación sea válida.</p>
          <button className="adm-btn adm-btn-primary">Crear</button>
        </form>
      </div>
    </>
  );
}
