import Link from "next/link";
import { requireAdmin } from "@/lib/insforge/server";
import { Flash, Head, Pill, when } from "../ui";

export const metadata = { title: "Políticas" };

export default async function Policies({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const { client } = await requireAdmin();
  const { data } = await client.database.from("policies").select("slug,title,effective,draft,blocks,updated_at").order("sort");
  return (
    <>
      <Head title="Políticas" />
      <Flash sp={sp} />
      <p className="adm-muted" style={{ marginBottom: 16 }}>Texto legal. Cambia solo lo que haya aprobado legal. Una política en borrador nunca se muestra en la tienda, y no se puede publicar con puntos «TBC» pendientes.</p>
      <div className="adm-table-wrap"><table className="adm-table">
        <thead><tr><th>Política</th><th>Estado</th><th>Vigente desde</th><th className="adm-num">Pendientes</th><th>Editada</th></tr></thead>
        <tbody>{(data ?? []).map((p) => {
          const tbc = (p.blocks as { t: string }[]).filter((b) => b.t === "tbc").length;
          return (
            <tr key={p.slug}>
              <td><Link href={`/admin/policies/${p.slug}`}><b>{p.title}</b></Link><br /><span className="adm-muted">/legal/{p.slug}</span></td>
              <td><Pill s={p.draft ? "draft" : "published"} label={p.draft ? "Borrador" : "Publicada"} /></td>
              <td>{p.effective || "—"}</td><td className="adm-num">{tbc || "—"}</td><td>{when(p.updated_at)}</td>
            </tr>
          );
        })}</tbody>
      </table></div>
    </>
  );
}
