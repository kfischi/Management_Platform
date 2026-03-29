/**
 * POST /api/admin/email-sequences/[id]/enroll
 * body: { lead_ids: string[] }   — enroll leads in sequence
 *
 * DELETE /api/admin/email-sequences/[id]/enroll
 * body: { lead_id: string }      — unenroll (unsubscribe) a lead
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const { lead_ids } = await req.json() as { lead_ids: string[] };
  if (!lead_ids?.length)
    return NextResponse.json({ error: "נדרש לפחות ליד אחד" }, { status: 400 });

  // First step delay determines next_send_at
  const { data: firstStep } = await supabase
    .from("email_sequence_steps")
    .select("delay_days")
    .eq("sequence_id", id)
    .order("step_number")
    .limit(1)
    .single();

  const delayDays = (firstStep as { delay_days: number } | null)?.delay_days ?? 0;
  const nextSendAt = new Date();
  nextSendAt.setDate(nextSendAt.getDate() + delayDays);

  const rows = lead_ids.map(lead_id => ({
    sequence_id: id,
    lead_id,
    current_step: 0,
    next_send_at: nextSendAt.toISOString(),
    status: "active",
  }));

  const { data, error: dbErr } = await supabase
    .from("email_sequence_enrollments")
    .upsert(rows, { onConflict: "sequence_id,lead_id", ignoreDuplicates: false })
    .select();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ enrolled: data?.length ?? 0 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const { lead_id } = await req.json() as { lead_id: string };

  const { error: dbErr } = await supabase
    .from("email_sequence_enrollments")
    .update({ status: "unsubscribed" })
    .eq("sequence_id", id)
    .eq("lead_id", lead_id);

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
