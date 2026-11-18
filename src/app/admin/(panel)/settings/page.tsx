import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/insforge/server";
import { Flash, Head } from "../ui";

export const metadata = { title: "Ajustes" };

async function save(f: FormData) {
  "use server";
  const { client } = await requireAdmin();
  const s = (k: string) => String(f.get(k) ?? "").trim();
  const on = (k: string) => f.get(k) === "on";
  const num = (k: string, d: number) => (s(k) === "" ? d : Number(s(k)));
  const go = (q: string) => redirect(`/admin/settings?${q}`);
  const email = s("support_email");
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return go("err=Email%20de%20soporte%20no%20v%C3%A1lido.");
  const social = s("social").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const [label, href] = l.split("|").map((x) => x.trim()); return { label, href }; });
  if (social.some((x) => !x.label || !/^https:\/\//.test(x.href ?? ""))) return go("err=Cada%20red%20social%3A%20Nombre%20%7C%20https%3A%2F%2F%E2%80%A6");
  const effective = s("membership_effective_date") || null;
  if (on("membership_enrollment_live") && !effective) return go("err=Para%20abrir%20la%20inscripci%C3%B3n%20hace%20falta%20la%20fecha%20de%20vigencia%20de%20los%20t%C3%A9rminos%20aprobados.");
  const { error } = await client.database.from("site_settings").update({
    catalog_live: on("catalog_live"), checkout_live: on("checkout_live"), membership_enrollment_live: on("membership_enrollment_live"),
    standard_free_shipping_threshold: num("standard_free_shipping_threshold", 70), member_free_shipping_threshold: num("member_free_shipping_threshold", 50),
    support_email: email, privacy_policy_version: s("privacy_policy_version"), social,
    membership_initial_price: num("membership_initial_price", 55), membership_renewal_price: num("membership_renewal_price", 35),
    membership_discount_max: num("membership_discount_max", 10), membership_effective_date: effective,
  }).eq("id", 1);
  revalidatePath("/admin", "layout");
  go(error ? `err=${encodeURIComponent(error.message)}` : "ok=Ajustes%20guardados.%20Pulsa%20%C2%ABPublicar%20cambios%C2%BB%20para%20aplicarlos%20en%20la%20tienda.");
}

export default async function Settings({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const { client } = await requireAdmin();
  const { data: s } = await client.database.from("site_settings").select("*").eq("id", 1).single();
  if (!s) return <p className="adm-alert">No se encontraron los ajustes.</p>;
  const social = (s.social as { label: string; href: string }[]).map((x) => `${x.label} | ${x.href}`).join("\n");

  return (
    <>
      <Head title="Configuración"><button className="adm-btn adm-btn-primary" form="settings-form">Guardar</button></Head>
      <Flash sp={sp} />
      <form id="settings-form" action={save} className="adm-sets">
          <section className="adm-set"><div><h2 className="adm-h2">Tienda</h2><p className="adm-muted">Qué está activo en la tienda pública.</p></div><div className="adm-card adm-stack">
            <label className="adm-check"><input type="checkbox" name="catalog_live" defaultChecked={s.catalog_live} /> Catálogo visible (precios y botones)</label>
            <label className="adm-check"><input type="checkbox" name="checkout_live" defaultChecked={s.checkout_live} /> Checkout activo</label>
            <p className="adm-muted">Aunque lo actives, no se cobra nada hasta que se conecte un proveedor de pago (pendiente de BDSG). Un producto solo se vende si además está «A la venta» con la compra activada.</p>
            <label className="adm-check"><input type="checkbox" name="membership_enrollment_live" defaultChecked={s.membership_enrollment_live} /> Inscripción a Greatness abierta</label>
            <p className="adm-muted">Requiere términos aprobados (fecha de vigencia abajo), flujo de cancelación y reembolso, consentimiento de renovación y aviso de renovación.</p>
          </div></section>
          <section className="adm-set"><div><h2 className="adm-h2">Envío</h2><p className="adm-muted">Debe coincidir con la Política de envíos y los Términos de venta publicados.</p></div><div className="adm-card adm-stack">
            <div className="adm-fields">
              <label className="adm-field">Envío gratis desde (USD)<input name="standard_free_shipping_threshold" inputMode="decimal" defaultValue={s.standard_free_shipping_threshold} /></label>
              <label className="adm-field">Envío gratis miembros desde<input name="member_free_shipping_threshold" inputMode="decimal" defaultValue={s.member_free_shipping_threshold} /></label>
            </div>
          </div></section>
          <section className="adm-set"><div><h2 className="adm-h2">Greatness Program</h2><p className="adm-muted">Precios de la membresía y vigencia de sus términos.</p></div><div className="adm-card adm-stack">
            <div className="adm-fields">
              <label className="adm-field">Primer año (USD)<input name="membership_initial_price" inputMode="decimal" defaultValue={s.membership_initial_price} /></label>
              <label className="adm-field">Renovación anual<input name="membership_renewal_price" inputMode="decimal" defaultValue={s.membership_renewal_price} /></label>
              <label className="adm-field">Descuento máximo (%)<input name="membership_discount_max" inputMode="decimal" defaultValue={s.membership_discount_max} /></label>
              <label className="adm-field">Vigencia de los términos<input type="date" name="membership_effective_date" defaultValue={s.membership_effective_date ?? ""} /></label>
            </div>
          </div></section>
          <section className="adm-set"><div><h2 className="adm-h2">Contacto y privacidad</h2><p className="adm-muted">Cómo te contactan los clientes y qué versión de privacidad aceptan.</p></div><div className="adm-card adm-stack">
            <label className="adm-field">Email de soporte<input type="email" name="support_email" defaultValue={s.support_email} /><small>Vacío = no se muestra en la tienda.</small></label>
            <label className="adm-field">Versión de la política de privacidad<input name="privacy_policy_version" defaultValue={s.privacy_policy_version} /><small>Se guarda con cada alta en la waitlist.</small></label>
          </div></section>
          <section className="adm-set"><div><h2 className="adm-h2">Redes sociales</h2><p className="adm-muted">Enlaces que aparecen en el pie de la tienda.</p></div><div className="adm-card adm-stack">
            <label className="adm-field">Una por línea<textarea name="social" rows={6} defaultValue={social} /><small>Nombre | https://…</small></label>
          </div></section>
        <div className="adm-savebar"><button className="adm-btn adm-btn-primary">Guardar</button></div>
      </form>
    </>
  );
}
