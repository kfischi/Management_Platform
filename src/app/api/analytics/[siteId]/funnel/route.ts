/**
 * GET /api/analytics/[siteId]/funnel
 * Funnel: site visits → leads from site → leads won
 * Admin only.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get("days") ?? "30");
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [visitsRes, leadsFromSiteRes, leadsWonRes] = await Promise.all([
    // Total visits
    supabase
      .from("site_analytics")
      .select("visitor_id", { count: "exact" })
      .eq("site_id", siteId)
      .gte("created_at", since.toISOString()),
    // Leads from site (source = "טופס אתר" or created after site went live)
    supabase
      .from("leads")
      .select("id, status", { count: "exact" })
      .eq("source", "טופס אתר")
      .gte("created_at", since.toISOString()),
    // Leads won
    supabase
      .from("leads")
      .select("id", { count: "exact" })
      .eq("source", "טופס אתר")
      .eq("status", "won")
      .gte("created_at", since.toISOString()),
  ]);

  const totalVisits   = visitsRes.count ?? 0;
  const uniqueVisits  = new Set((visitsRes.data ?? []).map((r: { visitor_id: string | null }) => r.visitor_id).filter(Boolean)).size;
  const leadsCount    = leadsFromSiteRes.count ?? 0;
  const wonCount      = leadsWonRes.count ?? 0;

  const visitToLead = totalVisits > 0 ? ((leadsCount / totalVisits) * 100).toFixed(1) : "0";
  const leadToWon   = leadsCount  > 0 ? ((wonCount   / leadsCount)  * 100).toFixed(1) : "0";
  const visitToWon  = totalVisits > 0 ? ((wonCount   / totalVisits) * 100).toFixed(1) : "0";

  return NextResponse.json({
    period_days: days,
    funnel: [
      { stage: "צפיות בדף",          count: totalVisits,  pct: 100 },
      { stage: "מבקרים ייחודיים",    count: uniqueVisits,  pct: totalVisits > 0 ? Math.round((uniqueVisits / totalVisits) * 100) : 0 },
      { stage: "לידים שנוצרו",        count: leadsCount,   pct: parseFloat(visitToLead) },
      { stage: "עסקאות שנסגרו",      count: wonCount,     pct: parseFloat(visitToWon) },
    ],
    conversion_rates: {
      visit_to_lead: `${visitToLead}%`,
      lead_to_won:   `${leadToWon}%`,
      visit_to_won:  `${visitToWon}%`,
    },
  });
}
