"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const groups: [string, [string, string, ("orders" | "messages")?][]][] = [
  ["Tienda", [["/admin", "Inicio"], ["/admin/products", "Productos"], ["/admin/orders", "Pedidos", "orders"], ["/admin/customers", "Clientes"], ["/admin/discounts", "Descuentos"]]],
  ["Audiencia", [["/admin/waitlist", "Waitlist"], ["/admin/messages", "Mensajes", "messages"]]],
  ["Sitio", [["/admin/policies", "Políticas"], ["/admin/settings", "Ajustes"]]],
];

export function Nav({ counts }: { counts: { orders: number; messages: number } }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  return (
    <>
      {groups.map(([g, items]) => (
        <nav key={g} className="adm-nav" aria-label={g}>
          <p className="adm-group">{g}</p>
          {items.map(([href, label, c]) => (
            <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}>
              {label}
              {c && counts[c] > 0 && <span className="adm-count" aria-label={`${counts[c]} pendientes`}>{counts[c]}</span>}
            </Link>
          ))}
        </nav>
      ))}
    </>
  );
}
