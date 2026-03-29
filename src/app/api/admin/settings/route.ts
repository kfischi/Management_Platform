import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { data } = await supabase.from("agency_settings").select("key, value");
  const obj = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
  return NextResponse.json(obj);
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const body: Record<string, string | null> = await request.json();
  const rows = Object.entries(body).map(([key, value]) => ({ key, value: value ?? null, updated_at: new Date().toISOString() }));
  const { error: dbErr } = await supabase
    .from("agency_settings")
    .upsert(rows, { onConflict: "key" });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
