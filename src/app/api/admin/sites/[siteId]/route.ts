import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getAdminUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

/* PUT /api/admin/sites/[siteId] — update site */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const supabase = await createClient();
  const user = await getAdminUser(supabase);
  if (!user) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const { siteId } = await params;
  const body = await request.json();

  const allowed = ["name", "domain", "github_repo", "netlify_url", "netlify_build_hook", "status", "description", "owner_id"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key] === "" ? null : body[key];
  }

  const { data, error } = await supabase
    .from("sites")
    .update(update)
    .eq("id", siteId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/* DELETE /api/admin/sites/[siteId] — delete site */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const supabase = await createClient();
  const user = await getAdminUser(supabase);
  if (!user) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const { siteId } = await params;

  const { error } = await supabase.from("sites").delete().eq("id", siteId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
