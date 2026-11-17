"use client";
import { useState } from "react";
import { insforge, ready } from "@/lib/insforge";

export function Notify({ topic, label = "Get notified" }: { topic: string; label?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "err">("idle");
  const id = `email-${topic}`;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    setState("busy");
    const { error } = ready
      ? await insforge.database.from("waitlist").insert([{ email, topic }])
      : { error: new Error("backend not configured") };
    setState(error ? "err" : "done");
  }

  if (state === "done") return <p className="notify-done" role="status">You&apos;re on the list. One email at launch. Nothing else.</p>;
  return (
    <form className="notify" onSubmit={submit}>
      <label htmlFor={id} className="notify-label">Email me when it launches</label>
      <input id={id} name="email" type="email" required autoComplete="email" placeholder="you@example.com" aria-describedby={state === "err" ? `${id}-err` : undefined} />
      <button className="btn" disabled={state === "busy"}>{label}</button>
      {state === "err" && <p id={`${id}-err`} role="alert" className="small">That email didn&apos;t go through. Check the address and try again.</p>}
    </form>
  );
}
