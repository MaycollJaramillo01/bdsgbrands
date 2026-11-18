"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import type { WaitlistTopic } from "@/lib/validation";
import { publicProducts } from "@/lib/products";

type State = "idle" | "loading" | "success" | "already" | "invalid" | "error" | "network";

const formulas = publicProducts.filter((p) => p.waitlistEnabled && p.status !== "available");

type Props = { cta: string; source: string; askName?: boolean } & ({ topic: WaitlistTopic; chooseFormula?: never } | { chooseFormula: true; topic?: never });

export function Waitlist({ topic: fixed, chooseFormula, cta, source, askName = false }: Props) {
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const id = useId();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading") return; // no double submit
    const form = e.currentTarget;
    const f = new FormData(form);
    const topic = fixed ?? String(f.get("topic") || "");
    track("join_waitlist_start", { topic, source });
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
        if (j.status === "success") track("join_waitlist_complete", { topic, source });
        return;
      }
      if (j.status === "invalid") {
        setErrors(j.errors ?? {}); setState("invalid");
        requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
        return;
      }
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
      {chooseFormula && (
        <div className="field">
          <label htmlFor={`${id}-tp`}>Formula</label>
          <select className="select" id={`${id}-tp`} name="topic" defaultValue={formulas[0]?.slug} aria-invalid={!!errors.topic} aria-describedby={errors.topic ? `${id}-topic-err` : undefined}>
            {formulas.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
          {err("topic")}
        </div>
      )}
      <div className="field">
        <label htmlFor={`${id}-em`}>Email <span className="muted">(required)</span></label>
        <div className="waitlist-row">
          <input className="input" id={`${id}-em`} name="email" type="email" required autoComplete="email" inputMode="email"
            aria-invalid={!!errors.email} aria-describedby={errors.email ? `${id}-email-err` : undefined} />
          <button className="btn btn-primary" disabled={busy}>{busy ? "Joining…" : cta}</button>
        </div>
        {err("email")}
      </div>
      <label className="check">
        <input type="checkbox" name="consent" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? `${id}-consent-err` : undefined} />
        <span>Email me when this formula launches. This doesn&apos;t sign me up for other marketing. Unsubscribe anytime. See the <Link className="inline" href="/legal/privacy">Privacy Policy</Link>.</span>
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
