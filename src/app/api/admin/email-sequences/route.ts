/**
 * GET  /api/admin/email-sequences  — list all sequences with step count
 * POST /api/admin/email-sequences  — create sequence
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { data, error: dbErr } = await supabase
    .from("email_sequences")
    .select("*, email_sequence_steps(count)")
    .order("created_at", { ascending: false });

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { supabase, user, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { name, description, trigger, trigger_config } = body as {
    name: string;
    description?: string;
    trigger?: string;
    trigger_config?: Record<string, unknown>;
  };

  if (!name) return NextResponse.json({ error: "שם הוא שדה חובה" }, { status: 400 });

  const { data, error: dbErr } = await supabase
    .from("email_sequences")
    .insert({
      name,
      description: description ?? null,
      trigger: trigger ?? "manual",
      trigger_config: trigger_config ?? {},
      created_by: user.id,
    })
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
