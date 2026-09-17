import { updateSession } from "@/lib/supabase/proxy-session";

export async function proxy(request) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
