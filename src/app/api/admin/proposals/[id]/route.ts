import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const body = await request.json();
  if (body.services) body.total_amount = body.services.reduce((s: number, srv: { price: number; qty: number }) => s + (srv.price * srv.qty), 0);
  if (body.status === "sent" && !body.sent_at) body.sent_at = new Date().toISOString();
  const { data, error: dbErr } = await supabase.from("proposals").update(body).eq("id", id).select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  await supabase.from("proposals").delete().eq("id", id);
  return new NextResponse(null, { status: 204 });
}
