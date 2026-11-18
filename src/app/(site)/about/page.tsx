import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Crumbs } from "@/components/Crumbs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About BDSG — Be D' Summit Greatness",
  description: "BDSG (Be D' Summit Greatness) makes performance skincare for people who train daily. Built for the Journey. Not the Title. Based in West Jordan, Utah.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <div className="container">
      <Crumbs items={[["/about", "About"]]} />
      <header className="page-hero read">
        <p className="eyebrow">About</p>
        <h1 className="h1" style={{ marginTop: 12 }}>{site.institutional}</h1>
        <p className="lead">BDSG stands for {site.longName}. The summit is the point, but the climb is where the work happens.</p>
      </header>
      <section className="split" aria-labelledby="why-h">
        <figure className="split-media"><Image src="/img/montana.jpg" alt="Hiker climbing a mountain ridge" width={512} height={288} sizes="(max-width: 1023px) 100vw, 50vw" style={{ aspectRatio: "16 / 9" }} /></figure>
        <div className="split-copy prose">
          <h2 id="why-h" className="h2">Why we exist</h2>
          <p style={{ marginTop: 16 }}>Active routines mean skin that is washed often and exposed to sweat, chlorine, cold air, wind and travel. Most skincare is made for a shelf and a slow morning. BDSG is made for the people who are already out the door.</p>
        </div>
      </section>
      <section className="section read prose" aria-labelledby="who-h">
        <h2 id="who-h" className="h2">Who we build for</h2>
        <p style={{ marginTop: 16 }}>People who keep showing up: the early training session, the lap swim before work, the long shift, the trip that never quite ends. Not only athletes, and not only on race day.</p>
      </section>
      <section className="section read prose" aria-labelledby="how-h">
        <h2 id="how-h" className="h2">How we think about formulation</h2>
        <p style={{ marginTop: 16 }}>Four formulas, one goat milk base, each with one job in the routine. Plain descriptions instead of big promises: we describe ingredients cosmetically and don&apos;t publish performance claims without support. Real availability: if something isn&apos;t on sale, the site says so.</p>
      </section>
      <section className="section read prose" aria-labelledby="co-h">
        <h2 id="co-h" className="h2">The company</h2>
        <p style={{ marginTop: 16 }}>{site.entity}, West Jordan, Utah, as stated in BDSG&apos;s published policies.</p>
        <p><Link href="/shop">Explore the formulas</Link> or <Link href="/contact">get in touch</Link>.</p>
      </section>
    </div>
  );
}
