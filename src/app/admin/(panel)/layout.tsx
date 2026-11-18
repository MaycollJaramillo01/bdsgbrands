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
  const initials = (user.email ?? "A").slice(0, 2).toUpperCase();

  return (
    <div className="adm">
      <a className="adm-skip" href="#main">Saltar al contenido</a>
      <aside className="adm-side" aria-label="Navegación del panel">
        <Link className="adm-brand" href="/admin"><img src="/brand/bdsg-horizontal-blanco.svg" alt="BDSG" width={84} height={25} /><span>Admin</span></Link>
        <Nav counts={{ messages: msgs.count ?? 0, orders: orders.count ?? 0 }} />
        <div className="adm-side-foot">
          <PublishButton />
          <details className="adm-account">
            <summary><span className="adm-avatar" aria-hidden="true">{initials}</span><span className="adm-account-name">BDSG Brands<small>{user.email}</small></span></summary>
            <form action={signOutAction}><button className="adm-menu-item">Cerrar sesión</button></form>
          </details>
        </div>
      </aside>
      <main className="adm-main" id="main" tabIndex={-1}><div className="adm-page">{children}</div></main>
    </div>
  );
}
