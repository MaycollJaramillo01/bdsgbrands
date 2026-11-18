import Link from "next/link";
import { requireAdmin } from "@/lib/insforge/server";
import { signOutAction } from "../login/actions";
import { Nav } from "./Nav";
import { PublishButton } from "./PublishButton";

export const dynamic = "force-dynamic";

export default async function Panel({ children }: { children: React.ReactNode }) {
  const { client, user } = await requireAdmin();
  // Counts only on queues that need action.
  const [msgs, orders] = await Promise.all([
    client.database.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
    client.database.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid").eq("fulfillment_status", "unfulfilled"),
  ]);

  return (
    <div className="adm">
      <aside className="adm-side" aria-label="Admin navigation">
        <Link className="adm-brand" href="/admin"><img src="/favicon.svg" alt="" width={24} height={24} />BDSG <small>Admin</small></Link>
        <Nav counts={{ messages: msgs.count ?? 0, orders: orders.count ?? 0 }} />
        <div className="adm-side-foot">
          <PublishButton />
          <a href="/" target="_blank" rel="noopener">Ver tienda ↗</a>
          <span title={user.email}>{user.email}</span>
          <form action={signOutAction}><button className="adm-link">Cerrar sesión</button></form>
        </div>
      </aside>
      <main className="adm-main" id="main">{children}</main>
    </div>
  );
}
