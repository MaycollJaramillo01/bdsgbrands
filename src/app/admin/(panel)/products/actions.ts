"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/insforge/server";
import { STATUSES, type Status } from "@/lib/products";

export type FormState = { error?: string; fields?: Record<string, string> };

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const money = (v: string) => (v === "" ? null : Math.round(Number(v) * 100) / 100);
const list = (v: string) => v.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
const orNull = (v: string) => (v === "" ? null : v);

export async function saveProduct(_: FormState, f: FormData): Promise<FormState> {
  const { client } = await requireAdmin();
  const isNew = s(f, "_new") === "1";
  const slug = s(f, "slug").toLowerCase();
  const status = s(f, "status") as Status;
  const retail = money(s(f, "retail_price"));
  const member = money(s(f, "member_price"));
  const purchase = f.get("purchase_enabled") === "on";
  const inv = s(f, "inventory");

  // Same hard rules as the database constraint and validateCatalog(), with readable messages.
  const errs: string[] = [];
  if (!/^[a-z0-9-]{1,40}$/.test(slug)) errs.push("El slug solo puede tener minúsculas, números y guiones.");
  if (!s(f, "name")) errs.push("El nombre es obligatorio.");
  if (!STATUSES.includes(status)) errs.push("Estado no válido.");
  if ([retail, member].some((v) => v != null && (Number.isNaN(v) || v < 0))) errs.push("Los precios deben ser números positivos.");
  if (purchase && status !== "available") errs.push("Solo se puede activar la compra si el estado es «A la venta».");
  if (purchase && retail == null) errs.push("Para activar la compra hace falta un precio.");
  if (member != null && retail != null && member > retail) errs.push("El precio de miembro no puede ser mayor que el normal.");
  if (inv !== "" && !/^\d+$/.test(inv)) errs.push("El inventario debe ser un número entero.");
  let images: unknown[] = [];
  try { images = JSON.parse(s(f, "images") || "[]"); } catch { errs.push("Imágenes no válidas."); }
  if (errs.length) return { error: errs.join(" "), fields: Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v)])) };

  const row = {
    slug, name: s(f, "name"), sequence: s(f, "sequence"), role: s(f, "role"), headline: s(f, "headline"), status,
    retail_price: retail, member_price: member, availability_date: orNull(s(f, "availability_date")),
    waitlist_enabled: f.get("waitlist_enabled") === "on", purchase_enabled: purchase, inventory: inv === "" ? null : Number(inv),
    featured_ingredients: list(s(f, "featured_ingredients")),
    inci: orNull(s(f, "inci")), size: orNull(s(f, "size")), directions: orNull(s(f, "directions")), warnings: orNull(s(f, "warnings")),
    short_description: s(f, "short_description"), long_description: s(f, "long_description"), when_to_use: s(f, "when_to_use"),
    seo_title: s(f, "seo_title"), seo_description: s(f, "seo_description"), images, image_alt: s(f, "image_alt"),
    related_products: list(s(f, "related_products")), provider_price_id: orNull(s(f, "provider_price_id")), sort: Number(s(f, "sort") || 100),
  };

  const res = isNew
    ? await client.database.from("products").insert([{ id: slug, ...row }]).select("id").single()
    : await client.database.from("products").update(row).eq("id", s(f, "id")).select("id").single();
  if (res.error) {
    const m = res.error.message ?? "";
    const msg = /duplicate|unique/i.test(m) ? "Ya existe un producto con ese slug." : /purchase_requires_available|member_not_above/i.test(m) ? "La base de datos rechazó la combinación de estado y precios." : m;
    return { error: msg, fields: Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v)])) };
  }
  revalidatePath("/admin/products");
  redirect(`/admin/products/${res.data.id}?ok=${encodeURIComponent("Guardado. Pulsa «Publicar cambios» para llevarlo a la tienda.")}`);
}

export async function deleteProduct(f: FormData) {
  const { client } = await requireAdmin();
  const id = s(f, "id");
  const { error } = await client.database.from("products").delete().eq("id", id);
  if (error) redirect(`/admin/products/${id}?err=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/products");
  redirect(`/admin/products?ok=${encodeURIComponent("Producto eliminado. Publica para quitarlo de la tienda.")}`);
}
