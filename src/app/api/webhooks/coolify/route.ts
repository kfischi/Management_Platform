import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Coolify event webhook — deployment status updates
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const supabase = await createClient();

  const { type, application_uuid, status, fqdn, commit_message, git_branch } = body as {
    type?: string;
    application_uuid?: string;
    status?: string;
    fqdn?: string;
    commit_message?: string;
    git_branch?: string;
  };

  // Map Coolify status to our deployment status
  const statusMap: Record<string, string> = {
    "deployment.success": "success",
    "deployment.failed":  "failed",
    "deployment.started": "building",
    "application.stopped": "cancelled",
  };
  const deployStatus = statusMap[type ?? ""] ?? "building";

  // Find site by netlify_site_id or fqdn
  if (fqdn) {
    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .or(`netlify_url.eq.${fqdn},domain.eq.${fqdn}`)
      .maybeSingle();

    if (site) {
      const siteId = (site as { id: string }).id;

      // Update site status
      if (deployStatus === "success") {
        await supabase.from("sites").update({ status: "active" }).eq("id", siteId);
      } else if (deployStatus === "failed") {
        await supabase.from("sites").update({ status: "error" }).eq("id", siteId);
      }

      // Create deployment record
      await supabase.from("deployments").insert({
        site_id: siteId,
        deploy_id: application_uuid ?? `coolify-${Date.now()}`,
        status: deployStatus as "success" | "building" | "failed" | "cancelled",
        commit_message: commit_message ?? "Coolify deployment",
        branch: git_branch ?? "main",
        finished_at: deployStatus !== "building" ? new Date().toISOString() : null,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
