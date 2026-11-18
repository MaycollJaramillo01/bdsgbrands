"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { bySlug, money } from "@/lib/products";
import { canBuy, ctaLabel } from "@/lib/availability";
import { track } from "@/lib/analytics";

type Line = { slug: string; qty: number };
type Ctx = { lines: Line[]; add: (slug: string) => void; open: () => void; count: number };
const CartCtx = createContext<Ctx>(null!);
export const useCart = () => useContext(CartCtx);

const KEY = "bdsg-cart";
// Lines for products that stopped being purchasable are dropped on load; the server re-checks at checkout.
const valid = (ls: Line[]) => ls.filter((l) => { const p = bySlug(l.slug); return p && canBuy(p) && l.qty > 0; });

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [say, setSay] = useState("");
  const dlg = useRef<HTMLDialogElement>(null);

  useEffect(() => { try { setLines(valid(JSON.parse(localStorage.getItem(KEY) || "[]"))); } catch {} }, []);
  const save = (next: Line[]) => { setLines(next); try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {} };

  const setQty = (slug: string, qty: number) => {
    const name = bySlug(slug)?.name;
    if (qty < 1) { save(lines.filter((l) => l.slug !== slug)); setSay(`${name} removed from bag.`); track("remove_from_cart", { item_id: slug }); return; }
    save(lines.map((l) => (l.slug === slug ? { ...l, qty: Math.min(qty, 10) } : l)));
    setSay(`${name} quantity ${Math.min(qty, 10)}.`);
  };
  const add = (slug: string) => {
    const p = bySlug(slug);
    if (!p || !canBuy(p)) return;
    const hit = lines.find((l) => l.slug === slug);
    save(hit ? lines.map((l) => (l.slug === slug ? { ...l, qty: Math.min(l.qty + 1, 10) } : l)) : [...lines, { slug, qty: 1 }]);
    setSay(`${p.name} added to bag.`);
    track("add_to_cart", { item_id: slug, value: p.retailPrice ?? 0, currency: "USD" });
    openBag();
  };
  // Native modal <dialog>: traps focus, closes on Escape and restores focus to the opener.
  const openBag = () => { if (!dlg.current?.open) { dlg.current?.showModal(); track("cart_open"); } };

  const subtotal = lines.reduce((s, l) => s + (bySlug(l.slug)?.retailPrice ?? 0) * l.qty, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  async function checkout() {
    setErr(""); setBusy(true);
    track("begin_checkout", { value: subtotal, currency: "USD" });
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lines }) });
      const j = await r.json().catch(() => ({ ok: false, message: "Checkout didn't open. Nothing has been charged." }));
      if (j.ok && j.url) { location.assign(j.url); return; }
      if (j.code === "unavailable_item" && j.slug) save(lines.filter((l) => l.slug !== j.slug));
      setErr(j.message ?? "Checkout didn't open. Nothing has been charged.");
    } catch { setErr("You seem to be offline. Nothing has been charged."); }
    setBusy(false);
  }

  return (
    <CartCtx.Provider value={{ lines, add, count, open: openBag }}>
      {children}
      <p className="sr-only" aria-live="polite">{say}</p>
      <dialog ref={dlg} className="drawer" aria-labelledby="bag-title" onClick={(e) => e.target === dlg.current && dlg.current.close()}>
        <div className="drawer-in">
          <div className="drawer-head">
            <h2 id="bag-title" className="h3">Your bag</h2>
            <button className="icon-btn" aria-label="Close bag" onClick={() => dlg.current?.close()}>
              <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true"><path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.8" /></svg>
            </button>
          </div>
          {lines.length === 0 ? (
            <div className="stack">
              <p>Your bag is empty.</p>
              <p className="muted">No formula is on sale yet. Join a waitlist on any product page to hear the day it launches.</p>
              <Link className="btn btn-secondary" href="/shop" onClick={() => dlg.current?.close()}>Explore the formulas</Link>
            </div>
          ) : (
            <ul className="bag-lines">
              {lines.map((l) => {
                const p = bySlug(l.slug)!;
                return (
                  <li key={l.slug}>
                    <b>{p.name}</b>
                    <span className="qty">
                      <button aria-label={`Remove one ${p.name}`} onClick={() => setQty(l.slug, l.qty - 1)}>−</button>
                      <output aria-label={`${p.name} quantity`}>{l.qty}</output>
                      <button aria-label={`Add one ${p.name}`} onClick={() => setQty(l.slug, l.qty + 1)}>+</button>
                    </span>
                    <span className="num">{money((p.retailPrice ?? 0) * l.qty)}</span>
                  </li>
                );
              })}
            </ul>
          )}
          {lines.length > 0 && (
            <div className="drawer-foot">
              <p className="card-row"><span>Subtotal</span><b className="num">{money(subtotal)}</b></p>
              <p className="small muted">Shipping and tax are calculated at checkout.</p>
              <button className="btn btn-primary btn-block" onClick={checkout} disabled={busy}>{busy ? "Opening checkout…" : "Check out"}</button>
              {err && <p role="alert" className="alert alert-error">{err}</p>}
              <p className="small muted">By checking out you agree to the <Link className="inline" href="/legal/terms">Terms of Sale</Link> and the <Link className="inline" href="/legal/returns">Return Policy</Link>.</p>
            </div>
          )}
        </div>
      </dialog>
    </CartCtx.Provider>
  );
}

export function CartButton() {
  const { count, open } = useCart();
  return (
    <button className="btn btn-secondary btn-sm" onClick={open} aria-haspopup="dialog">
      Bag <span className="bag-count"><span className="sr-only">, </span>{count}<span className="sr-only"> items</span></span>
    </button>
  );
}

/** Renders nothing unless the product is purchasable. */
export function AddButton({ slug }: { slug: string }) {
  const { add } = useCart();
  const p = bySlug(slug);
  if (!p || !canBuy(p)) return null;
  return <button className="btn btn-primary" onClick={() => add(slug)}>{ctaLabel(p)}</button>;
}
