import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { data, error: dbErr } = await supabase
    .from("chatbots")
    .select("*, sites(id, name)")
    .order("created_at", { ascending: false });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return error!;
  const body = await req.json();
  const { name, site_id, system_prompt, ai_provider, model, is_active, config } = body;
  if (!name?.trim()) return NextResponse.json({ error: "שם חובה" }, { status: 400 });
  const { data, error: dbErr } = await supabase
    .from("chatbots")
    .insert({
      name: name.trim(),
      site_id: site_id || null,
      system_prompt: system_prompt ?? null,
      ai_provider: ai_provider ?? "claude",
      model: model ?? "claude-haiku-4-5-20251001",
      is_active: is_active ?? true,
      config: config ?? {},
      created_by: user.id,
    })
    .select()
    .single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
