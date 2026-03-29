/**
 * GET  /api/admin/email-sequences/[id]/steps  — list steps
 * POST /api/admin/email-sequences/[id]/steps  — add step
 * PUT  /api/admin/email-sequences/[id]/steps  — replace all steps (bulk save)
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

  const { data, error: dbErr } = await supabase
    .from("email_sequence_steps")
    .select("*")
    .eq("sequence_id", id)
    .order("step_number");

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const body = await req.json();
  const { subject, body_html, delay_days, from_name, from_email } = body as {
    subject: string;
    body_html: string;
    delay_days?: number;
    from_name?: string;
    from_email?: string;
  };

  if (!subject || !body_html)
    return NextResponse.json({ error: "נושא ותוכן הם שדות חובה" }, { status: 400 });

  // Get next step number
  const { data: existing } = await supabase
    .from("email_sequence_steps")
    .select("step_number")
    .eq("sequence_id", id)
    .order("step_number", { ascending: false })
    .limit(1);

  const nextStep = ((existing?.[0] as { step_number: number } | undefined)?.step_number ?? 0) + 1;

  const { data, error: dbErr } = await supabase
    .from("email_sequence_steps")
    .insert({
      sequence_id: id,
      step_number: nextStep,
      delay_days: delay_days ?? 0,
      subject,
      body_html,
      from_name: from_name ?? null,
      from_email: from_email ?? null,
    })
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Bulk replace all steps
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const steps = await req.json() as {
    step_number: number;
    delay_days: number;
    subject: string;
    body_html: string;
    from_name?: string | null;
    from_email?: string | null;
  }[];

  // Delete existing steps and re-insert
  await supabase.from("email_sequence_steps").delete().eq("sequence_id", id);

  if (steps.length === 0) return NextResponse.json([]);

  const { data, error: dbErr } = await supabase
    .from("email_sequence_steps")
    .insert(steps.map(s => ({ ...s, sequence_id: id })))
    .select();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
