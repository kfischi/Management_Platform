import { createClient } from "@/lib/supabase/server";
import AutomationsDashboard from "./automations-dashboard";

export default async function AutomationsPage() {
  const supabase = await createClient();

  const [{ data: automationsRaw }, { data: runsRaw }] = await Promise.all([
    supabase
      .from("automations")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("workflow_runs")
      .select("id, automation_id, status, started_at, duration_ms, trigger_type")
      .order("started_at", { ascending: false })
      .limit(50),
  ]);

  const n8nConnected = !!(process.env.N8N_URL && process.env.N8N_API_KEY);

  return (
    <AutomationsDashboard
      initialAutomations={automationsRaw ?? []}
      recentRuns={runsRaw ?? []}
      n8nConnected={n8nConnected}
      n8nUrl={process.env.N8N_URL ?? null}
    />
  );
}
