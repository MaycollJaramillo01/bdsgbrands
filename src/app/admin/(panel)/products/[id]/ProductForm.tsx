"use client";
import { useActionState, useState } from "react";
import { saveProduct, type FormState } from "../actions";
import { browserClient } from "@/lib/insforge/browser";

type Img = { src: string; width: number; height: number; key?: string };
type Row = Record<string, unknown> | null;

const STATUS: [string, string, string][] = [
  ["draft", "Borrador", "No aparece en la tienda."],
  ["coming_soon", "Próximamente", "Visible, botón «Notify me», sin compra."],
  ["waitlist", "Waitlist", "Visible con precio de lanzamiento y lista de espera, sin compra."],
  ["available", "A la venta", "Se puede comprar si activas la compra y el checkout está encendido."],
  ["sold_out", "Agotado", "Visible, «Notify me when back»."],
  ["discontinued", "Descontinuado", "Visible como no disponible."],
];

const dims = (file: File) => new Promise<{ width: number; height: number }>((ok) => {
  const i = new Image(); i.onload = () => ok({ width: i.naturalWidth, height: i.naturalHeight }); i.onerror = () => ok({ width: 800, height: 1200 }); i.src = URL.createObjectURL(file);
});

export function ProductForm({ row, isNew, others }: { row: Row; isNew: boolean; others: { slug: string; name: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {});
  const v = (k: string, d = "") => state.fields?.[k] ?? (row?.[k] == null ? d : Array.isArray(row[k]) ? (row[k] as string[]).join(", ") : String(row[k]));
  const checked = (k: string, d: boolean) => (state.fields ? state.fields[k] === "on" : row ? !!row[k] : d);
  const [images, setImages] = useState<Img[]>(() => { try { return JSON.parse(state.fields?.images ?? JSON.stringify(row?.images ?? [])); } catch { return []; } });
  const [status, setStatus] = useState(v("status", "draft"));
  const [up, setUp] = useState("");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUp("Subiendo…");
    const slug = (document.querySelector<HTMLInputElement>("input[name=slug]")?.value || "product").toLowerCase();
    for (const file of Array.from(files)) {
      if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) { setUp("Solo JPG, PNG, WebP o AVIF."); continue; }
      if (file.size > 8 * 1024 * 1024) { setUp("Cada imagen debe pesar menos de 8 MB."); continue; }
      const { width, height } = await dims(file);
      const key = `${slug}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]+/g, "-").toLowerCase()}`;
      const { data, error } = await browserClient().storage.from("products").upload(key, file);
      if (error || !data) { setUp(`No se pudo subir: ${error?.message ?? "error"}`); continue; }
      setImages((xs) => [...xs, { src: data.url, width, height, key: data.key }]);
    }
    setUp("Listo. Guarda el producto para conservar las imágenes.");
  }
  async function remove(i: number) {
    const img = images[i];
    if (!confirm("¿Quitar esta imagen?")) return;
    if (img.key) await browserClient().storage.from("products").remove(img.key);
    setImages((xs) => xs.filter((_, j) => j !== i));
  }
  const move = (i: number, d: number) => setImages((xs) => { const ys = [...xs]; const [x] = ys.splice(i, 1); ys.splice(Math.max(0, Math.min(ys.length, i + d)), 0, x); return ys; });

  return (
    <form id="product-form" action={action} className="adm-two" noValidate>
      <input type="hidden" name="_new" value={isNew ? "1" : "0"} />
      <input type="hidden" name="id" value={String(row?.id ?? "")} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <div className="adm-stack">
        {state.error && <p className="adm-alert" role="alert">{state.error}</p>}
        <section className="adm-card adm-stack">
          <h2 className="adm-h2">Básico</h2>
          <div className="adm-fields">
            <label className="adm-field">Nombre<input name="name" required defaultValue={v("name")} /></label>
            <label className="adm-field">Slug (URL)<input name="slug" required pattern="[a-z0-9-]+" defaultValue={v("slug")} /><small>/products/<b>slug</b></small></label>
            <label className="adm-field">Número<input name="sequence" defaultValue={v("sequence")} placeholder="01" /></label>
            <label className="adm-field">Rol<input name="role" defaultValue={v("role")} placeholder="Repair & Protect" /></label>
          </div>
          <label className="adm-field">Titular<input name="headline" defaultValue={v("headline")} placeholder="Hold the line." /></label>
          <label className="adm-field">Descripción corta<textarea name="short_description" rows={2} defaultValue={v("short_description")} /></label>
          <label className="adm-field">Descripción larga<textarea name="long_description" defaultValue={v("long_description")} /></label>
          <label className="adm-field">Cuándo usarlo<textarea name="when_to_use" rows={2} defaultValue={v("when_to_use")} /></label>
          <label className="adm-field">Ingredientes destacados<input name="featured_ingredients" defaultValue={v("featured_ingredients")} /><small>Separados por comas.</small></label>
        </section>

        <section className="adm-card adm-stack">
          <h2 className="adm-h2">Imágenes</h2>
          <div className="adm-images">
            {images.map((img, i) => (
              <figure key={img.src}>
                <img src={img.src} alt="" />
                <div className="adm-row" style={{ gap: 4 }}>
                  <button type="button" className="adm-link" onClick={() => move(i, -1)} aria-label="Mover a la izquierda">←</button>
                  <button type="button" className="adm-link" onClick={() => move(i, 1)} aria-label="Mover a la derecha">→</button>
                  <button type="button" className="adm-link" onClick={() => remove(i)}>Quitar</button>
                </div>
                {i === 0 && <span className="adm-muted">Principal</span>}
              </figure>
            ))}
          </div>
          <label className="adm-field">Subir imágenes<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(e) => upload(e.target.files)} /><small>JPG, PNG, WebP o AVIF, máx. 8 MB. La primera es la principal.</small></label>
          <p className="adm-muted" role="status">{up}</p>
          <label className="adm-field">Texto alternativo (accesibilidad)<input name="image_alt" defaultValue={v("image_alt")} /><small>Describe la foto principal en inglés, como la verá un lector de pantalla.</small></label>
        </section>

        <section className="adm-card adm-stack">
          <h2 className="adm-h2">Datos regulatorios</h2>
          <p className="adm-muted">Si un campo está vacío la tienda muestra un texto neutral («will be published before launch»). Nunca se inventa.</p>
          <label className="adm-field">INCI (lista completa de ingredientes)<textarea name="inci" defaultValue={v("inci")} /></label>
          <div className="adm-fields">
            <label className="adm-field">Tamaño<input name="size" defaultValue={v("size")} placeholder="6 fl oz / 177 mL" /></label>
          </div>
          <label className="adm-field">Modo de uso<textarea name="directions" rows={3} defaultValue={v("directions")} /></label>
          <label className="adm-field">Advertencias (tal como en el empaque)<textarea name="warnings" rows={3} defaultValue={v("warnings")} /></label>
        </section>

        <section className="adm-card adm-stack">
          <h2 className="adm-h2">SEO</h2>
          <label className="adm-field">Título SEO<input name="seo_title" maxLength={120} defaultValue={v("seo_title")} /></label>
          <label className="adm-field">Descripción SEO<textarea name="seo_description" rows={2} maxLength={300} defaultValue={v("seo_description")} /></label>
        </section>
      </div>

      <div className="adm-stack" style={{ position: "sticky", top: 24 }}>
        <section className="adm-card adm-stack">
          <h2 className="adm-h2">Estado y venta</h2>
          <label className="adm-field">Estado
            <select name="status" value={status} onChange={(e) => setStatus(e.target.value)}>{STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <small>{STATUS.find((x) => x[0] === status)?.[2]}</small>
          </label>
          <label className="adm-check"><input type="checkbox" name="purchase_enabled" defaultChecked={checked("purchase_enabled", false)} disabled={status !== "available"} /> Permitir compra</label>
          {status !== "available" && <p className="adm-muted">La compra solo se puede activar en «A la venta».</p>}
          <label className="adm-check"><input type="checkbox" name="waitlist_enabled" defaultChecked={checked("waitlist_enabled", true)} /> Lista de espera activa</label>
          <div className="adm-fields">
            <label className="adm-field">Precio (USD)<input name="retail_price" inputMode="decimal" defaultValue={v("retail_price")} /></label>
            <label className="adm-field">Precio miembro<input name="member_price" inputMode="decimal" defaultValue={v("member_price")} /></label>
            <label className="adm-field">Inventario<input name="inventory" inputMode="numeric" defaultValue={v("inventory")} /><small>Vacío = sin control.</small></label>
            <label className="adm-field">Fecha de lanzamiento<input type="date" name="availability_date" defaultValue={v("availability_date")} /></label>
          </div>
        </section>
        <section className="adm-card adm-stack">
          <h2 className="adm-h2">Organización</h2>
          <label className="adm-field">Orden en la tienda<input name="sort" inputMode="numeric" defaultValue={v("sort", "100")} /></label>
          <label className="adm-field">Productos relacionados<input name="related_products" defaultValue={v("related_products")} list="slugs" /><small>Slugs separados por comas: {others.map((o) => o.slug).join(", ") || "—"}</small></label>
          <label className="adm-field">ID de precio del proveedor<input name="provider_price_id" defaultValue={v("provider_price_id")} /><small>Se llena cuando haya proveedor de pago.</small></label>
        </section>
        <button className="adm-btn adm-btn-primary" disabled={pending}>{pending ? "Guardando…" : isNew ? "Crear producto" : "Guardar cambios"}</button>
        <p className="adm-muted">Guardar no cambia la tienda pública hasta que pulses «Publicar cambios».</p>
      </div>
    </form>
  );
}
