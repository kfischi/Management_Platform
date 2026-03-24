import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* GET /api/admin/automations/[id]/runs — get execution history */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const { id } = await params;
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);

  const { data, error } = await supabase
    .from("workflow_runs")
    .select("*")
    .eq("automation_id", id)
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
