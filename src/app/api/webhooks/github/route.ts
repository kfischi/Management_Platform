import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const event = req.headers.get("x-github-event") ?? "push";
  const signature = req.headers.get("x-hub-signature-256");

  const supabase = await createClient();

  // Verify signature if secret is configured
  const { data: setting } = await supabase
    .from("agency_settings")
    .select("value")
    .eq("key", "github_token")
    .single();

  if (setting?.value && signature) {
    const expected = `sha256=${crypto.createHmac("sha256", setting.value).update(body).digest("hex")}`;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(body); } catch { return NextResponse.json({ ok: true }); }

  if (event === "push") {
    const repo = (payload.repository as Record<string, unknown>)?.full_name as string | undefined;
    const commits = payload.commits as Array<Record<string, unknown>> | undefined;
    const branch = (payload.ref as string | undefined)?.replace("refs/heads/", "") ?? "main";
    const headCommit = payload.head_commit as Record<string, unknown> | undefined;
    const commitMsg = headCommit?.message as string | undefined ?? "GitHub push";
    const commitHash = headCommit?.id as string | undefined;

    // Find site by github_repo
    if (repo) {
      const { data: site } = await supabase.from("sites").select("id").eq("github_repo", repo).maybeSingle();
      if (site) {
        await supabase.from("deployments").insert({
          site_id: site.id,
          status: "building",
          commit_message: commitMsg,
          commit_hash: commitHash?.slice(0, 7),
          branch,
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
