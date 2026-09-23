import { createClient } from "@/lib/supabase/server";

// Who is signed in and what they may do. Read from the `staff` table, not from
// the session token: roles in user metadata would be self-grantable, and a
// table read also means a name or role change takes effect immediately rather
// than when the token next refreshes.
//
// Returns null for an authenticated account with no active staff row — which
// RLS already treats as having no access to anything.
export async function getStaff(client) {
  const supabase = client || (await createClient());
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return null;

  const { data } = await supabase
    .from("staff")
    .select("user_id, full_name, role, active")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data?.active) return null;
  return { userId: data.user_id, fullName: data.full_name, role: data.role };
}

export const isSuperAdmin = (staff) => staff?.role === "super_admin";
