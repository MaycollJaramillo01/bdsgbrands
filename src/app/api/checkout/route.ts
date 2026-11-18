import { NextResponse } from "next/server";
import { applyDiscount, getAdapter, validateCart } from "@/lib/commerce";
import { rateLimited } from "@/lib/validation";

const ip = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";

export async function POST(req: Request) {
  // CSRF: JSON-only + same-origin check. Browsers can't send cross-site JSON without a preflight we never allow.
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) return NextResponse.json({ ok: false, code: "invalid_cart", message: "Invalid origin." }, { status: 403 });
  if (!req.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ ok: false, code: "invalid_cart", message: "Invalid request." }, { status: 415 });
  if (rateLimited(`k:${ip(req)}`, 10)) return NextResponse.json({ ok: false, code: "provider_error", message: "Too many attempts. Try again shortly." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const cart = validateCart(body?.lines);
  if (!cart.ok) return NextResponse.json(cart, { status: cart.code === "unavailable_item" ? 409 : 400 });

  const discount = body?.discount ? await applyDiscount(body.discount, cart.subtotal) : null;
  if (body?.discount && !discount) return NextResponse.json({ ok: false, code: "invalid_cart", message: "That discount code isn't valid." }, { status: 400 });
  const res = await getAdapter().createCheckout(cart.lines, { origin: new URL(req.url).origin, orderId: crypto.randomUUID(), subtotal: cart.subtotal, discount });
  return NextResponse.json(res, { status: res.ok ? 200 : res.code === "checkout_unavailable" ? 503 : 502 });
}
