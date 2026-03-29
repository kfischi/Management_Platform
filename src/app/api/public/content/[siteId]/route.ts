/**
 * Public Content API
 * Used by the client's Next.js websites to fetch their CMS content.
 * No authentication required — content is public.
 *
 * GET /api/public/content/[siteId]
 *   Returns all published pages + blocks + settings for a site.
 *
 * GET /api/public/content/[siteId]?page=home
 *   Returns a single page with its blocks.
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const url = new URL(_req.url);
  const pageSlug = url.searchParams.get("page");

  const supabase = await createClient();

  if (pageSlug) {
    // Return single page + its blocks
    const { data: page, error: pageError } = await supabase
      .from("site_pages")
      .select("*")
      .eq("site_id", siteId)
      .eq("slug", pageSlug)
      .eq("is_published", true)
      .single();

    if (pageError || !page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const typedPage = page as { id: string; [key: string]: unknown };

    const { data: blocks } = await supabase
      .from("content_blocks")
      .select("*")
      .eq("page_id", typedPage.id)
      .eq("is_visible", true)
      .order("order_index", { ascending: true });

    return NextResponse.json(
      { page, blocks: blocks ?? [] },
      {
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  // Return all published pages + blocks + settings
  const { data: pages } = await supabase
    .from("site_pages")
    .select("*")
    .eq("site_id", siteId)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("*")
    .eq("site_id", siteId)
    .eq("is_visible", true)
    .order("order_index", { ascending: true });

  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("site_id", siteId);

  // Transform settings array into a key-value map
  const settingsMap: Record<string, unknown> = {};
  type SettingRow = { key: string; value: unknown };
  for (const s of (settings ?? []) as SettingRow[]) {
    settingsMap[s.key] = s.value;
  }

  return NextResponse.json(
    {
      pages: pages ?? [],
      blocks: blocks ?? [],
      settings: settingsMap,
    },
    {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
