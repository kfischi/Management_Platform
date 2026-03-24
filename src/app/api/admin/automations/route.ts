import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

/* GET /api/admin/automations — list all automations */
export async function GET() {
  const supabase = await createClient();
  const user = await requireAdmin(supabase);
  if (!user) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const { data, error } = await supabase
    .from("automations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/* POST /api/admin/automations — create automation */
export async function POST(request: Request) {
  const supabase = await createClient();
  const user = await requireAdmin(supabase);
  if (!user) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const body = await request.json();
  const { name, description, trigger_type, workflow_json, tags, n8n_workflow_id } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "שם הוא שדה חובה" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("automations")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      trigger_type: trigger_type ?? "manual",
      workflow_json: workflow_json ?? { nodes: [], edges: [] },
      tags: tags ?? [],
      n8n_workflow_id: n8n_workflow_id ?? null,
      is_active: false,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
