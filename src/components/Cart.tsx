"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { bySlug, money } from "@/lib/products";
import { canBuy, ctaLabel } from "@/lib/availability";
import { insforge, ready } from "@/lib/insforge";
import { track } from "@/lib/analytics";

type Line = { slug: string; qty: number };
type Ctx = { lines: Line[]; add: (slug: string) => void; open: () => void; count: number };
const CartCtx = createContext<Ctx>(null!);
export const useCart = () => useContext(CartCtx);

const KEY = "bdsg-cart";
// Only lines for products that are actually purchasable survive a reload.
const valid = (ls: Line[]) => ls.filter((l) => { const p = bySlug(l.slug); return p && canBuy(p) && l.qty > 0; });

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const dlg = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    try { setLines(valid(JSON.parse(localStorage.getItem(KEY) || "[]"))); } catch {}
  }, []);
  const save = (next: Line[]) => {
    setLines(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  const setQty = (slug: string, qty: number) =>
    save(qty < 1 ? lines.filter((l) => l.slug !== slug) : lines.map((l) => (l.slug === slug ? { ...l, qty: Math.min(qty, 10) } : l)));
  const add = (slug: string) => {
    const p = bySlug(slug);
    if (!p || !canBuy(p)) return;
    const hit = lines.find((l) => l.slug === slug);
    save(hit ? lines.map((l) => (l.slug === slug ? { ...l, qty: Math.min(l.qty + 1, 10) } : l)) : [...lines, { slug, qty: 1 }]);
    track("add_to_cart", { item_id: slug, value: p.price ?? 0, currency: "USD" });
    dlg.current?.showModal();
  };

  const subtotal = lines.reduce((s, l) => s + (bySlug(l.slug)?.price ?? 0) * l.qty, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  async function checkout() {
    setErr("");
    const items = lines.map((l) => ({ priceId: bySlug(l.slug)?.stripePriceId, quantity: l.qty }));
    if (!ready || items.some((i) => !i.priceId)) {
      setErr("Checkout isn't open yet. Nothing has been charged.");
      return;
    }
    setBusy(true);
    track("begin_checkout", { value: subtotal, currency: "USD" });
    const orderId = crypto.randomUUID();
    const { error: e1 } = await insforge.database.from("orders").insert([{ id: orderId, items: lines, subtotal }]);
    const { data, error } = e1
      ? { data: null, error: e1 }
      : await insforge.payments.stripe.createCheckoutSession("test", {
          mode: "payment",
          lineItems: items as { priceId: string; quantity: number }[],
          successUrl: `${location.origin}/checkout/success?order=${orderId}`,
          cancelUrl: `${location.origin}/shop`,
          metadata: { order_id: orderId },
        });
    setBusy(false);
    if (error || !data?.checkoutSession.url) { setErr("Checkout didn't open. Nothing has been charged. Try again in a moment."); return; }
    location.assign(data.checkoutSession.url);
  }

  return (
    <CartCtx.Provider value={{ lines, add, count, open: () => dlg.current?.showModal() }}>
      {children}
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
              <Link className="btn btn-secondary" href="/shop" onClick={() => dlg.current?.close()}>Browse the formulas</Link>
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
                      <output aria-live="polite" aria-label={`${p.name} quantity`}>{l.qty}</output>
                      <button aria-label={`Add one ${p.name}`} onClick={() => setQty(l.slug, l.qty + 1)}>+</button>
                    </span>
                    <span className="num">{money((p.price ?? 0) * l.qty)}</span>
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
              <p className="small muted">
                By checking out you agree to the <Link className="inline" href="/legal/terms">Terms of Sale</Link> and the <Link className="inline" href="/legal/returns">Return Policy</Link>.
              </p>
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
    <button className="btn btn-secondary" style={{ minHeight: 40, padding: "0 14px" }} onClick={open} aria-label={`Bag, ${count} item${count === 1 ? "" : "s"}`}>
      Bag <span className="bag-count" aria-hidden="true">{count}</span>
    </button>
  );
}

/** Rendered only for purchasable products; callers fall back to the waitlist otherwise. */
export function AddButton({ slug }: { slug: string }) {
  const { add } = useCart();
  const p = bySlug(slug);
  if (!p || !canBuy(p)) return null;
  return <button className="btn btn-primary" onClick={() => add(slug)}>{ctaLabel(p)}</button>;
}
