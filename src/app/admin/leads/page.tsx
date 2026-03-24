import { createClient } from "@/lib/supabase/server";
import { LeadsDashboard } from "./leads-dashboard";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return <LeadsDashboard initialLeads={leads ?? []} />;
}
