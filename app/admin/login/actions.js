"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(prevState, formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  // Only a path on this site, never an absolute URL or a protocol-relative
  // one — `next` arrives from the query string, so an unchecked value is an
  // open redirect straight off the login page.
  const requested = String(formData.get("next") || "/admin");
  const next = /^\/(?!\/)/.test(requested) ? requested : "/admin";

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  redirect(next);
}
