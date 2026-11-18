// Shared by the forms (client hints) and the API routes (the real check).
export const WAITLIST_TOPICS = ["barrier", "renewal", "calm", "recovery", "greatness-program", "launch"] as const;
export type WaitlistTopic = (typeof WAITLIST_TOPICS)[number];

export const CONTACT_TOPICS = [
  ["product", "Product question"],
  ["order", "Order support"],
  ["membership", "Greatness Program"],
  ["wholesale", "Wholesale"],
  ["press", "Press"],
  ["privacy", "Privacy request"],
  ["reaction", "Skin reaction or product safety"],
  ["other", "Other"],
] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number][0];

export const CONSENT_VERSION = "waitlist-2026-11-17";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
export const isEmail = (v: unknown): v is string => typeof v === "string" && v.length <= 254 && EMAIL.test(v.trim());

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export type Result<T> = { ok: true; data: T } | { ok: false; errors: Record<string, string> };

export function parseWaitlist(body: Record<string, unknown>): Result<{ email: string; first_name: string | null; topic: WaitlistTopic; source: string; consent: true }> {
  const errors: Record<string, string> = {};
  if (!isEmail(body.email)) errors.email = "Enter an email address like name@example.com.";
  if (!WAITLIST_TOPICS.includes(body.topic as WaitlistTopic)) errors.topic = "Unknown waitlist.";
  if (body.consent !== true) errors.consent = "Check the box so we can email you at launch.";
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      email: String(body.email).trim().toLowerCase(),
      first_name: str(body.firstName, 80) || null,
      topic: body.topic as WaitlistTopic,
      source: str(body.source, 120) || "site",
      consent: true,
    },
  };
}

export type ContactData = { name: string; email: string; topic: ContactTopic; order_number: string | null; message: string; product: string | null; reaction_date: string | null };

export function parseContact(body: Record<string, unknown>): Result<ContactData> {
  const errors: Record<string, string> = {};
  const name = str(body.name, 120);
  const message = str(body.message, 5000);
  const topic = body.topic as ContactTopic;
  if (!name) errors.name = "Enter your name.";
  if (!isEmail(body.email)) errors.email = "Enter an email address like name@example.com.";
  if (!CONTACT_TOPICS.some(([k]) => k === topic)) errors.topic = "Choose a topic.";
  if (message.length < 10) errors.message = "Tell us a little more (at least 10 characters).";
  const reaction_date = str(body.reactionDate, 10) || null;
  if (reaction_date && !/^\d{4}-\d{2}-\d{2}$/.test(reaction_date)) errors.reactionDate = "Use the date picker.";
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      name, email: String(body.email).trim().toLowerCase(), topic, message,
      order_number: str(body.orderNumber, 40) || null,
      product: topic === "reaction" ? str(body.product, 40) || null : null,
      reaction_date: topic === "reaction" ? reaction_date : null,
    },
  };
}

/** Fixed-window limiter. ponytail: per server instance; move to the DB or Upstash if abuse spans instances. */
const hits = new Map<string, { n: number; t: number }>();
export function rateLimited(key: string, max = 5, windowMs = 10 * 60_000, now = Date.now()) {
  const h = hits.get(key);
  if (!h || now - h.t > windowMs) { hits.set(key, { n: 1, t: now }); return false; }
  h.n++;
  return h.n > max;
}

/** CSRF guard for JSON endpoints: same-origin requests only, JSON content type only. */
export function badOrigin(req: Request) {
  const o = req.headers.get("origin");
  if (o && o !== new URL(req.url).origin) return true;
  return !req.headers.get("content-type")?.includes("application/json");
}
