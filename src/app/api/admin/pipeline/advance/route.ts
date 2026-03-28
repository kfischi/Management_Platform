/**
 * POST /api/admin/pipeline/advance
 * Advances a lead to the next pipeline stage.
 * Logs to pipeline_events. Creates notification for key stages.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STAGES = ["lead", "proposal", "approved", "building", "review", "approved_live", "live"] as const;
type Stage = typeof STAGES[number];

const STAGE_LABELS: Record<Stage, string> = {
  lead:          "ליד",
  proposal:      "הצעת מחיר",
  approved:      "אושר",
  building:      "בבנייה",
  review:        "לאישור לקוח",
  approved_live: "מאושר לעלייה",
  live:          "עלה לאוויר",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const body = await req.json() as { lead_id: string; to_stage: Stage; note?: string };
  const { lead_id, to_stage, note } = body;

  if (!lead_id || !to_stage) {
    return NextResponse.json({ error: "חסרים פרמטרים" }, { status: 400 });
  }

  // Get current stage
  const { data: lead, error: fetchErr } = await supabase
    .from("leads")
    .select("pipeline_stage, name, email")
    .eq("id", lead_id)
    .single();

  if (fetchErr || !lead) return NextResponse.json({ error: "ליד לא נמצא" }, { status: 404 });

  const from_stage = lead.pipeline_stage;

  // Update stage
  const updateData: Record<string, unknown> = { pipeline_stage: to_stage };
  if (to_stage === "live") updateData.status = "won";

  const { error: updateErr } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", lead_id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Log pipeline event
  await supabase.from("pipeline_events").insert({
    lead_id,
    from_stage: from_stage ?? undefined,
    to_stage,
    note: note ?? null,
    created_by: user.id,
  });

  // Auto-notification for key stages
  const notifMessages: Partial<Record<Stage, string>> = {
    review:        `האתר של ${lead.name} מוכן לסקירה`,
    approved_live: `${lead.name} אישר את האתר — מוכן לעלייה`,
    live:          `האתר של ${lead.name} עלה לאוויר! 🚀`,
  };
  if (notifMessages[to_stage]) {
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "pipeline",
      title: STAGE_LABELS[to_stage],
      body: notifMessages[to_stage]!,
      read: false,
    }).then(() => null, () => null);
  }

  return NextResponse.json({ success: true, from_stage, to_stage, label: STAGE_LABELS[to_stage] });
}
