import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* POST /api/admin/sites/[siteId]/deploy — trigger Netlify build hook */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const { siteId } = await params;

  // Fetch site (admin sees all, client sees own)
  const { data: site, error: siteErr } = await supabase
    .from("sites")
    .select("id, name, netlify_build_hook, owner_id")
    .eq("id", siteId)
    .single();

  if (siteErr || !site) {
    return NextResponse.json({ error: "אתר לא נמצא" }, { status: 404 });
  }

  if (!site.netlify_build_hook) {
    return NextResponse.json({ error: "לא הוגדר build hook לאתר זה" }, { status: 400 });
  }

  try {
    const res = await fetch(site.netlify_build_hook, { method: "POST" });
    if (!res.ok) {
      return NextResponse.json({ error: `Netlify החזיר שגיאה: ${res.status}` }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "לא ניתן לחבר ל-Netlify" }, { status: 502 });
  }

  // Update status to building
  await supabase.from("sites").update({ status: "building" }).eq("id", siteId);

  // Audit log
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "site.deploy_triggered",
    resource_type: "sites",
    resource_id: siteId,
    metadata: { site_name: site.name },
  });

  return NextResponse.json({ success: true, message: "Deploy הופעל בהצלחה" });
}
