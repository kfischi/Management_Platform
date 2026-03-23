/**
 * Content Pages API
 *
 * GET  /api/content/pages?siteId=xxx          → list pages for a site
 * POST /api/content/pages                      → create a new page (admin only)
 * PUT  /api/content/pages                      → update page metadata
 * DELETE /api/content/pages?id=xxx             → delete page (admin only)
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function getUserAndRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, role: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { supabase, user, role: profile?.role ?? "client" };
}

export async function GET(req: Request) {
  const { supabase, user } = await getUserAndRole();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const siteId = new URL(req.url).searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "חסר siteId" }, { status: 400 });

  const { data, error } = await supabase
    .from("site_pages")
    .select("*")
    .eq("site_id", siteId)
    .order("order_index", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { supabase, user, role } = await getUserAndRole();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  if (role !== "admin") return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const body = await req.json();
  const { site_id, slug, title, meta_title, meta_desc, order_index } = body;

  if (!site_id || !slug || !title) {
    return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("site_pages")
    .insert({ site_id, slug, title, meta_title, meta_desc, order_index: order_index ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: Request) {
  const { supabase, user } = await getUserAndRole();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "חסר id" }, { status: 400 });

  // Remove fields clients must not change
  delete updates.site_id;

  const { data, error } = await supabase
    .from("site_pages")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const { supabase, user, role } = await getUserAndRole();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  if (role !== "admin") return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "חסר id" }, { status: 400 });

  const { error } = await supabase.from("site_pages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
