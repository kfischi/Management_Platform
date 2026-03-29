/**
 * Content Blocks API
 *
 * GET    /api/content/blocks?pageId=xxx        → list blocks for a page
 * POST   /api/content/blocks                   → create block (admin only)
 * PUT    /api/content/blocks                   → update block content (client can update own editable blocks)
 * DELETE /api/content/blocks?id=xxx            → delete block (admin only)
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

  const pageId = new URL(req.url).searchParams.get("pageId");
  if (!pageId) return NextResponse.json({ error: "חסר pageId" }, { status: 400 });

  const { data, error } = await supabase
    .from("content_blocks")
    .select("*")
    .eq("page_id", pageId)
    .order("order_index", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { supabase, user, role } = await getUserAndRole();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  if (role !== "admin") return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const body = await req.json();
  const { page_id, site_id, block_type, label, content, order_index, is_visible, is_editable } = body;

  if (!page_id || !site_id || !block_type) {
    return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("content_blocks")
    .insert({
      page_id,
      site_id,
      block_type,
      label: label ?? null,
      content: content ?? {},
      order_index: order_index ?? 0,
      is_visible: is_visible ?? true,
      is_editable: is_editable ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: Request) {
  const { supabase, user } = await getUserAndRole();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const body = await req.json();
  const { id, content, is_visible, order_index } = body;
  if (!id) return NextResponse.json({ error: "חסר id" }, { status: 400 });

  // Clients can only update: content, is_visible, order_index
  // is_editable and block_type are admin-only — RLS enforces is_editable check
  const updates: Record<string, unknown> = {};
  if (content !== undefined) updates.content = content;
  if (is_visible !== undefined) updates.is_visible = is_visible;
  if (order_index !== undefined) updates.order_index = order_index;

  const { data, error } = await supabase
    .from("content_blocks")
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

  const { error } = await supabase.from("content_blocks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
