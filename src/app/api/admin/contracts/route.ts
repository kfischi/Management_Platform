import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { data, error: dbErr } = await supabase
    .from("contracts")
    .select("*, clients(contact_name, company_name)")
    .order("created_at", { ascending: false });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return error!;
  const body = await request.json();
  const { title, description, client_id, amount, currency, status, start_date, end_date, file_url } = body;
  if (!title?.trim()) return NextResponse.json({ error: "כותרת היא שדה חובה" }, { status: 400 });
  if (!client_id) return NextResponse.json({ error: "לקוח הוא שדה חובה" }, { status: 400 });
  const { data, error: dbErr } = await supabase
    .from("contracts")
    .insert({ title: title.trim(), description: description?.trim() || null, client_id, amount: Number(amount) || 0, currency: currency ?? "ILS", status: status ?? "pending", start_date: start_date ?? new Date().toISOString().split("T")[0], end_date: end_date || null, file_url: file_url || null, created_by: user.id })
    .select("*, clients(contact_name, company_name)").single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
