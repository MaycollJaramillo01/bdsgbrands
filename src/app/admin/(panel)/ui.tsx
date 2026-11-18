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

export function Head({ title, children }: { title: string; children?: React.ReactNode }) {
  return <div className="adm-head"><h1 className="adm-h1">{title}</h1>{children && <div className="adm-row">{children}</div>}</div>;
}

export function Flash({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  if (sp.ok) return <p className="adm-note" role="status">{String(sp.ok)}</p>;
  if (sp.err) return <p className="adm-alert" role="alert">{String(sp.err)}</p>;
  return null;
}
