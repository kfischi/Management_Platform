import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return error!;
  const { id } = await params;
  const body = await request.json();
  const allowed = ["status","priority","reply"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) updates[key] = body[key];
  if ("reply" in updates) { updates.replied_by = user.id; updates.replied_at = new Date().toISOString(); }
  const { data, error: dbErr } = await supabase
    .from("support_tickets").update(updates).eq("id", id).select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  await supabase.from("support_tickets").delete().eq("id", id);
  return new NextResponse(null, { status: 204 });
}
