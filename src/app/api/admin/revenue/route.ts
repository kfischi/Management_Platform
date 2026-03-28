/**
 * GET /api/admin/revenue
 * Returns revenue analytics from leads (status=won) + proposals (status=accepted)
 *
 * Query params:
 *   months=12 — how many months of history
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET(req: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const months = parseInt(url.searchParams.get("months") ?? "12");
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  since.setDate(1);

  // Won leads
  const { data: leadsRaw } = await supabase
    .from("leads")
    .select("id, name, company, value, created_at, updated_at")
    .eq("status", "won")
    .gte("updated_at", since.toISOString())
    .order("updated_at", { ascending: false });

  // Accepted proposals
  const { data: proposalsRaw } = await supabase
    .from("proposals")
    .select("id, client_name, client_company, total_amount, accepted_at, created_at")
    .eq("status", "accepted")
    .gte("accepted_at", since.toISOString())
    .order("accepted_at", { ascending: false });

  // All leads for pipeline
  const { data: allLeadsRaw } = await supabase
    .from("leads")
    .select("status, value, updated_at")
    .gte("created_at", since.toISOString());

  const leads = (leadsRaw ?? []) as { id: string; name: string; company: string | null; value: number; created_at: string; updated_at: string }[];
  const proposals = (proposalsRaw ?? []) as { id: string; client_name: string; client_company: string | null; total_amount: number; accepted_at: string; created_at: string }[];
  const allLeads = (allLeadsRaw ?? []) as { status: string; value: number; updated_at: string }[];

  // ── Revenue by month ──
  const byMonth: Record<string, number> = {};
  // Fill all months with 0
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = 0;
  }
  for (const lead of leads) {
    const key = lead.updated_at.slice(0, 7);
    if (key in byMonth) byMonth[key] = (byMonth[key] ?? 0) + (lead.value ?? 0);
  }
  for (const p of proposals) {
    const key = p.accepted_at.slice(0, 7);
    if (key in byMonth) byMonth[key] = (byMonth[key] ?? 0) + (p.total_amount ?? 0);
  }

  // ── Top clients by revenue ──
  const clientMap: Record<string, number> = {};
  for (const lead of leads) {
    const name = lead.company ?? lead.name;
    clientMap[name] = (clientMap[name] ?? 0) + (lead.value ?? 0);
  }
  for (const p of proposals) {
    const name = p.client_company ?? p.client_name;
    clientMap[name] = (clientMap[name] ?? 0) + (p.total_amount ?? 0);
  }
  const topClients = Object.entries(clientMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, revenue]) => ({ name, revenue }));

  // ── Pipeline stats ──
  const pipeline: Record<string, { count: number; value: number }> = {};
  for (const lead of allLeads) {
    if (!pipeline[lead.status]) pipeline[lead.status] = { count: 0, value: 0 };
    pipeline[lead.status].count++;
    pipeline[lead.status].value += lead.value ?? 0;
  }

  // ── Summary ──
  const totalRevenue = leads.reduce((s, l) => s + (l.value ?? 0), 0)
    + proposals.reduce((s, p) => s + (p.total_amount ?? 0), 0);
  const avgDeal = leads.length > 0
    ? Math.round(leads.reduce((s, l) => s + (l.value ?? 0), 0) / leads.length)
    : 0;
  const pipelineValue = allLeads
    .filter(l => !["won", "lost"].includes(l.status))
    .reduce((s, l) => s + (l.value ?? 0), 0);

  // Monthly growth (last month vs. month before)
  const months2 = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]));
  const lastMonth = months2[months2.length - 1]?.[1] ?? 0;
  const prevMonth = months2[months2.length - 2]?.[1] ?? 0;
  const growth = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100) : 0;

  return NextResponse.json({
    summary: {
      total_revenue: totalRevenue,
      avg_deal: avgDeal,
      pipeline_value: pipelineValue,
      deals_won: leads.length,
      growth_pct: growth,
    },
    by_month: Object.entries(byMonth).map(([month, revenue]) => ({ month, revenue })),
    top_clients: topClients,
    pipeline,
    recent_wins: leads.slice(0, 5).map(l => ({
      name: l.company ?? l.name,
      value: l.value,
      date: l.updated_at.slice(0, 10),
    })),
  });
}
