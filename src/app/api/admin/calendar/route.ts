import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET(request: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // YYYY-MM
  let query = supabase.from("social_posts").select("*").order("scheduled_at", { ascending: true });
  if (month) {
    query = query
      .gte("scheduled_at", `${month}-01`)
      .lt("scheduled_at", `${month.slice(0,4)}-${String(Number(month.slice(5,7)) + 1).padStart(2,"0")}-01`);
  }
  const { data } = await query;
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return error!;
  const body = await request.json();
  const { content, platforms, post_type, scheduled_at, image_url, tags } = body;
  if (!content?.trim()) return NextResponse.json({ error: "תוכן הוא שדה חובה" }, { status: 400 });
  const { data, error: dbErr } = await supabase
    .from("social_posts")
    .insert({ content: content.trim(), platforms: platforms ?? [], post_type: post_type ?? "text", status: "draft", scheduled_at: scheduled_at || null, image_url: image_url || null, tags: tags ?? [], created_by: user.id })
    .select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
