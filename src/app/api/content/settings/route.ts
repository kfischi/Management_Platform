/**
 * Site Settings API
 *
 * GET /api/content/settings?siteId=xxx         → get all settings for a site
 * PUT /api/content/settings                    → upsert a setting key
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET(req: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const siteId = new URL(req.url).searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "חסר siteId" }, { status: 400 });

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("site_id", siteId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return as key-value map
  const map: Record<string, unknown> = {};
  type SettingRow = { key: string; value: unknown };
  for (const s of (data ?? []) as SettingRow[]) map[s.key] = s.value;
  return NextResponse.json(map);
}

export async function PUT(req: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const body = await req.json();
  const { site_id, key, value } = body;
  if (!site_id || !key || value === undefined) {
    return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("site_settings")
    .upsert({ site_id, key, value }, { onConflict: "site_id,key" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
