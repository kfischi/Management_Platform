import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { supabase, user, error: null };
}

export async function GET() {
  const { supabase, user, error } = await requireUser();
  if (error || !user) return error!;
  const { data } = await supabase
    .from("support_tickets").select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const { supabase, user, error } = await requireUser();
  if (error || !user) return error!;
  const { subject, message, priority } = await request.json();
  if (!subject?.trim() || !message?.trim()) return NextResponse.json({ error: "נושא ותוכן הם שדות חובה" }, { status: 400 });
  const { data, error: dbErr } = await supabase
    .from("support_tickets")
    .insert({ client_id: user.id, subject: subject.trim(), message: message.trim(), priority: priority ?? "normal", status: "open" })
    .select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
