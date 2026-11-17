// Consent-gated analytics. Loads nothing unless the env ID exists AND the visitor accepted analytics/marketing.
// Never send PII: event params are product slugs, topics and page sources only.
export type Consent = { analytics: boolean; marketing: boolean; version: string; at: string };
export const CONSENT_KEY = "bdsg-consent";
export const CONSENT_V = "2026-11-17";

const GA = process.env.NEXT_PUBLIC_GA_ID || "";
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

type W = Window & { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[]; fbq?: (...a: unknown[]) => void };

export function readConsent(): Consent | null {
  try {
    const c = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null") as Consent | null;
    return c?.version === CONSENT_V ? c : null;
  } catch { return null; }
}

function inject(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement("script");
  s.async = true; s.src = src;
  document.head.appendChild(s);
}

export function applyConsent(c: Consent | null) {
  const w = window as W;
  if (c?.analytics && GA) {
    w.dataLayer = w.dataLayer || [];
    w.gtag = w.gtag || function (...a: unknown[]) { w.dataLayer!.push(a); };
    w.gtag("js", new Date());
    w.gtag("config", GA, { anonymize_ip: true });
    inject(`https://www.googletagmanager.com/gtag/js?id=${GA}`);
  }
  if (c?.marketing && PIXEL && !w.fbq) {
    const q: unknown[] = [];
    const fbq = (...a: unknown[]) => { q.push(a); };
    Object.assign(fbq, { queue: q, push: fbq, loaded: true, version: "2.0" });
    w.fbq = fbq;
    fbq("init", PIXEL);
    fbq("track", "PageView");
    inject("https://connect.facebook.net/en_US/fbevents.js");
  }
}

export function track(event: string, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  const c = readConsent();
  const w = window as W;
  if (c?.analytics && w.gtag) w.gtag("event", event, params);
  if (c?.marketing && w.fbq) w.fbq("trackCustom", event, params);
}
