"use client";
import { useState } from "react";
import Link from "next/link";
import { CONTACT_TOPICS } from "@/lib/validation";
import { products } from "@/lib/products";
import { track } from "@/lib/analytics";

type State = "idle" | "loading" | "success" | "invalid" | "error" | "network";

export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [id, setId] = useState("");
  const [topic, setTopic] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    if (state === "loading") return;
    track("contact_start", { topic });
    setState("loading"); setErrors({});
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (j.status === "success" && j.id) { setId(j.id); setState("success"); track("contact_complete", { topic }); return; }
      if (j.status === "invalid") {
        setErrors(j.errors ?? {}); setState("invalid");
        requestAnimationFrame(() => document.getElementById("contact-errors")?.focus());
        return;
      }
      setMsg(j.message ?? "Your message was not sent. Try again in a moment."); setState("error");
    } catch { setState("network"); }
  }

  if (state === "success")
    return (
      <div className="alert alert-success" role="status">
        <p><b>Message received.</b> We&apos;ll reply by email.</p>
        <p className="small" style={{ marginTop: 8 }}>Reference: <span className="num">{id.slice(0, 8).toUpperCase()}</span></p>
      </div>
    );

  const inv = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-err` : undefined });
  const err = (k: string) => errors[k] && <p id={`${k}-err`} className="err">{errors[k]}</p>;
  const busy = state === "loading";

  return (
    <form className="form-grid" onSubmit={submit} noValidate aria-busy={busy}>
      {state === "invalid" && (
        <div id="contact-errors" tabIndex={-1} className="alert alert-error full" role="alert">
          Check {Object.keys(errors).length === 1 ? "this field" : `these ${Object.keys(errors).length} fields`}: {Object.values(errors).join(" ")}
        </div>
      )}
      <div className="field"><label htmlFor="c-name">Name</label><input className="input" id="c-name" name="name" autoComplete="name" required maxLength={120} {...inv("name")} />{err("name")}</div>
      <div className="field"><label htmlFor="c-email">Email</label><input className="input" id="c-email" name="email" type="email" autoComplete="email" required {...inv("email")} />{err("email")}</div>
      <div className="field full">
        <label htmlFor="c-topic">Topic</label>
        <select className="select" id="c-topic" name="topic" required value={topic} onChange={(e) => setTopic(e.target.value)} {...inv("topic")}>
          <option value="" disabled>Choose a topic</option>
          {CONTACT_TOPICS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {err("topic")}
      </div>
      {topic === "reaction" && (
        <>
          <p className="notice full small">If the reaction is severe (swelling, trouble breathing), get medical help first. Choosing this topic flags your message as a safety report.</p>
          <div className="field">
            <label htmlFor="c-product">Product</label>
            <select className="select" id="c-product" name="product" defaultValue="">
              <option value="">Not sure</option>
              {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            </select>
          </div>
          <div className="field"><label htmlFor="c-date">When did it start? <span className="muted">(optional)</span></label><input className="input" id="c-date" name="reactionDate" type="date" {...inv("reactionDate")} />{err("reactionDate")}</div>
        </>
      )}
      {(topic === "order" || topic === "reaction") && (
        <div className="field full"><label htmlFor="c-order">Order number <span className="muted">(optional)</span></label><input className="input" id="c-order" name="orderNumber" maxLength={40} /></div>
      )}
      <div className="field full"><label htmlFor="c-msg">Message</label><textarea className="textarea" id="c-msg" name="message" required maxLength={5000} {...inv("message")} />{err("message")}</div>
      <div className="hp" aria-hidden="true"><label htmlFor="c-co">Company</label><input id="c-co" name="company" tabIndex={-1} autoComplete="off" /></div>
      <p className="small muted full">We use your details only to answer you. See the <Link className="inline" href="/legal/privacy">Privacy Policy</Link>.</p>
      <div className="full">
        <button className="btn btn-primary" disabled={busy}>{busy ? "Sending…" : "Send message"}</button>
      </div>
      {state === "error" && <p className="alert alert-error full" role="alert">{msg}</p>}
      {state === "network" && <p className="alert alert-error full" role="alert">You seem to be offline. Your message was not sent.</p>}
    </form>
  );
}
