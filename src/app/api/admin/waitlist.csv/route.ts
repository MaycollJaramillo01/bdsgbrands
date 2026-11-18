import { db } from "@/lib/insforge/server";

// Admin-only CSV export of the waitlist (RLS returns nothing to non-admins).
export async function GET(req: Request) {
  const client = await db();
  const { data: ok } = await client.database.rpc("is_admin");
  if (ok !== true) return new Response("Not allowed", { status: 403 });
  const t = new URL(req.url).searchParams.get("t");
  let q = client.database.from("waitlist").select("email,first_name,topic,source,status,consent_timestamp,consent_version,privacy_version,created_at").order("created_at").limit(50000);
  if (t) q = q.eq("topic", t);
  const { data, error } = await q;
  if (error) return new Response("Export failed", { status: 500 });
  const cols = ["email", "first_name", "topic", "source", "status", "consent_timestamp", "consent_version", "privacy_version", "created_at"] as const;
  // Quote every cell; neutralise spreadsheet formulas.
  const cell = (v: unknown) => { const s = v == null ? "" : String(v); return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`; };
  const csv = [cols.join(","), ...(data ?? []).map((r) => cols.map((c) => cell((r as Record<string, unknown>)[c])).join(","))].join("\r\n");
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="bdsg-waitlist${t ? `-${t}` : ""}.csv"`, "cache-control": "no-store" } });
}
