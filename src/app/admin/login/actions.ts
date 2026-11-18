"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";

export type AuthState = { step: "signin" | "verify"; email?: string; error?: string; info?: string };

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function authAction(_: AuthState, f: FormData): Promise<AuthState> {
  const auth = createAuthActions({ cookies: await cookies() });
  const mode = str(f, "mode");
  const email = str(f, "email").toLowerCase();

  if (mode === "verify") {
    const { error } = await auth.verifyEmail({ email, otp: str(f, "otp") });
    if (error) return { step: "verify", email, error: "That code didn't work. Check it and try again." };
    redirect("/admin");
  }

  const password = String(f.get("password") ?? "");
  if (!email || password.length < 8) return { step: "signin", email, error: "Enter your email and a password of at least 8 characters." };

  if (mode === "signup") {
    const { data, error } = await auth.signUp({ email, password });
    if (error) return { step: "signin", email, error: error.message || "Couldn't create the account." };
    if (data && "requireEmailVerification" in data && data.requireEmailVerification)
      return { step: "verify", email, info: "We emailed you a 6-digit code. Enter it to confirm your address." };
    redirect("/admin");
  }

  const { error } = await auth.signInWithPassword({ email, password });
  if (error) {
    if (/verif/i.test(error.message ?? "")) return { step: "verify", email, info: "Confirm your email with the code we sent you." };
    return { step: "signin", email, error: "Wrong email or password." };
  }
  redirect("/admin");
}

export async function signOutAction() {
  const auth = createAuthActions({ cookies: await cookies() });
  await auth.signOut();
  redirect("/admin/login");
}
