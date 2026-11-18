import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/insforge/server";
import { Flash, Head } from "../../ui";
import { ProductForm } from "./ProductForm";
import { deleteProduct } from "../actions";
import { Confirm } from "../../Confirm";

export const metadata = { title: "Producto" };

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { client } = await requireAdmin();
  const isNew = id === "new";
  const [{ data: p }, { data: all }] = await Promise.all([
    isNew ? Promise.resolve({ data: null }) : client.database.from("products").select("*").eq("id", id).maybeSingle(),
    client.database.from("products").select("slug,name").order("sort"),
  ]);
  if (!isNew && !p) notFound();

  return (
    <>
      <Head title={isNew ? "Agregar producto" : p!.name} back="/admin/products">
        {!isNew && <a className="adm-btn" href={`/products/${p!.slug}`} target="_blank" rel="noopener">Ver en tienda ↗</a>}
        <button className="adm-btn adm-btn-primary" form="product-form">{isNew ? "Guardar" : "Guardar"}</button>
      </Head>
      <Flash sp={sp} />
      <ProductForm row={p} isNew={isNew} others={(all ?? []).filter((o) => o.slug !== p?.slug)} />
      {!isNew && (
        <form action={deleteProduct} className="adm-danger-zone">
          <input type="hidden" name="id" value={p!.id} />
          <Confirm className="adm-btn adm-btn-critical" message={`¿Eliminar ${p!.name}? No se puede deshacer. Si solo quieres ocultarlo, cambia el estado a «Borrador».`}>Eliminar producto</Confirm>
        </form>
      )}
    </>
  );
}
