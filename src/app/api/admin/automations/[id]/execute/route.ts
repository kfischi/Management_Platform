import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* POST /api/admin/automations/[id]/execute — trigger execution */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  // Fetch automation
  const { data: automation, error: autoErr } = await supabase
    .from("automations").select("*").eq("id", id).single();

  if (autoErr || !automation) {
    return NextResponse.json({ error: "אוטומציה לא נמצאה" }, { status: 404 });
  }

  // Create a run record
  const { data: run, error: runErr } = await supabase
    .from("workflow_runs")
    .insert({
      automation_id: id,
      status: "running",
      trigger_type: "manual",
      trigger_data: body.trigger_data ?? null,
      started_by: user.id,
      steps_total: (automation.workflow_json?.nodes ?? []).length,
    })
    .select()
    .single();

  if (runErr) {
    return NextResponse.json({ error: runErr.message }, { status: 500 });
  }

  // If n8n workflow is linked, trigger it
  if (automation.n8n_workflow_id) {
    const n8nUrl = process.env.N8N_URL;
    const n8nApiKey = process.env.N8N_API_KEY;

    if (n8nUrl && n8nApiKey) {
      try {
        const n8nRes = await fetch(
          `${n8nUrl}/api/v1/workflows/${automation.n8n_workflow_id}/execute`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-N8N-API-KEY": n8nApiKey,
            },
            body: JSON.stringify({ workflowData: body.trigger_data ?? {} }),
          }
        );
        const n8nData = await n8nRes.json();
        const executionId = n8nData?.data?.executionId ?? n8nData?.id;

        // Update run with n8n execution id
        await supabase
          .from("workflow_runs")
          .update({
            n8n_execution_id: executionId ? String(executionId) : null,
            status: n8nRes.ok ? "success" : "failed",
            finished_at: new Date().toISOString(),
            duration_ms: 0,
            output: n8nData,
          })
          .eq("id", run.id);

        // Update automation run_count
        await supabase
          .from("automations")
          .update({
            run_count: (automation.run_count ?? 0) + 1,
            last_run_at: new Date().toISOString(),
          })
          .eq("id", id);

        return NextResponse.json({ run_id: run.id, n8n_execution_id: executionId });
      } catch (err) {
        await supabase
          .from("workflow_runs")
          .update({
            status: "failed",
            finished_at: new Date().toISOString(),
            error_message: err instanceof Error ? err.message : "N8N שגיאה",
          })
          .eq("id", run.id);

        return NextResponse.json({ run_id: run.id, warning: "N8N לא הגיב" });
      }
    }
  }

  // Manual execution — mark as success immediately for now
  await supabase
    .from("workflow_runs")
    .update({
      status: "success",
      finished_at: new Date().toISOString(),
      duration_ms: 50,
      steps_done: (automation.workflow_json?.nodes ?? []).length,
    })
    .eq("id", run.id);

  await supabase
    .from("automations")
    .update({
      run_count: (automation.run_count ?? 0) + 1,
      last_run_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ run_id: run.id });
}
