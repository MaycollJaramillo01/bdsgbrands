"use client";
import { useState } from "react";

// Catalog, settings and policy edits are saved immediately but reach the public site on the next deploy.
export function PublishButton() {
  const [s, set] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");
  async function go() {
    set("busy");
    const r = await fetch("/api/admin/publish", { method: "POST", headers: { "content-type": "application/json" } }).catch(() => null);
    const j = await r?.json().catch(() => ({}));
    set(r?.ok ? "ok" : "err");
    setMsg(r?.ok ? "Publicando. La tienda se actualiza en 1–2 minutos." : j?.message ?? "No se pudo publicar.");
  }
  return (
    <div className="adm-stack" style={{ gap: 6 }}>
      <button className="adm-btn adm-btn-primary" onClick={go} disabled={s === "busy"}>{s === "busy" ? "Publicando…" : "Publicar cambios"}</button>
      <span role="status" className="adm-muted">{msg}</span>
    </div>
  );
}
