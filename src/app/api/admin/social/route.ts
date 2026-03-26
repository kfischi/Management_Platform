import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET(req: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let query = supabase.from("social_posts").select("*").order("scheduled_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error: dbErr } = await query.limit(100);
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { supabase, user, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { content, platforms, post_type, scheduled_at, image_url, tags, status } = body;

  if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 });

  const { data, error: dbErr } = await supabase.from("social_posts").insert({
    content,
    platforms: platforms ?? [],
    post_type: post_type ?? "text",
    status: status ?? (scheduled_at ? "scheduled" : "draft"),
    scheduled_at: scheduled_at ?? null,
    image_url: image_url ?? null,
    tags: tags ?? [],
    created_by: user!.id,
  }).select().single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}
