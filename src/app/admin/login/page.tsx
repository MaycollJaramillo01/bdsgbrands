"use client";
import { useActionState, useState } from "react";
import { authAction, type AuthState } from "./actions";

export default function Login() {
  const [state, action, pending] = useActionState<AuthState, FormData>(authAction, { step: "signin" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const forbidden = typeof window !== "undefined" && new URLSearchParams(location.search).get("e") === "forbidden";

  return (
    <main className="adm-login">
      <form action={action} className="adm-card adm-stack" noValidate>
        <img src="/brand/bdsg-horizontal-negro.svg" alt="BDSG" width={120} height={35} />
        <h1 className="adm-h1">{state.step === "verify" ? "Confirma tu email" : mode === "signup" ? "Crear cuenta de admin" : "Entrar al panel"}</h1>
        {forbidden && <p className="adm-alert" role="alert">Esta cuenta no tiene acceso de administrador. Pide que añadan tu email a la lista de admins.</p>}
        {state.error && <p className="adm-alert" role="alert">{state.error}</p>}
        {state.info && <p className="adm-note" role="status">{state.info}</p>}

        {state.step === "verify" ? (
          <>
            <input type="hidden" name="mode" value="verify" />
            <input type="hidden" name="email" value={state.email} />
            <label className="adm-field">Código de 6 dígitos<input name="otp" inputMode="numeric" autoComplete="one-time-code" required maxLength={6} /></label>
          </>
        ) : (
          <>
            <input type="hidden" name="mode" value={mode} />
            <label className="adm-field">Email<input name="email" type="email" autoComplete="email" required defaultValue={state.email} /></label>
            <label className="adm-field">Contraseña<input name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={8} /></label>
          </>
        )}
        <button className="adm-btn adm-btn-primary" disabled={pending}>{pending ? "Un momento…" : state.step === "verify" ? "Confirmar" : mode === "signup" ? "Crear cuenta" : "Entrar"}</button>
        {state.step !== "verify" && (
          <button type="button" className="adm-link" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "¿Primera vez? Crea tu cuenta" : "Ya tengo cuenta"}
          </button>
        )}
        <p className="adm-muted">Solo los emails autorizados como administradores pueden entrar.</p>
      </form>
    </main>
  );
}
