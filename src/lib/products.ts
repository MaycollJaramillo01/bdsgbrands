// Single source of truth for the four formulas. Availability is data, never free text.
// ponytail: typed module, not a CMS — four products, one editor. Move to a DB table when the catalog grows.

export type Status = "coming_soon" | "waitlist" | "in_stock" | "low_stock" | "out_of_stock" | "discontinued";

export type Product = {
  id: string;
  slug: "barrier" | "renewal" | "calm" | "recovery";
  number: "01" | "02" | "03" | "04";
  name: string;
  category: "skincare";
  role: string; // published function line, e.g. "Repair & Protect"
  headline: string;
  shortDescription: string;
  longDescription: string;
  status: Status;
  price: number | null; // USD, published retail price
  memberPrice: number | null;
  currency: "USD";
  featuredIngredients: string[];
  inci: string | null; // BLOCKED: only from BDSG
  size: string | null; // BLOCKED: packaging conflict (6 oz vs 4 oz)
  directions: string | null; // BLOCKED
  warnings: string | null; // BLOCKED
  whenToUse: string;
  image: { src: string; alt: string; width: number; height: number } | null;
  seo: { title: string; description: string };
  related: Product["slug"];
  stripePriceId?: string;
  updatedAt: string;
};

export const products: Product[] = [
  {
    id: "bdsg-barrier",
    slug: "barrier",
    number: "01",
    name: "Barrier",
    category: "skincare",
    role: "Repair & Protect",
    headline: "Hold the line.",
    shortDescription: "Supports moisture retention with goat milk, Ceramide NP, panthenol and hyaluronic acid.",
    longDescription:
      "A daily formula built around goat milk, Ceramide NP, panthenol and hyaluronic acid to support moisture retention and everyday barrier care. Made for skin that takes on sweat, cold air, chlorine and repeated cleansing.",
    status: "waitlist",
    price: 33,
    memberPrice: 29.7,
    currency: "USD",
    featuredIngredients: ["Goat Milk", "Ceramide NP", "Rice Peptides", "Panthenol", "Hyaluronic Acid"],
    inci: null,
    size: null,
    directions: null,
    warnings: null,
    whenToUse: "Daily, as part of your morning or evening routine, and after cleansing on training days.",
    image: { src: "/img/sitio-actual-barrier.jpg", alt: "BDSG Barrier tube standing on stone beside rice and a dish of cream", width: 800, height: 1200 },
    seo: {
      title: "Barrier — Goat Milk & Ceramide NP Moisture Support",
      description: "BDSG Barrier: goat milk, Ceramide NP, panthenol and hyaluronic acid to support moisture retention. $33.00 at launch. Join the waitlist.",
    },
    related: "calm",
    updatedAt: "2026-11-17",
  },
  {
    id: "bdsg-renewal",
    slug: "renewal",
    number: "02",
    name: "Renewal",
    category: "skincare",
    role: "Renew & Revitalize",
    headline: "Clear the surface. Keep the comfort.",
    shortDescription: "Papain enzyme and niacinamide for surface renewal, with goat milk, honey and aloe for comfort.",
    longDescription:
      "Papain enzyme and niacinamide support surface renewal while goat milk, honey and aloe help maintain hydration and skin comfort.",
    status: "coming_soon",
    price: null,
    memberPrice: null,
    currency: "USD",
    featuredIngredients: ["Niacinamide", "Honey", "Propolis", "Aloe", "Papain Enzyme"],
    inci: null,
    size: null,
    directions: null,
    warnings: null,
    whenToUse: "When skin texture needs a reset between hard training weeks.",
    image: null,
    seo: {
      title: "Renewal — Niacinamide & Papain Enzyme Formula",
      description: "BDSG Renewal: niacinamide, papain enzyme, honey, propolis and aloe on a goat milk base. Coming soon. Get notified at launch.",
    },
    related: "barrier",
    updatedAt: "2026-11-17",
  },
  {
    id: "bdsg-calm",
    slug: "calm",
    number: "03",
    name: "Calm",
    category: "skincare",
    role: "Soothe & Calm",
    headline: "Reset after the day takes its toll.",
    shortDescription: "Beta-glucan, botanical oils and panthenol on goat milk for skin that feels dry, tight or overexposed.",
    longDescription:
      "A goat milk-based formula featuring beta-glucan, botanical oils, panthenol and adaptogens for skin that feels dry, tight or overexposed after long days and hard sessions.",
    status: "waitlist",
    price: 35,
    memberPrice: 31.5,
    currency: "USD",
    featuredIngredients: ["Goat Milk", "Beta-Glucan", "Botanical Oils", "Panthenol", "Adaptogens"],
    inci: null,
    size: null,
    directions: null,
    warnings: null,
    whenToUse: "After sun, wind, cold or a long day, whenever skin feels tight.",
    image: { src: "/img/sitio-actual-calm.jpg", alt: "BDSG Calm tube on stone with chia seeds, a glass of milk and dropper bottles", width: 800, height: 1200 },
    seo: {
      title: "Calm — Goat Milk & Beta-Glucan Comfort Formula",
      description: "BDSG Calm: goat milk, beta-glucan, botanical oils and panthenol for skin that feels dry or tight. $35.00 at launch. Join the waitlist.",
    },
    related: "recovery",
    updatedAt: "2026-11-17",
  },
  {
    id: "bdsg-recovery",
    slug: "recovery",
    number: "04",
    name: "Recovery",
    category: "skincare",
    role: "Deep Recovery",
    headline: "For skin after the session.",
    shortDescription: "Magnesium PCA, menthol and ginger on goat milk for a cool, comfortable finish after activity.",
    longDescription:
      "Goat milk, magnesium PCA, menthol, ginger and copaiba bring a cool, comfortable finish to post-activity skin care.",
    status: "coming_soon",
    price: null,
    memberPrice: null,
    currency: "USD",
    featuredIngredients: ["Goat Milk", "Magnesium PCA", "Menthol", "Ginger", "Copaiba"],
    inci: null,
    size: null,
    directions: null,
    warnings: null,
    whenToUse: "Right after training, once you've showered.",
    image: { src: "/img/sitio-actual-recovery.jpg", alt: "BDSG Recovery tube on stone beside ginger root and a glass of milk", width: 800, height: 1200 },
    seo: {
      title: "Recovery — Magnesium PCA & Menthol Post-Activity Formula",
      description: "BDSG Recovery: goat milk, magnesium PCA, menthol, ginger and copaiba for post-activity comfort. Coming soon. Get notified at launch.",
    },
    related: "renewal",
    updatedAt: "2026-11-17",
  },
];

/** Shop order from the brief: purchasable-first. */
export const shopOrder: Product["slug"][] = ["barrier", "calm", "renewal", "recovery"];

export const bySlug = (s: string) => products.find((p) => p.slug === s);
export const money = (v: number) => `$${v.toFixed(2)}`;
