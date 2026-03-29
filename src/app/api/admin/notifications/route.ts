import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { data } = await supabase
    .from("notifications").select("*")
    .order("created_at", { ascending: false }).limit(50);
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const body = await request.json();
  const { user_id, type, title, body: bodyText, link } = body;
  if (!user_id || !title || !bodyText) return NextResponse.json({ error: "חסרים שדות" }, { status: 400 });
  const { data, error: dbErr } = await supabase
    .from("notifications")
    .insert({ user_id, type: type ?? "info", title, body: bodyText, link: link ?? null })
    .select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

/* PATCH /api/admin/notifications — mark all read for user_id */
export async function PATCH(request: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { user_id } = await request.json();
  if (!user_id) return NextResponse.json({ error: "חסר user_id" }, { status: 400 });
  await supabase.from("notifications").update({ read: true }).eq("user_id", user_id).eq("read", false);
  return NextResponse.json({ ok: true });
}
