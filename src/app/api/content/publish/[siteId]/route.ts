/**
 * Publish API
 * Marks all pages as published and triggers a Netlify rebuild via deploy hook.
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

  // Verify user owns this site (or is admin)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("owner_id", user.id)
      .single();

    if (!site) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  // Mark all pages as published
  await supabase
    .from("site_pages")
    .update({ is_published: true })
    .eq("site_id", siteId);

  // Get site's Netlify deploy hook
  const { data: site } = await supabase
    .from("sites")
    .select("netlify_site_id, name")
    .eq("id", siteId)
    .single();

  // Trigger Netlify rebuild if deploy hook is configured
  const netlifyHook = process.env.NETLIFY_BUILD_HOOK_URL;
  let netlifyTriggered = false;

  if (netlifyHook) {
    try {
      const res = await fetch(netlifyHook, { method: "POST" });
      netlifyTriggered = res.ok;
    } catch {
      // Non-fatal: content is saved even if Netlify hook fails
    }
  }

  // Log the publish action
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "publish_content",
    resource_type: "site",
    resource_id: siteId,
    metadata: { site_name: site?.name, netlify_triggered: netlifyTriggered },
  });

  return NextResponse.json({
    success: true,
    netlify_triggered: netlifyTriggered,
    message: netlifyTriggered
      ? "התוכן פורסם והאתר מתעדכן..."
      : "התוכן נשמר. הגדר NETLIFY_BUILD_HOOK_URL לעדכון אוטומטי.",
  });
}
