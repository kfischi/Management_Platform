/**
 * Publish API
 * Marks all pages as published and triggers a Netlify rebuild
 * using the per-site netlify_build_hook stored in the sites table.
 *
 * POST /api/content/publish/[siteId]
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  // Fetch site (also validates ownership via RLS)
  const { data: site } = await supabase
    .from("sites")
    .select("id, name, owner_id, netlify_build_hook")
    .eq("id", siteId)
    .single();

  if (!site) return NextResponse.json({ error: "אתר לא נמצא" }, { status: 404 });

  // Non-admin must own the site
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((profile as any)?.role !== "admin" && (site as any).owner_id !== user.id) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  // Mark all pages as published
  await supabase
    .from("site_pages")
    .update({ is_published: true })
    .eq("site_id", siteId);

  // Trigger Netlify rebuild using the per-site build hook
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildHook: string | null = (site as any).netlify_build_hook ?? null;
  let netlifyTriggered = false;

  if (buildHook) {
    try {
      const res = await fetch(buildHook, { method: "POST" });
      netlifyTriggered = res.ok;
    } catch {
      // Non-fatal — content is saved even if Netlify hook fails
    }
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "publish_content",
    resource_type: "site",
    resource_id: siteId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: { site_name: (site as any).name, netlify_triggered: netlifyTriggered },
  });

  return NextResponse.json({
    success: true,
    netlify_triggered: netlifyTriggered,
    message: netlifyTriggered
      ? "התוכן פורסם והאתר מתעדכן..."
      : buildHook
        ? "הפעלת הבנייה נכשלה. בדוק את ה-Build Hook."
        : "התוכן נשמר. לא הוגדר Netlify Build Hook לאתר זה.",
  });
}
