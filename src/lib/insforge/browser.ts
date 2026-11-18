"use client";
import { createBrowserClient } from "@insforge/sdk/ssr";

// Used only for direct image uploads from /admin (storage RLS sees the signed-in admin).
let c: ReturnType<typeof createBrowserClient> | null = null;
export const browserClient = () => (c ??= createBrowserClient());
