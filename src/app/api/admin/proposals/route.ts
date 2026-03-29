import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { data } = await supabase
    .from("proposals").select("*").order("created_at", { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return error!;
  const body = await request.json();
  const total = (body.services ?? []).reduce((s: number, srv: { price: number; qty: number }) => s + (srv.price * srv.qty), 0);
  const { data, error: dbErr } = await supabase
    .from("proposals")
    .insert({ ...body, total_amount: total, created_by: user.id, status: body.status ?? "draft" })
    .select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
