import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const { data, error: dbErr } = await supabase.from("clients").select("*").eq("id", id).single();
  if (dbErr || !data) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: Params) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const body = await request.json();
  const allowed = ["contact_name","company_name","email","phone","address","notes","status","tags","profile_id"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) updates[key] = body[key];
  const { data, error: dbErr } = await supabase.from("clients").update(updates).eq("id", id).select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const { error: dbErr } = await supabase.from("clients").delete().eq("id", id);
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
