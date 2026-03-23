/**
 * PUT /api/admin/sites/[siteId]/build-hook
 * Admin only — saves the Netlify build hook URL for a specific site.
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((profile as any)?.role !== "admin") {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const { netlify_build_hook } = await req.json();

  // Validate URL format if provided
  if (netlify_build_hook && !netlify_build_hook.startsWith("https://api.netlify.com/build_hooks/")) {
    return NextResponse.json(
      { error: "URL לא תקין — חייב להתחיל עם https://api.netlify.com/build_hooks/" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("sites")
    .update({ netlify_build_hook: netlify_build_hook ?? null })
    .eq("id", siteId)
    .select("id, name, netlify_build_hook")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
