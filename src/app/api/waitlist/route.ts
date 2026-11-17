import { NextResponse } from "next/server";
import { insforge, ready } from "@/lib/insforge";
import { CONSENT_VERSION, parseWaitlist, rateLimited } from "@/lib/validation";

const ip = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
const isDuplicate = (e: { code?: string; message?: string }) => e.code === "23505" || /duplicate|unique/i.test(e.message ?? "");

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ status: "error", message: "Invalid request." }, { status: 400 });
  // Honeypot: bots fill the hidden field. Answer like a success so they learn nothing.
  if (body.company) return NextResponse.json({ status: "success" });
  if (rateLimited(`w:${ip(req)}`)) return NextResponse.json({ status: "error", message: "Too many attempts. Try again in a few minutes." }, { status: 429 });

  const parsed = parseWaitlist(body);
  if (!parsed.ok) return NextResponse.json({ status: "invalid", errors: parsed.errors }, { status: 422 });
  if (!ready) return NextResponse.json({ status: "error", message: "Sign-ups are not connected yet." }, { status: 503 });

  const { consent: _c, ...row } = parsed.data;
  void _c;
  const { error } = await insforge.database.from("waitlist").insert([
    { ...row, consent_timestamp: new Date().toISOString(), consent_version: CONSENT_VERSION },
  ]);
  if (error && isDuplicate(error)) return NextResponse.json({ status: "already" });
  if (error) return NextResponse.json({ status: "error", message: "We couldn't save that. Try again in a moment." }, { status: 502 });
  return NextResponse.json({ status: "success" });
}
