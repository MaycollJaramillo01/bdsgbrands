"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import type { WaitlistTopic } from "@/lib/validation";

type State = "idle" | "loading" | "success" | "already" | "invalid" | "error" | "network";

export function Waitlist({ topic, cta, source, askName = false }: { topic: WaitlistTopic; cta: string; source: string; askName?: boolean }) {
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const id = useId();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("loading");
    setErrors({});
    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: f.get("email"), firstName: f.get("firstName"), topic, source,
          consent: f.get("consent") === "on", company: f.get("company"),
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (j.status === "success" || j.status === "already") {
        setState(j.status);
        if (j.status === "success") track("waitlist_signup", { topic, source });
        return;
      }
      if (j.status === "invalid") { setErrors(j.errors ?? {}); setState("invalid"); return; }
      setMsg(j.message ?? "Something went wrong. Try again in a moment.");
      setState("error");
    } catch {
      setState("network");
    }
  }

  if (state === "success")
    return <p className="alert alert-success" role="status">You&apos;re on the list. We&apos;ll email you when it launches.</p>;
  if (state === "already")
    return <p className="alert alert-info" role="status">You&apos;re already on this list. No need to sign up again.</p>;

  const err = (k: string) => errors[k] && <p id={`${id}-${k}-err`} className="err">{errors[k]}</p>;
  const busy = state === "loading";
  return (
    <form className="waitlist" onSubmit={submit} noValidate aria-busy={busy}>
      {askName && (
        <div className="field">
          <label htmlFor={`${id}-fn`}>First name <span className="muted">(optional)</span></label>
          <input className="input" id={`${id}-fn`} name="firstName" autoComplete="given-name" maxLength={80} />
        </div>
      )}
      <div className="field">
        <label htmlFor={`${id}-em`}>Email</label>
        <div className="waitlist-row">
          <input className="input" id={`${id}-em`} name="email" type="email" required autoComplete="email" inputMode="email"
            aria-invalid={!!errors.email} aria-describedby={errors.email ? `${id}-email-err` : undefined} />
          <button className="btn btn-primary" disabled={busy}>{busy ? "Joining…" : cta}</button>
        </div>
        {err("email")}
      </div>
      <label className="check">
        <input type="checkbox" name="consent" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? `${id}-consent-err` : undefined} />
        <span>Email me about this launch. Unsubscribe anytime. See the <Link className="inline" href="/legal/privacy">Privacy Policy</Link>.</span>
      </label>
      {err("consent")}
      <div className="hp" aria-hidden="true">
        <label htmlFor={`${id}-co`}>Company</label>
        <input id={`${id}-co`} name="company" tabIndex={-1} autoComplete="off" />
      </div>
      {state === "error" && <p className="alert alert-error" role="alert">{msg}</p>}
      {state === "network" && <p className="alert alert-error" role="alert">You seem to be offline. Check your connection and try again.</p>}
    </form>
  );
}
