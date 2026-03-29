/**
 * POST /api/analytics/[siteId]
 *   Track a page view — called from client-side tracking script.
 *   Public endpoint (no auth required).
 *
 * GET /api/analytics/[siteId]
 *   Return analytics summary (admin only).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  // Basic validation
  if (!siteId) return NextResponse.json({ ok: false }, { status: 400 });

  let body: { page_slug?: string; visitor_id?: string; referrer?: string } = {};
  try { body = await req.json(); } catch { /* ignore */ }

  const supabase = await createClient();

  await supabase.from("site_analytics").insert({
    site_id: siteId,
    page_slug: body.page_slug ?? "home",
    visitor_id: body.visitor_id ?? null,
    referrer: body.referrer ?? req.headers.get("referer") ?? null,
    user_agent: req.headers.get("user-agent") ?? null,
  });

  return NextResponse.json({ ok: true });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const supabase = await createClient();

  // Admin only
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if ((profile as { role: string } | null)?.role !== "admin")
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get("days") ?? "30");
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: rows } = await supabase
    .from("site_analytics")
    .select("page_slug, visitor_id, referrer, created_at")
    .eq("site_id", siteId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  const analytics = rows ?? [];

  // Compute summary
  const totalViews = analytics.length;
  const uniqueVisitors = new Set(analytics.map(r => r.visitor_id).filter(Boolean)).size;

  // Views per page
  const byPage: Record<string, number> = {};
  for (const r of analytics) {
    byPage[r.page_slug] = (byPage[r.page_slug] ?? 0) + 1;
  }

  // Views per day (last N days)
  const byDay: Record<string, number> = {};
  for (const r of analytics) {
    const day = r.created_at.slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  }

  // Top referrers
  const byReferrer: Record<string, number> = {};
  for (const r of analytics) {
    if (r.referrer) {
      try {
        const host = new URL(r.referrer).hostname;
        byReferrer[host] = (byReferrer[host] ?? 0) + 1;
      } catch { /* ignore malformed */ }
    }
  }

  return NextResponse.json({
    total_views: totalViews,
    unique_visitors: uniqueVisitors,
    by_page: Object.entries(byPage)
      .sort((a, b) => b[1] - a[1])
      .map(([slug, views]) => ({ slug, views })),
    by_day: Object.entries(byDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, views]) => ({ date, views })),
    top_referrers: Object.entries(byReferrer)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([host, count]) => ({ host, count })),
  });
}
