import Link from "next/link";
// Shared admin bits: Spanish labels for stored values, formatting, pills.
export const STATUS_ES: Record<string, string> = {
  draft: "Borrador", coming_soon: "Próximamente", waitlist: "Waitlist", available: "A la venta", sold_out: "Agotado", discontinued: "Descontinuado",
  pending: "Pendiente de pago", paid: "Pagado", fulfilled: "Completado", cancelled: "Cancelado", refunded: "Reembolsado",
  unfulfilled: "Sin enviar", shipped: "Enviado", delivered: "Entregado", returned: "Devuelto",
  new: "Nuevo", handled: "Atendido", subscribed: "Suscrito", unsubscribed: "Baja",
};
export const TOPIC_ES: Record<string, string> = {
  product: "Producto", order: "Pedido", membership: "Greatness", wholesale: "Mayoreo", press: "Prensa", privacy: "Privacidad", reaction: "Reacción / seguridad", other: "Otro",
};

export const usd = (v: unknown) => (v == null || v === "" ? "—" : `$${Number(v).toFixed(2)}`);
export const when = (v: unknown) => (v ? new Date(String(v)).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Denver" }) : "—");
export const day = (v: unknown) => (v ? new Date(String(v)).toLocaleDateString("es-MX", { dateStyle: "medium", timeZone: "America/Denver" }) : "—");

export function Pill({ s, label }: { s: string; label?: string }) {
  return <span className="adm-pill" data-s={s}>{label ?? STATUS_ES[s] ?? s}</span>;
}

export function Head({ title, back, children }: { title: string; back?: string; children?: React.ReactNode }) {
  return <div className="adm-head"><div className="adm-title">{back && <Link className="adm-back" href={back} aria-label="Volver"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M16 10H4m5-5-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>}<h1 className="adm-h1">{title}</h1></div>{children && <div className="adm-row">{children}</div>}</div>;
}

export function Flash({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  if (sp.ok) return <p className="adm-note" role="status">{String(sp.ok)}</p>;
  if (sp.err) return <p className="adm-alert" role="alert">{String(sp.err)}</p>;
  return null;
}
