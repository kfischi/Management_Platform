/**
 * GET /api/admin/pipeline
 * Returns all active leads grouped by pipeline_stage.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, company, email, phone, value, score, pipeline_stage, status, created_at, ai_insight, tags, sites(id, review_token, review_status)")
    .not("status", "eq", "lost")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(leads ?? []);
}
