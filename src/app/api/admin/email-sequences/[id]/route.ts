/**
 * GET    /api/admin/email-sequences/[id]  — get sequence + steps + enrollment stats
 * PATCH  /api/admin/email-sequences/[id]  — update sequence
 * DELETE /api/admin/email-sequences/[id]  — delete sequence
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const [seqRes, stepsRes, enrollRes] = await Promise.all([
    supabase.from("email_sequences").select("*").eq("id", id).single(),
    supabase.from("email_sequence_steps").select("*").eq("sequence_id", id).order("step_number"),
    supabase
      .from("email_sequence_enrollments")
      .select("status")
      .eq("sequence_id", id),
  ]);

  if (seqRes.error || !seqRes.data)
    return NextResponse.json({ error: "לא נמצא" }, { status: 404 });

  const enrollments = enrollRes.data ?? [];
  const stats = {
    total: enrollments.length,
    active: enrollments.filter(e => e.status === "active").length,
    completed: enrollments.filter(e => e.status === "completed").length,
    unsubscribed: enrollments.filter(e => e.status === "unsubscribed").length,
  };

  return NextResponse.json({ ...seqRes.data, steps: stepsRes.data ?? [], stats });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const body = await req.json();
  const { data, error: dbErr } = await supabase
    .from("email_sequences")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const { error: dbErr } = await supabase
    .from("email_sequences")
    .delete()
    .eq("id", id);

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
