import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();

  const { data, error: dbErr } = await supabase
    .from("social_posts")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select().single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const { error: dbErr } = await supabase.from("social_posts").delete().eq("id", id);
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
