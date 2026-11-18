import rows from "../data/policies.json";

// Policy texts live in the `policies` table, edited in /admin → Policies, snapshotted at build.
// Blocks typed "tbc" are facts BDSG must supply; a policy marked draft never renders publicly
// (see src/app/legal/[slug]/page.tsx) and the unit tests fail the build on draft wording in a published one.
export type Block = { t: "h2" | "h3" | "p" | "li" | "tbc"; text: string; label?: string };
export type Doc = { title: string; effective: string; summary: string; blocks: Block[]; draft?: boolean };
type Row = Doc & { slug: string; sort: number };

const LABELS: Record<string, string> = { shipping: "Shipping", returns: "Returns & refunds", membership: "Membership terms", terms: "Terms of sale", privacy: "Privacy", cookies: "Cookies" };

export const legal: Record<string, Doc> = Object.fromEntries((rows as Row[]).map((r) => [r.slug, { title: r.title, effective: r.effective, summary: r.summary, blocks: r.blocks, draft: r.draft }]));
export const legalOrder: [string, string][] = (rows as Row[]).map((r) => [r.slug, LABELS[r.slug] ?? r.title]);
