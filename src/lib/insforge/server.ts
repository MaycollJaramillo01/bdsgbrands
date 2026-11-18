import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@insforge/sdk/ssr";

/** Per-request InsForge client carrying the signed-in user's access token (RLS applies). */
export async function db() {
  return createServerClient({ cookies: await cookies() });
}

/**
 * Admin gate for every /admin page and server action. The database enforces the same rule through
 * RLS (public.is_admin()), so this is the UX layer, not the only one.
 */
export async function requireAdmin() {
  const client = await db();
  const { data: u } = await client.auth.getCurrentUser();
  const user = u?.user;
  if (!user) redirect("/admin/login");
  const { data: ok } = await client.database.rpc("is_admin");
  if (ok !== true) redirect("/admin/login?e=forbidden");
  return { client, user };
}
