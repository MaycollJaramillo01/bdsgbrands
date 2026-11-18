import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/insforge/server";
import type { Block } from "@/content/legal";
import { Flash, Head } from "../../ui";
import { fromText, toText } from "../format";

export const metadata = { title: "Política" };

const FORBIDDEN = /\bTBD\b|\bTODO\b|To confirm before launch|Draft — not yet in effect|Awaiting client|To confirm with BDSG/i;

async function save(f: FormData) {
  "use server";
  const { client } = await requireAdmin();
  const slug = String(f.get("slug"));
  const blocks = fromText(String(f.get("body") ?? ""));
  const draft = f.get("published") !== "on";
  const go = (q: string) => redirect(`/admin/policies/${slug}?${q}`);
  // Same rule as the build gate: a published policy can't carry placeholders.
  if (!draft) {
    if (blocks.some((b) => b.t === "tbc")) return go("err=Quita%20los%20puntos%20TBC%20antes%20de%20publicar.");
    if (FORBIDDEN.test(JSON.stringify(blocks))) return go("err=El%20texto%20contiene%20marcadores%20(TBD%2C%20TODO%E2%80%A6).%20Quita%20esos%20antes%20de%20publicar.");
    if (!String(f.get("effective") ?? "").trim()) return go("err=Pon%20la%20fecha%20de%20vigencia%20antes%20de%20publicar.");
  }
  const { error } = await client.database.from("policies").update({
    title: String(f.get("title") ?? "").trim(), summary: String(f.get("summary") ?? "").trim(),
    effective: String(f.get("effective") ?? "").trim() || (draft ? "Not yet in effect" : ""), draft, blocks,
  }).eq("slug", slug);
  revalidatePath("/admin/policies");
  go(error ? `err=${encodeURIComponent(error.message)}` : "ok=Guardada.%20Pulsa%20%C2%ABPublicar%20cambios%C2%BB%20para%20llevarla%20a%20la%20tienda.");
}

export default async function EditPolicy({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string>> }) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const { client } = await requireAdmin();
  const { data: p } = await client.database.from("policies").select("*").eq("slug", slug).maybeSingle();
  if (!p) notFound();
  return (
    <>
      <Head title={p.title} back="/admin/policies" />
      <Flash sp={sp} />
      <form action={save} className="adm-two">
        <input type="hidden" name="slug" value={p.slug} />
        <section className="adm-card adm-stack">
          <label className="adm-field">Texto
            <textarea name="body" defaultValue={toText(p.blocks as Block[])} style={{ minHeight: 560, fontFamily: "ui-monospace, monospace", fontSize: 14 }} />
            <small>Un bloque por párrafo, separados por una línea en blanco. <code>## Título</code>, <code>### Subtítulo</code>, <code>- Etiqueta: texto</code> para listas, <code>TBC: …</code> para datos pendientes.</small>
          </label>
        </section>
        <aside className="adm-card adm-stack" style={{ position: "sticky", top: 24 }}>
          <label className="adm-field">Título<input name="title" defaultValue={p.title} required /></label>
          <label className="adm-field">Resumen<textarea name="summary" rows={3} defaultValue={p.summary} /></label>
          <label className="adm-field">Vigente desde<input name="effective" defaultValue={p.draft ? "" : p.effective} placeholder="August 21, 2026" /></label>
          <label className="adm-check"><input type="checkbox" name="published" defaultChecked={!p.draft} /> Publicada (aprobada por legal)</label>
          <button className="adm-btn adm-btn-primary">Guardar</button>
          <a className="adm-muted" href={`/legal/${p.slug}`} target="_blank" rel="noopener">Ver en la tienda ↗</a>
        </aside>
      </form>
    </>
  );
}
