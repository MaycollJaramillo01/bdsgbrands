"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { bySlug, money, products } from "@/lib/products";
import { insforge, ready } from "@/lib/insforge";

type Line = { slug: string; qty: number };
type Ctx = { lines: Line[]; add: (slug: string) => void; open: () => void; count: number };
const CartCtx = createContext<Ctx>(null!);
export const useCart = () => useContext(CartCtx);

const KEY = "bdsg-cart";
const FREE_SHIP = 70;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const dlg = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    try {
      setLines(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {}
  }, []);
  const save = (next: Line[]) => {
    setLines(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const setQty = (slug: string, qty: number) =>
    save(qty < 1 ? lines.filter((l) => l.slug !== slug) : lines.map((l) => (l.slug === slug ? { ...l, qty } : l)));
  const add = (slug: string) => {
    const hit = lines.find((l) => l.slug === slug);
    save(hit ? lines.map((l) => (l.slug === slug ? { ...l, qty: l.qty + 1 } : l)) : [...lines, { slug, qty: 1 }]);
    dlg.current?.showModal();
  };

  const subtotal = lines.reduce((s, l) => s + (bySlug(l.slug)?.price ?? 0) * l.qty, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  async function checkout() {
    setErr("");
    const items = lines.map((l) => ({ priceId: bySlug(l.slug)?.stripePriceId, quantity: l.qty }));
    if (!ready || items.some((i) => !i.priceId)) {
      setErr("Checkout opens at launch. Get notified and you will hear first.");
      return;
    }
    setBusy(true);
    const orderId = crypto.randomUUID();
    const { error: e1 } = await insforge.database.from("orders").insert([
      { id: orderId, items: lines, subtotal },
    ]);
    const { data, error } = e1
      ? { data: null, error: e1 }
      : await insforge.payments.stripe.createCheckoutSession("test", {
          mode: "payment",
          lineItems: items as { priceId: string; quantity: number }[],
          successUrl: `${location.origin}/checkout/success?order=${orderId}`,
          cancelUrl: `${location.origin}/`,
          metadata: { order_id: orderId },
        });
    setBusy(false);
    if (error || !data?.checkoutSession.url) {
      setErr("That didn't go through. Try again in a moment.");
      return;
    }
    save([]);
    location.assign(data.checkoutSession.url);
  }

  return (
    <CartCtx.Provider value={{ lines, add, count, open: () => dlg.current?.showModal() }}>
      {children}
      <dialog ref={dlg} className="cart" aria-labelledby="cart-title" onClick={(e) => e.target === dlg.current && dlg.current.close()}>
        <div className="cart-in">
          <header>
            <h2 id="cart-title" className="h3">Your bag</h2>
            <button className="link" onClick={() => dlg.current?.close()}>Close</button>
          </header>
          {lines.length === 0 ? (
            <p className="muted">Nothing here yet. {products[0].name} and {products[2].name} are ready.</p>
          ) : (
            <ul className="lines">
              {lines.map((l) => {
                const p = bySlug(l.slug)!;
                return (
                  <li key={l.slug}>
                    <span className="nm">{p.name}</span>
                    <span className="qty">
                      <button aria-label={`One less ${p.name}`} onClick={() => setQty(l.slug, l.qty - 1)}>−</button>
                      <output aria-live="polite">{l.qty}</output>
                      <button aria-label={`One more ${p.name}`} onClick={() => setQty(l.slug, l.qty + 1)}>+</button>
                    </span>
                    <span className="num">{money((p.price ?? 0) * l.qty)}</span>
                  </li>
                );
              })}
            </ul>
          )}
          {lines.length > 0 && (
            <footer>
              <p className="tot"><span>Subtotal</span><span className="num">{money(subtotal)}</span></p>
              <p className="muted small">
                {subtotal >= FREE_SHIP ? "Shipping is free on this order." : `${money(FREE_SHIP - subtotal)} more for free shipping. Members: free from $50.00.`}
              </p>
              <button className="btn wide" onClick={checkout} disabled={busy}>{busy ? "Opening checkout" : "Check out"}</button>
              {err && <p role="alert" className="small">{err}</p>}
              <p className="small muted">
                By checking out you agree to the <Link href="/legal/terms">Terms of sale</Link>. See <Link href="/legal/shipping">shipping</Link> and <Link href="/legal/returns">returns</Link>.
              </p>
            </footer>
          )}
        </div>
      </dialog>
    </CartCtx.Provider>
  );
}

export function CartButton() {
  const { count, open } = useCart();
  return <button className="navlink" onClick={open}>Bag ({count})</button>;
}

export function AddButton({ slug }: { slug: string }) {
  const { add } = useCart();
  return <button className="btn" onClick={() => add(slug)}>Add to bag</button>;
}
