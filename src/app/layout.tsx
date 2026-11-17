import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CartButton, CartProvider } from "@/components/Cart";
import { Reveal } from "@/components/Reveal";
import { legalOrder } from "@/content/legal";

export const metadata: Metadata = {
  title: "BDSG · Performance skincare on a goat milk base",
  description: "Four formulas for skin that trains daily: Barrier, Renewal, Calm, Recovery. Built for the journey. Not the title.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <a className="skip" href="#main">Skip to content</a>
          <nav className="nav" aria-label="Main">
            <Link href="/" className="logo"><img src="/brand/bdsg-horizontal-plum.svg" alt="BDSG" width={150} height={44} /></Link>
            <Link className="navlink" href="/#formulas">Formulas</Link>
            <Link className="navlink" href="/#program">Greatness Program</Link>
            <Link className="navlink" href="/#questions">Questions</Link>
            <CartButton />
          </nav>
          <main id="main">{children}</main>
          <Reveal />
          <footer className="foot">
            <span>Performance skincare, Utah.</span>
            <span className="foot-links">
              <a href="https://www.instagram.com/bdsg.official/">Instagram</a>
              <a href="https://www.tiktok.com/@bdsg.official">TikTok</a>
              <a href="mailto:contact@bdsgbrands.com">Contact</a>
            </span>
            <span>© 2026 BDSG Brands, LLC</span>
            <ul className="foot-legal">
              {legalOrder.map(([s, label]) => <li key={s}><Link href={`/legal/${s}`}>{label}</Link></li>)}
            </ul>
            <p className="disclaimer">Cosmetic product. Not intended to diagnose, treat, cure, or prevent any disease.</p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
