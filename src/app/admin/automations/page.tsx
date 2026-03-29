import { createClient } from "@/lib/supabase/server";
import AutomationsDashboard from "./automations-dashboard";
import type { Database } from "@/types/database";

type AutomationRow = Database["public"]["Tables"]["automations"]["Row"];

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
  const automations = (automationsRaw ?? []) as AutomationRow[];
  type RunStatus = "running" | "success" | "failed" | "cancelled";
  const runs = (runsRaw ?? []) as { id: string; automation_id: string; status: RunStatus; started_at: string; duration_ms: number | null; trigger_type: string | null }[];

  const n8nConnected = !!(process.env.N8N_URL && process.env.N8N_API_KEY);

  return (
    <AutomationsDashboard
      initialAutomations={automations}
      recentRuns={runs}
      n8nConnected={n8nConnected}
      n8nUrl={process.env.N8N_URL ?? null}
    />
  );
}
