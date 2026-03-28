import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes (no auth required)
  if (
    pathname.startsWith("/auth") ||
    pathname === "/" ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/sites/") ||              // public site renderer
    pathname.startsWith("/api/chat/") ||           // public chatbot API
    pathname.startsWith("/api/analytics/") ||      // public analytics tracking
    pathname.startsWith("/api/payments/payme/webhook") // PayMe IPN webhook
  ) {
    return supabaseResponse;
  }

  // Not logged in
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Get user role from DB
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "client";

  // Admin routes - only admin
  if (pathname.startsWith("/admin") && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/client/dashboard";
    return NextResponse.redirect(url);
  }

  // Client routes - only client/editor
  if (pathname.startsWith("/client") && role === "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
