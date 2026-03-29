import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { data } = await supabase
    .from("support_tickets")
    .select("*, profiles(full_name, email, avatar_url)")
    .order("created_at", { ascending: false });
  return NextResponse.json(data ?? []);
}
