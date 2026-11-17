"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartButton } from "./Cart";
import { anyPurchasable } from "@/lib/availability";
import { products } from "@/lib/products";

export const nav = [
  ["/shop", "Shop"],
  ["/science", "Science"],
  ["/greatness", "Greatness Program"],
  ["/about", "About"],
  ["/faq", "FAQ"],
] as const;

const showBag = anyPurchasable(products);

export function Header() {
  const path = usePathname();
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => dlg.current?.close(), [path]);
  const cur = (h: string) => (path === h || path.startsWith(h + "/") ? "page" : undefined);

  return (
    <header className="header">
      <div className="container header-in">
        <button className="icon-btn menu-btn" aria-label="Open menu" aria-haspopup="dialog" onClick={() => dlg.current?.showModal()}>
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M3 7h16M3 15h16" stroke="currentColor" strokeWidth="1.8" /></svg>
        </button>
        <nav className="nav-main" aria-label="Main">
          {nav.map(([h, l]) => <Link key={h} href={h} aria-current={cur(h)}>{l}</Link>)}
        </nav>
        <Link href="/" className="logo" aria-label="BDSG home"><img src="/brand/bdsg-horizontal-negro.svg" alt="" width={136} height={40} /></Link>
        <div className="nav-right">
          {showBag ? <CartButton /> : <Link className="btn btn-primary" href="/shop" style={{ minHeight: 40, padding: "0 16px" }}>Join the waitlist</Link>}
        </div>
      </div>
      <dialog ref={dlg} className="mobile-menu" aria-label="Menu">
        <div className="mobile-menu-in">
          <div className="header-in">
            <img src="/brand/bdsg-horizontal-negro.svg" alt="BDSG" width={120} height={34} />
            <button className="icon-btn" aria-label="Close menu" onClick={() => dlg.current?.close()}>
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.8" /></svg>
            </button>
          </div>
          <nav className="mobile-nav" aria-label="Mobile">
            <Link href="/" aria-current={path === "/" ? "page" : undefined}>Home</Link>
            {nav.map(([h, l]) => <Link key={h} href={h} aria-current={cur(h)}>{l}</Link>)}
            <Link href="/contact" aria-current={cur("/contact")}>Contact</Link>
          </nav>
          <div className="mobile-legal">
            <Link href="/legal/privacy">Privacy</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/returns">Returns</Link>
          </div>
        </div>
      </dialog>
    </header>
  );
}
