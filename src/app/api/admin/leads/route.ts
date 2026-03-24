import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { data, error: dbErr } = await supabase
    .from("leads").select("*").order("created_at", { ascending: false });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return error!;
  const body = await request.json();
  const { name, company, email, phone, source, status, score, value, notes, tags, ai_insight } = body;
  if (!name?.trim()) return NextResponse.json({ error: "שם הוא שדה חובה" }, { status: 400 });
  if (!email?.trim()) return NextResponse.json({ error: "אימייל הוא שדה חובה" }, { status: 400 });
  const { data, error: dbErr } = await supabase
    .from("leads")
    .insert({ name: name.trim(), company: company?.trim() || null, email: email.trim(), phone: phone?.trim() || null, source: source ?? "manual", status: status ?? "new", score: Number(score) || 50, value: Number(value) || 0, notes: notes?.trim() || null, tags: tags ?? [], ai_insight: ai_insight?.trim() || null, created_by: user.id })
    .select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
