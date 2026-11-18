import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/insforge/server";
import { Flash, Head, Pill, when } from "../ui";
import { Confirm } from "../Confirm";

export const metadata = { title: "Waitlist" };

async function remove(f: FormData) {
  "use server";
  const { client } = await requireAdmin();
  const { error } = await client.database.from("waitlist").delete().eq("id", Number(f.get("id")));
  revalidatePath("/admin/waitlist");
  redirect(`/admin/waitlist?${error ? `err=${encodeURIComponent(error.message)}` : "ok=Registro%20eliminado."}`);
}

export default async function Waitlist({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const { client } = await requireAdmin();
  let q = client.database.from("waitlist").select("id,email,first_name,topic,source,status,consent_version,created_at").order("created_at", { ascending: false }).limit(500);
  if (sp.t) q = q.eq("topic", sp.t);
  if (sp.q) q = q.ilike("email", `%${sp.q.replace(/[%_]/g, "")}%`);
  const [{ data, error }, all] = await Promise.all([q, client.database.from("waitlist").select("topic").limit(10000)]);
  const counts = (all.data ?? []).reduce<Record<string, number>>((a, r) => ((a[r.topic] = (a[r.topic] ?? 0) + 1), a), {});

  return (
    <>
      <Head title="Waitlist"><a className="adm-btn" href={`/api/admin/waitlist.csv${sp.t ? `?t=${sp.t}` : ""}`}>Exportar CSV</a></Head>
      <Flash sp={sp} />
      <p className="adm-muted" style={{ marginBottom: 16 }}>Cada persona aceptó recibir un email cuando su fórmula salga. No las añadas a otro marketing sin un consentimiento nuevo.</p>
      <form className="adm-row" style={{ marginBottom: 16 }}>
        <select className="adm-input" style={{ maxWidth: 240 }} name="t" defaultValue={sp.t ?? ""} aria-label="Lista">
          <option value="">Todas las listas ({Object.values(counts).reduce((a, b) => a + b, 0)})</option>
          {Object.entries(counts).map(([t, n]) => <option key={t} value={t}>{t} ({n})</option>)}
        </select>
        <input className="adm-input" style={{ maxWidth: 240 }} name="q" placeholder="Buscar email" defaultValue={sp.q} aria-label="Buscar email" />
        <button className="adm-btn">Filtrar</button>
      </form>
      {error && <p className="adm-alert">{error.message}</p>}
      {data?.length ? (
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Email</th><th>Nombre</th><th>Lista</th><th>Origen</th><th>Estado</th><th>Fecha</th><th><span className="sr-only">Acciones</span></th></tr></thead>
          <tbody>{data.map((w) => (
            <tr key={w.id}>
              <td>{w.email}</td><td>{w.first_name ?? "—"}</td><td>{w.topic}</td><td className="adm-muted">{w.source ?? "—"}</td><td><Pill s={w.status} /></td><td>{when(w.created_at)}</td>
              <td><form action={remove}><input type="hidden" name="id" value={w.id} /><Confirm className="adm-link" message={`¿Eliminar ${w.email} de la lista? No se puede deshacer.`}>Eliminar</Confirm></form></td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <div className="adm-card adm-empty">Nadie en esta lista todavía.</div>}
    </>
  );
}
