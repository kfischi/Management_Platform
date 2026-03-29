import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { data, error: dbErr } = await supabase
    .from("payments")
    .select("*, clients(contact_name, company_name)")
    .order("due_date", { ascending: false });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return error!;
  const body = await request.json();
  const { client_id, contract_id, amount, currency, status, due_date, paid_date, description, invoice_url } = body;
  if (!client_id) return NextResponse.json({ error: "לקוח הוא שדה חובה" }, { status: 400 });
  if (!amount || isNaN(Number(amount))) return NextResponse.json({ error: "סכום שגוי" }, { status: 400 });
  if (!due_date) return NextResponse.json({ error: "תאריך פירעון הוא שדה חובה" }, { status: 400 });
  const { data, error: dbErr } = await supabase
    .from("payments")
    .insert({ client_id, contract_id: contract_id || null, amount: Number(amount), currency: currency ?? "ILS", status: status ?? "pending", due_date, paid_date: paid_date || null, description: description?.trim() || null, invoice_url: invoice_url || null, created_by: user.id })
    .select("*, clients(contact_name, company_name)").single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
