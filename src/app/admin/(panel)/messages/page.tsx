import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/insforge/server";
import { Flash, Head, Pill, TOPIC_ES, day, when } from "../ui";
import { Confirm } from "../Confirm";

export const metadata = { title: "Mensajes" };

async function act(f: FormData) {
  "use server";
  const { client } = await requireAdmin();
  const id = String(f.get("id"));
  const op = String(f.get("op"));
  const r = op === "delete"
    ? await client.database.from("contact_messages").delete().eq("id", id)
    : await client.database.from("contact_messages").update({ status: op === "reopen" ? "new" : "handled" }).eq("id", id);
  revalidatePath("/admin", "layout");
  redirect(`/admin/messages?${r.error ? `err=${encodeURIComponent(r.error.message)}` : `ok=${op === "delete" ? "Mensaje%20eliminado." : "Mensaje%20actualizado."}`}`);
}

export default async function Messages({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const { client } = await requireAdmin();
  let q = client.database.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
  if (sp.s !== "all") q = q.eq("status", sp.s === "handled" ? "handled" : "new");
  const { data, error } = await q;

  return (
    <>
      <Head title="Mensajes" />
      <Flash sp={sp} />
      <div className="adm-row" style={{ marginBottom: 16 }}>
        {[["", "Nuevos"], ["handled", "Atendidos"], ["all", "Todos"]].map(([k, l]) => <Link key={k} className="adm-btn" style={(sp.s ?? "") === k ? { background: "#e6e2d8" } : undefined} href={k ? `/admin/messages?s=${k}` : "/admin/messages"}>{l}</Link>)}
      </div>
      {error && <p className="adm-alert">{error.message}</p>}
      {data?.length ? (
        <div className="adm-stack">
          {data.map((m) => (
            <article key={m.id} className="adm-card adm-stack" id={m.id} style={sp.id === m.id ? { outline: "2px solid var(--adm-ink)" } : undefined}>
              <div className="adm-row" style={{ justifyContent: "space-between" }}>
                <div className="adm-row"><b>{m.name}</b><a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to BDSG")}`}>{m.email}</a><Pill s={m.topic === "reaction" ? "cancelled" : "x"} label={TOPIC_ES[m.topic] ?? m.topic} /><Pill s={m.status} /></div>
                <span className="adm-muted">{when(m.created_at)}</span>
              </div>
              {m.topic === "reaction" && <p className="adm-alert">Reporte de seguridad. Revisa y registra el caso según el proceso de producto.</p>}
              {(m.order_number || m.product || m.reaction_date) && <p className="adm-muted" style={{ margin: 0 }}>{[m.order_number && `Pedido: ${m.order_number}`, m.product && `Producto: ${m.product}`, m.reaction_date && `Fecha de reacción: ${day(m.reaction_date)}`].filter(Boolean).join(" · ")}</p>}
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{m.message}</p>
              <div className="adm-row">
                <form action={act}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="op" value={m.status === "new" ? "handled" : "reopen"} /><button className="adm-btn">{m.status === "new" ? "Marcar atendido" : "Reabrir"}</button></form>
                <form action={act}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="op" value="delete" /><Confirm message="¿Eliminar este mensaje? No se puede deshacer.">Eliminar</Confirm></form>
              </div>
            </article>
          ))}
        </div>
      ) : <div className="adm-card adm-empty">No hay mensajes {sp.s === "handled" ? "atendidos" : sp.s === "all" ? "" : "nuevos"}.</div>}
    </>
  );
}
