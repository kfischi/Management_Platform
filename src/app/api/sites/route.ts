import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const body = await request.json();
  const { name, domain, github_repo, netlify_url, description } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "שם האתר הוא שדה חובה" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("sites")
    .insert({
      name: name.trim(),
      domain: domain?.trim() || null,
      github_repo: github_repo?.trim() || null,
      netlify_url: netlify_url?.trim() || null,
      description: description?.trim() || null,
      owner_id: user.id,
      status: "paused",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
