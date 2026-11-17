import { NextResponse } from "next/server";
import { insforge, ready } from "@/lib/insforge";
import { parseContact, rateLimited } from "@/lib/validation";

const ip = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";

// ponytail: messages are stored with an ID; email/helpdesk forwarding waits on BDSG's destination (docs/BLOCKERS.md).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ status: "error", message: "Invalid request." }, { status: 400 });
  if (body.company) return NextResponse.json({ status: "success", id: crypto.randomUUID() });
  if (rateLimited(`c:${ip(req)}`, 3)) return NextResponse.json({ status: "error", message: "Too many messages. Try again in a few minutes." }, { status: 429 });

  const parsed = parseContact(body);
  if (!parsed.ok) return NextResponse.json({ status: "invalid", errors: parsed.errors }, { status: 422 });
  if (!ready) return NextResponse.json({ status: "error", message: "The contact form is not connected yet." }, { status: 503 });

  const id = crypto.randomUUID();
  const { error } = await insforge.database.from("contact_messages").insert([{ id, ...parsed.data }]);
  if (error) return NextResponse.json({ status: "error", message: "Your message was not sent. Try again in a moment." }, { status: 502 });
  return NextResponse.json({ status: "success", id });
}
