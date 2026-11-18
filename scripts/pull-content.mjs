// Prebuild: snapshot the admin-managed content (catalog, settings, policies) from InsForge into src/data/*.json.
// The storefront stays fully static and every page reads the same snapshot, so a deploy is the only way
// content changes reach visitors (no stale mix). If InsForge is unreachable the committed snapshot is kept.
import fs from "node:fs";

const base = process.env.NEXT_PUBLIC_INSFORGE_URL;
const key = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
const out = new URL("../src/data/", import.meta.url);

async function get(path) {
  const r = await fetch(`${base}/api/database/records/${path}`, { headers: { Authorization: `Bearer ${key}` } });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r.json();
}

if (!base || !key) {
  console.warn("[pull-content] InsForge env missing; using committed snapshot.");
} else {
  try {
    const [products, settings, policies] = await Promise.all([
      get("products?order=sort.asc,name.asc"), // anon RLS already excludes drafts
      get("site_settings?id=eq.1"),
      get("policies?order=sort.asc"),
    ]);
    if (!Array.isArray(products) || !settings[0]) throw new Error("unexpected response shape");
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(new URL("catalog.json", out), JSON.stringify(products, null, 1));
    fs.writeFileSync(new URL("settings.json", out), JSON.stringify(settings[0], null, 1));
    fs.writeFileSync(new URL("policies.json", out), JSON.stringify(policies, null, 1));
    console.log(`[pull-content] ${products.length} products, ${policies.length} policies.`);
  } catch (e) {
    // A production build must not silently ship an old catalog.
    if (process.env.VERCEL_ENV === "production") throw e;
    console.warn(`[pull-content] ${e.message}; using committed snapshot.`);
  }
}
