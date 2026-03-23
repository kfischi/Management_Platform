/**
 * Admin: GET / PUT client permissions for a site.
 *
 * Stored in site_settings as key="client_permissions".
 *
 * GET  /api/admin/site-permissions?siteId=xxx
 * PUT  /api/admin/site-permissions  { site_id, permissions }
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { FULL_PERMISSIONS, type ClientPermissions } from "@/lib/permissions";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "לא מחובר", status: 401 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((profile as any)?.role !== "admin") return { error: "אין הרשאה", status: 403 };
  return { ok: true };
}

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const siteId = new URL(req.url).searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "חסר siteId" }, { status: 400 });

  const admin = createAdminClient();
  const { data } = await admin
    .from("site_settings")
    .select("value")
    .eq("site_id", siteId)
    .eq("key", "client_permissions")
    .maybeSingle();

  return NextResponse.json(data?.value ?? FULL_PERMISSIONS);
}

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { site_id, permissions } = await req.json() as {
    site_id: string;
    permissions: ClientPermissions;
  };

  if (!site_id || !permissions) {
    return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("site_settings")
    .upsert(
      { site_id, key: "client_permissions", value: permissions },
      { onConflict: "site_id,key" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
