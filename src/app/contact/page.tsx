import type { Metadata } from "next";
import { Crumbs } from "@/components/Crumbs";
import { ContactForm } from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact BDSG about products, orders, the Greatness Program, wholesale, press or product safety.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <div className="container">
      <Crumbs items={[["/contact", "Contact"]]} />
      <header className="page-hero read">
        <h1 className="h1">Contact</h1>
        <p className="lead">Write to us about products, orders, membership, wholesale or press. For a skin reaction, choose &quot;Skin reaction or product safety&quot;.</p>
        {site.contactEmail && <p style={{ marginTop: 16 }}>Or email <a className="inline" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.</p>}
      </header>
      <div className="read"><ContactForm /></div>
    </div>
  );
}
