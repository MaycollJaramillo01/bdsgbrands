import { bySlug, type Slug } from "./products";

// Ingredient entity. Cosmetic, evidence-conscious descriptions only: what it is and why it's used.
// `in` is filtered to public catalog products, so removing or drafting a product in /admin never breaks a page.
const all: { name: string; body: string; in: Slug[] }[] = [
  { name: "Goat Milk", body: "The base of all four formulas. Naturally rich in fats and proteins, used for the soft, comfortable feel it leaves on skin.", in: ["barrier", "renewal", "calm", "recovery"] },
  { name: "Ceramide NP", body: "A lipid also found in skin's outer layer, used to support moisture retention.", in: ["barrier"] },
  { name: "Panthenol", body: "Provitamin B5, a humectant that helps skin hold water and feel comfortable.", in: ["barrier", "calm"] },
  { name: "Hyaluronic Acid", body: "A humectant that draws water to the skin's surface to help maintain hydration.", in: ["barrier"] },
  { name: "Niacinamide", body: "Vitamin B3, used in skincare for an even-looking, smooth surface.", in: ["renewal"] },
  { name: "Magnesium PCA", body: "A mineral salt, paired here with menthol and ginger for a cool, comfortable finish.", in: ["recovery"] },
];

export const ingredients = all
  .map((i) => ({ ...i, in: i.in.filter((s) => { const p = bySlug(s); return p && p.status !== "draft"; }) }))
  .filter((i) => i.in.length > 0);
