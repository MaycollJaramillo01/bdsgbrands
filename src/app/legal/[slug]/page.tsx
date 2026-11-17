import { notFound } from "next/navigation";
import Link from "next/link";
import { legal, legalOrder } from "@/content/legal";

export const generateStaticParams = () => legalOrder.map(([slug]) => ({ slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const d = legal[(await params).slug];
  return d ? { title: d.title, description: d.summary, alternates: { canonical: `/legal/${(await params).slug}` }, ...(d.draft ? { robots: { index: false, follow: true } } : {}) } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = legal[slug];
  if (!d) notFound();

  // Group consecutive list items into one <ul>.
  const out: React.ReactNode[] = [];
  let list: React.ReactNode[] = [];
  const flush = () => { if (list.length) { out.push(<ul key={`ul${out.length}`}>{list}</ul>); list = []; } };
  d.blocks.forEach((b, i) => {
    if (b.t === "li") { list.push(<li key={i}>{b.label && <b>{b.label} </b>}{b.text}</li>); return; }
    flush();
    if (b.t === "h2") out.push(<h2 key={i} className="h3">{b.text}</h2>);
    else if (b.t === "h3") out.push(<h3 key={i}>{b.text}</h3>);
    else if (b.t === "tbc") out.push(<p key={i} className="draft-item"><b>To confirm before launch:</b> {b.text}</p>);
    else out.push(<p key={i}>{b.text}</p>);
  });
  flush();

  return (
    <div className="container legal">
      <nav className="legal-nav" aria-label="Policies">
        <h2 className="h3">Policies</h2>
        <ul>
          {legalOrder.map(([s, label]) => (
            <li key={s}><Link href={`/legal/${s}`} aria-current={s === slug ? "page" : undefined}>{label}</Link></li>
          ))}
        </ul>
      </nav>
      <article className="legal-doc">
        <h1 className="h1">{d.title}</h1>
        <p className="lead">{d.summary}</p>
        <p className="small muted">Effective date: {d.effective}</p>
        {d.draft && <p className="draft" role="note"><b>Draft — not yet in effect.</b> This policy is waiting on details from BDSG and does not apply to any order yet.</p>}
        <div className="legal-body">{out}</div>
      </article>
    </div>
  );
}
