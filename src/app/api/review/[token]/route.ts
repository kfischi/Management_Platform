/**
 * POST /api/review/[token]
 * Client approves or requests changes on their site.
 * No auth required — validated by review_token.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();

  const body = await req.json() as { status: string; comment?: string };
  const { status, comment } = body;

  if (!["approved", "changes_requested"].includes(status)) {
    return NextResponse.json({ error: "סטטוס לא תקין" }, { status: 400 });
  }

  // Verify token and get site
  const { data: site, error: siteErr } = await supabase
    .from("sites")
    .select("id")
    .eq("review_token", token)
    .single();

  if (siteErr || !site) {
    return NextResponse.json({ error: "טוקן לא תקין" }, { status: 404 });
  }

  // Update site review status
  const { error: updateErr } = await supabase
    .from("sites")
    .update({
      review_status: status,
      review_comment: comment ?? null,
    })
    .eq("id", site.id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
