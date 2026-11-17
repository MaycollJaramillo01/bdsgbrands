// ponytail: four formulas live in code; move to a DB table when the catalog grows past a handful.
export type Product = {
  slug: string;
  n: string;
  name: string;
  role: string;
  line: string;
  body: string;
  actives: string[];
  price: number | null; // null = Coming soon
  member: number | null;
  photo: string | null; // null = drawn tube
  stripePriceId?: string; // fill after `insforge payments prices create`
};

export const products: Product[] = [
  {
    slug: "barrier",
    n: "01",
    name: "Barrier",
    role: "Repair & Protect",
    line: "Holds the line against moisture loss.",
    body: "Skin takes the work too: sweat, chlorine, cold air, friction. Barrier helps it hold moisture so you can go again tomorrow.",
    actives: ["Goat milk", "Ceramide NP", "Rice peptides", "Panthenol", "Hyaluronic acid"],
    price: 33,
    member: 29.7,
    photo: "/img/sitio-actual-barrier.jpg",
  },
  {
    slug: "renewal",
    n: "02",
    name: "Renewal",
    role: "Renew & Revitalize",
    line: "Clears the surface. Keeps the comfort.",
    body: "A gentle reset for texture after weeks of hard sessions. Papain enzyme works on the surface while honey and aloe keep it comfortable.",
    actives: ["Niacinamide", "Honey", "Propolis", "Aloe", "Papain enzyme"],
    price: null,
    member: null,
    photo: null,
  },
  {
    slug: "calm",
    n: "03",
    name: "Calm",
    role: "Soothe & Calm",
    line: "A reset after stress, dryness and overexposure.",
    body: "For the days skin feels tight and worn. Beta-glucan and botanical oils settle dryness on the same goat milk base.",
    actives: ["Goat milk", "Beta-glucan", "Botanical oils", "Panthenol", "Adaptogens"],
    price: 35,
    member: 31.5,
    photo: "/img/sitio-actual-calm.jpg",
  },
  {
    slug: "recovery",
    n: "04",
    name: "Recovery",
    role: "Deep Recovery",
    line: "For skin after the session.",
    body: "Applied after the work. Magnesium PCA and menthol bring a cool finish; ginger and copaiba round out the comfort.",
    actives: ["Goat milk", "Magnesium PCA", "Menthol", "Ginger", "Copaiba"],
    price: null,
    member: null,
    photo: "/img/sitio-actual-recovery.jpg",
  },
];

export const money = (v: number) => `$${v.toFixed(2)}`;
export const bySlug = (s: string) => products.find((p) => p.slug === s);
