// Provider-neutral, consent-gated analytics.
// Events go to window.dataLayer only after analytics consent. Vendors load only if their env ID exists.
// No PII ever: params are slugs, topics, sources and amounts. No "purchase" until a provider confirms a transaction.
export type Consent = { analytics: boolean; marketing: boolean; version: string; at: string };
export const CONSENT_KEY = "bdsg-consent";
export const CONSENT_V = "2026-11-18";

const GA = process.env.NEXT_PUBLIC_GA_ID || "";
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export const EVENTS = [
  "page_view", "view_product", "join_waitlist_start", "join_waitlist_complete", "contact_start", "contact_complete",
  "view_membership", "cart_open", "add_to_cart", "remove_from_cart", "begin_checkout", "purchase",
  "membership_enrollment_start", "membership_enrollment_complete",
] as const;
export type EventName = (typeof EVENTS)[number];

type W = Window & { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[]; fbq?: (...a: unknown[]) => void };

/** Global Privacy Control: treated as an opt-out of marketing/advertising cookies. */
export const gpc = () => typeof navigator !== "undefined" && (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;

export function readConsent(): Consent | null {
  try {
    const c = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null") as Consent | null;
    if (c?.version !== CONSENT_V) return null;
    return gpc() ? { ...c, marketing: false } : c;
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
  if (c?.analytics) w.dataLayer = w.dataLayer || [];
  if (c?.analytics && GA) {
    w.gtag = w.gtag || function (...a: unknown[]) { w.dataLayer!.push(a); };
    w.gtag("js", new Date());
    w.gtag("config", GA, { anonymize_ip: true });
    inject(`https://www.googletagmanager.com/gtag/js?id=${GA}`);
  }
  if (c?.marketing && !gpc() && PIXEL && !w.fbq) {
    const q: unknown[] = [];
    const fbq = (...a: unknown[]) => { q.push(a); };
    Object.assign(fbq, { queue: q, push: fbq, loaded: true, version: "2.0" });
    w.fbq = fbq;
    fbq("init", PIXEL);
    fbq("track", "PageView");
    inject("https://connect.facebook.net/en_US/fbevents.js");
  }
}

export function track(event: EventName, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  const c = readConsent();
  if (!c?.analytics) return;
  const w = window as W;
  w.dataLayer?.push({ event, ...params });
  if (w.gtag) w.gtag("event", event, params);
  if (c.marketing && w.fbq) w.fbq("trackCustom", event, params);
}

/** No consent UI unless a non-essential vendor is actually configured. */
export const trackers = { analytics: GA !== "", marketing: PIXEL !== "" };
export const hasTrackers = trackers.analytics || trackers.marketing;
