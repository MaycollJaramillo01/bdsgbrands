import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "BDSG — Performance Skincare on a Goat Milk Base", template: "%s | BDSG" },
  description: "Performance skincare built on goat milk for skin that trains, travels and works hard. Barrier and Calm are coming first. Join the waitlist.",
  icons: { icon: "/favicon.svg" },
  robots: site.indexable ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { siteName: "BDSG", type: "website", locale: "en_US", images: [{ url: "/img/sitio-actual-barrier.jpg", width: 800, height: 1200, alt: "BDSG Barrier tube" }] },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { themeColor: "#f7f5ef" };

// Public chrome (header, footer, bag, consent) lives in app/(site)/layout.tsx; /admin has its own.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body>{children}</body>
    </html>
  );
}
