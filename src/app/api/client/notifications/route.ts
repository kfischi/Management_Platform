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
    .from("notifications").select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }).limit(30);
  return NextResponse.json(data ?? []);
}

/* PATCH — mark all read */
export async function PATCH() {
  const { supabase, user, error } = await requireUser();
  if (error || !user) return error!;
  await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
  return NextResponse.json({ ok: true });
}
