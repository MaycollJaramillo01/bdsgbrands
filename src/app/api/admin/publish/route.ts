import { NextResponse } from "next/server";
import { db } from "@/lib/insforge/server";
import { badOrigin, rateLimited } from "@/lib/validation";

// Triggers a Vercel deploy so the storefront rebuilds from the latest admin content.
// VERCEL_DEPLOY_HOOK_URL is a server-only secret (Vercel → Settings → Git → Deploy Hooks).
export async function POST(req: Request) {
  if (badOrigin(req)) return NextResponse.json({ message: "Invalid request." }, { status: 403 });
  const client = await db();
  const { data: ok } = await client.database.rpc("is_admin");
  if (ok !== true) return NextResponse.json({ message: "Not allowed." }, { status: 403 });
  if (rateLimited("publish", 6, 60_000)) return NextResponse.json({ message: "Espera un minuto antes de publicar otra vez." }, { status: 429 });
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) return NextResponse.json({ message: "Falta VERCEL_DEPLOY_HOOK_URL en Vercel." }, { status: 503 });
  const r = await fetch(hook, { method: "POST" }).catch(() => null);
  if (!r?.ok) return NextResponse.json({ message: "Vercel no aceptó la publicación." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
