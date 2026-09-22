import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Refreshes the Supabase auth cookie on every request under /admin, and
// gates the whole section behind a session. Called from the root proxy.js
// (Next.js 16 renamed middleware.js -> proxy.js).
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getClaims() validates the JWT server-side; getSession() does not and
  // can silently trust a stale/forged cookie.
  const { data } = await supabase.auth.getClaims();
  const isAuthed = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (!isAuthed && !isLoginPage) {
    const url = request.nextUrl.clone();
    // Keep the query string in `next`: /admin?tab=ship must come back to the
    // Shipments tab after signing in, not to the dashboard. The original
    // params are then cleared so they don't also hang off the login URL.
    const target = `${pathname}${request.nextUrl.search}`;
    url.pathname = "/admin/login";
    url.search = "";
    url.searchParams.set("next", target);
    return NextResponse.redirect(url);
  }

  if (isAuthed && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
