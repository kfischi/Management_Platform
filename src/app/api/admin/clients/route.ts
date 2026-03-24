import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { data, error: dbErr } = await supabase
    .from("clients").select("*").order("created_at", { ascending: false });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return error!;
  const body = await request.json();
  const { contact_name, company_name, email, phone, address, notes, status, tags } = body;
  if (!contact_name?.trim()) return NextResponse.json({ error: "שם איש קשר הוא שדה חובה" }, { status: 400 });
  if (!email?.trim()) return NextResponse.json({ error: "אימייל הוא שדה חובה" }, { status: 400 });
  const { data, error: dbErr } = await supabase
    .from("clients")
    .insert({ contact_name: contact_name.trim(), company_name: company_name?.trim() || null, email: email.trim(), phone: phone?.trim() || null, address: address?.trim() || null, notes: notes?.trim() || null, status: status ?? "lead", tags: tags ?? [] })
    .select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
