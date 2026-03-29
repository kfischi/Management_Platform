import { createClient } from "@/lib/supabase/server";
import { LeadsDashboard } from "./leads-dashboard";
import type { Database } from "@/types/database";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: leadsRaw } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leads = (leadsRaw ?? []) as any[];

  return <LeadsDashboard initialLeads={leads} />;
}
