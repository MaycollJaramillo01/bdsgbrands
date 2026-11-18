"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Icon } from "./icons";

type C = "orders" | "messages";
const main: [string, string, string, C?][] = [
  ["/admin", "Inicio", "home"],
  ["/admin/orders", "Pedidos", "orders", "orders"],
  ["/admin/products", "Productos", "products"],
  ["/admin/customers", "Clientes", "customers"],
  ["/admin/discounts", "Descuentos", "discounts"],
];
const audience: [string, string, string, C?][] = [
  ["/admin/waitlist", "Waitlist", "waitlist"],
  ["/admin/messages", "Mensajes", "messages", "messages"],
  ["/admin/policies", "Políticas", "policies"],
];

export function Nav({ counts }: { counts: Record<C, number> }) {
  const path = usePathname();
  const router = useRouter();
  const search = useRef<HTMLInputElement>(null);
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  // Ctrl/⌘ K focuses the global search, like most commerce admins.
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); search.current?.focus(); search.current?.select(); } };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  const item = ([href, label, icon, c]: [string, string, string, C?]) => (
    <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}>
      <Icon name={icon} /><span>{label}</span>
      {c && counts[c] > 0 && <span className="adm-count"><span className="sr-only">, </span>{counts[c]}<span className="sr-only"> pendientes</span></span>}
    </Link>
  );

  return (
    <>
      <form role="search" className="adm-search" onSubmit={(e) => { e.preventDefault(); const q = search.current?.value.trim(); if (q) router.push(`/admin/search?q=${encodeURIComponent(q)}`); }}>
        <label className="sr-only" htmlFor="adm-q">Buscar en el panel</label>
        <Icon name="search" />
        <input id="adm-q" ref={search} name="q" placeholder="Buscar" autoComplete="off" defaultValue={path === "/admin/search" && typeof window !== "undefined" ? new URLSearchParams(location.search).get("q") ?? "" : ""} />
        <kbd aria-hidden="true">Ctrl K</kbd>
      </form>
      <nav className="adm-nav" aria-label="Tienda">{main.map(item)}</nav>
      <nav className="adm-nav" aria-labelledby="adm-g-aud"><p className="adm-group" id="adm-g-aud">Audiencia y contenido</p>{audience.map(item)}</nav>
      <nav className="adm-nav" aria-labelledby="adm-g-ch">
        <p className="adm-group" id="adm-g-ch">Canales de venta</p>
        <a href="/" target="_blank" rel="noopener"><Icon name="store" /><span>Tienda online</span><Icon name="external" /></a>
      </nav>
      <nav className="adm-nav adm-nav-foot" aria-label="Configuración">{item(["/admin/settings", "Configuración", "settings"])}</nav>
    </>
  );
}
