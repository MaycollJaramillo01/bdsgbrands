"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { applyConsent, CONSENT_KEY, CONSENT_V, readConsent, type Consent as C } from "@/lib/analytics";

const OPEN = "bdsg:consent-open";

export function Consent() {
  const [open, setOpen] = useState(false);
  const [manage, setManage] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    const c = readConsent();
    if (c) { setPrefs({ analytics: c.analytics, marketing: c.marketing }); applyConsent(c); } else setOpen(true);
    const reopen = () => { setManage(true); setOpen(true); };
    window.addEventListener(OPEN, reopen);
    return () => window.removeEventListener(OPEN, reopen);
  }, []);

  function save(p: { analytics: boolean; marketing: boolean }) {
    const prev = readConsent();
    const c: C = { ...p, version: CONSENT_V, at: new Date().toISOString() };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(c)); } catch {}
    setPrefs(p);
    // Withdrawing consent needs a reload so already-loaded tags stop.
    const withdrew = (prev?.analytics && !p.analytics) || (prev?.marketing && !p.marketing);
    applyConsent(c);
    setOpen(false); setManage(false);
    if (withdrew) location.reload();
  }

  if (!open) return null;
  return (
    <section className="consent" role="dialog" aria-modal="false" aria-labelledby="consent-h">
      <h2 id="consent-h" className="h4">Cookies, your call</h2>
      <p className="small" style={{ marginTop: 8 }}>
        Essential cookies keep the bag and this choice working. With your OK we also use analytics and marketing cookies. <Link className="inline" href="/legal/cookies">Cookie Policy</Link>
      </p>
      {manage && (
        <div className="consent-prefs">
          <label className="check"><input type="checkbox" checked disabled /> <span><b>Essential</b>. Always on.</span></label>
          <label className="check"><input type="checkbox" checked={prefs.analytics} onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })} /> <span><b>Analytics</b>. Anonymous visit counts (Google Analytics).</span></label>
          <label className="check"><input type="checkbox" checked={prefs.marketing} onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })} /> <span><b>Marketing</b>. Ad measurement (Meta Pixel).</span></label>
        </div>
      )}
      <div className="cluster">
        <button className="btn btn-secondary" onClick={() => save({ analytics: false, marketing: false })}>Reject all</button>
        {manage
          ? <button className="btn btn-secondary" onClick={() => save(prefs)}>Save choices</button>
          : <button className="btn btn-secondary" onClick={() => setManage(true)}>Manage</button>}
        <button className="btn btn-primary" onClick={() => save({ analytics: true, marketing: true })}>Accept all</button>
      </div>
    </section>
  );
}

export function ConsentLink() {
  return <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN))}>Cookie settings</button>;
}
