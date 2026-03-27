import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import type { Database } from "@/types/database";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

/* GET /api/admin/clients/health — compute health scores for all clients */
export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Fetch all clients
  const { data: clientsRaw, error: cErr } = await supabase
    .from("clients")
    .select("*")
    .neq("status", "lead")
    .order("created_at", { ascending: false });
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
  const clients = (clientsRaw ?? []) as ClientRow[];

  if (clients.length === 0) return NextResponse.json([]);

  const clientIds = clients.map(c => c.id);

  // Fetch recent payments, open tickets, this-month deployments, contracts in parallel
  const [
    { data: paymentsRaw },
    { data: ticketsRaw },
    { data: deploymentsRaw },
    { data: contractsRaw },
  ] = await Promise.all([
    supabase.from("payments").select("client_id, status, amount, due_date")
      .in("client_id", clientIds)
      .order("due_date", { ascending: false }),
    supabase.from("support_tickets").select("client_id, status")
      .in("client_id", clientIds)
      .eq("status", "open"),
    supabase.from("deployments").select("site_id, created_at")
      .gte("created_at", startOfMonth),
    supabase.from("contracts").select("client_id, amount, end_date, status")
      .in("client_id", clientIds)
      .eq("status", "active"),
  ]);

  type PaymentRow = { client_id: string; status: string; amount: number; due_date: string };
  type TicketRow = { client_id: string; status: string };
  type DeployRow = { site_id: string; created_at: string };
  type ContractRow = { client_id: string; amount: number; end_date: string | null; status: string };

  const payments = (paymentsRaw ?? []) as PaymentRow[];
  const tickets = (ticketsRaw ?? []) as TicketRow[];
  const deployments = (deploymentsRaw ?? []) as DeployRow[];
  const contracts = (contractsRaw ?? []) as ContractRow[];

  // Fetch sites to map client → deployments
  const { data: sitesRaw } = await supabase
    .from("sites")
    .select("id, owner_id")
    .in("owner_id", clients.map(c => c.profile_id).filter(Boolean));
  const sites = (sitesRaw ?? []) as { id: string; owner_id: string }[];
  const siteToClient = new Map<string, string>();
  for (const site of sites) {
    const client = clients.find(c => c.profile_id === site.owner_id);
    if (client) siteToClient.set(site.id, client.id);
  }

  const health = clients.map(client => {
    const clientPayments = payments.filter(p => p.client_id === client.id);
    const openTickets = tickets.filter(t => t.client_id === client.id).length;
    const contract = contracts.find(c => c.client_id === client.id);
    const clientDeployCount = deployments.filter(d => siteToClient.get(d.site_id) === client.id).length;

    // Payment status: check most recent payment
    const recent = clientPayments[0];
    let paymentStatus: "on-time" | "late" | "overdue" = "on-time";
    if (recent?.status === "overdue") paymentStatus = "overdue";
    else if (recent?.status === "pending") {
      const daysPast = recent.due_date
        ? Math.floor((now.getTime() - new Date(recent.due_date).getTime()) / 86400000)
        : 0;
      if (daysPast > 0) paymentStatus = daysPast > 7 ? "overdue" : "late";
    }

    // MRR = contract amount or sum of paid payments this month
    const mrr = contract?.amount ?? clientPayments
      .filter(p => p.status === "paid")
      .reduce((s, p) => s + p.amount, 0);

    // Health score
    let score = 100;
    if (paymentStatus === "overdue") score -= 30;
    else if (paymentStatus === "late") score -= 15;
    score -= Math.min(openTickets * 5, 25);
    if (clientDeployCount === 0) score -= 10;
    score = Math.max(0, Math.min(100, score));

    // Risk level
    const riskLevel: "low" | "medium" | "high" | "critical" =
      score >= 80 ? "low" : score >= 60 ? "medium" : score >= 40 ? "high" : "critical";

    // Contract end
    const contractEnd = contract?.end_date
      ? new Date(contract.end_date).toLocaleDateString("he-IL", { year: "numeric", month: "2-digit" })
      : null;

    // AI insight
    const reasons: string[] = [];
    if (paymentStatus === "overdue") reasons.push("תשלום באיחור חריג");
    else if (paymentStatus === "late") reasons.push("תשלום באיחור");
    if (openTickets > 0) reasons.push(`${openTickets} פניות תמיכה פתוחות`);
    if (clientDeployCount === 0) reasons.push("אפס פעילות החודש");
    else if (clientDeployCount >= 5) reasons.push(`${clientDeployCount} deployments החודש`);
    if (score >= 80) reasons.push("לקוח מרוצה");

    let aiAction = "המשך מעקב שוטף";
    if (riskLevel === "critical") aiAction = "התקשר עכשיו! שלח הצעה לחידוש עם הנחה";
    else if (riskLevel === "high") aiAction = "שלח WhatsApp אישי + הצע שיחת review";
    else if (openTickets > 0) aiAction = "סגור את הפניות הפתוחות תוך 24 שעות";
    else if (score >= 90) aiAction = "בקש ביקורת + הפניה לחברים";

    return {
      id: client.id,
      name: client.contact_name,
      company: client.company_name ?? "",
      score,
      trend: score >= 80 ? "stable" : score >= 60 ? "stable" : "down",
      riskLevel,
      lastContact: "לא זמין",
      mrr,
      openTickets,
      deploymentsThisMonth: clientDeployCount,
      paymentStatus,
      contractEnd,
      aiReason: reasons.join(", ") || "מצב תקין",
      aiAction,
      signals: [
        { label: paymentStatus === "on-time" ? "תשלום בזמן" : paymentStatus === "late" ? "תשלום באיחור" : "תשלום באיחור חריג", positive: paymentStatus === "on-time" },
        { label: `${clientDeployCount} deploys החודש`, positive: clientDeployCount > 0 },
        ...(openTickets > 0 ? [{ label: `${openTickets} פניות פתוחות`, positive: false }] : [{ label: "אפס פניות", positive: true }]),
        ...(contractEnd ? [{ label: `חוזה עד ${contractEnd}`, positive: true }] : []),
      ],
    };
  });

  return NextResponse.json(health);
}
