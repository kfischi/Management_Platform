import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// N8N callback webhook — receives results from N8N workflows
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const supabase = await createClient();

  const { type, automation_id, status, output, steps_total, steps_done, duration_ms } = body as {
    type?: string;
    automation_id?: string;
    status?: string;
    output?: unknown;
    steps_total?: number;
    steps_done?: number;
    duration_ms?: number;
  };

  // Record workflow run result
  if (automation_id) {
    await supabase.from("workflow_runs").insert({
      automation_id,
      status: status ?? "success",
      trigger_type: type ?? "webhook",
      output,
      steps_total: steps_total ?? 0,
      steps_done: steps_done ?? 0,
      duration_ms: duration_ms ?? 0,
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    });

    // Update automation last_run
    await supabase.from("automations").update({
      last_run: new Date().toISOString(),
      run_count: supabase.rpc ? undefined : undefined, // increment handled separately
    }).eq("id", automation_id);
  }

  // Handle notification type callbacks
  if (type === "notification" && body.user_id) {
    await supabase.from("notifications").insert({
      user_id: body.user_id,
      type: "system",
      title: (body.title as string) ?? "N8N הודעה",
      body: (body.message as string) ?? "",
      link: (body.link as string) ?? null,
    });
  }

  return NextResponse.json({ ok: true });
}
