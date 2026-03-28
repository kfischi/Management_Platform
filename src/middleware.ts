import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Main app domain — requests from other hostnames are treated as custom client domains
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost";

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  // Strip port for comparison (handles localhost:3000)
  const hostnameWithoutPort = hostname.split(":")[0];

  // If the request is NOT from the main domain and NOT a static/internal Next.js path,
  // treat the hostname as a client custom domain and rewrite to /sites/[domain]
  const isMainDomain =
    hostnameWithoutPort === MAIN_DOMAIN ||
    hostnameWithoutPort === "localhost" ||
    hostnameWithoutPort.endsWith(".vercel.app");

  if (!isMainDomain) {
    // Rewrite to the site renderer, passing the custom domain as a query param
    // The site renderer will look up the site by custom_domain
    const url = request.nextUrl.clone();
    // Preserve the path (for sub-pages), strip leading slash for slug
    const slug = pathname === "/" ? "" : pathname.slice(1);
    url.pathname = `/sites/by-domain/${encodeURIComponent(hostnameWithoutPort)}${slug ? `/${slug}` : ""}`;
    return NextResponse.rewrite(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
