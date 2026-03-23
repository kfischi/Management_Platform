import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-webhook-signature");

  // Verify signature
  if (process.env.NETLIFY_WEBHOOK_SECRET && signature) {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.NETLIFY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");
    if (signature !== `sha256=${expectedSignature}`) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const event = JSON.parse(body);
  const supabase = await createClient();

  // Find site by netlify_site_id
  const { data: site } = await supabase
    .from("sites")
    .select("id, name")
    .eq("netlify_site_id", event.site_id)
    .single();

  if (!site) {
    return NextResponse.json({ message: "site not found" }, { status: 200 });
  }

  const deployStatus = event.state === "ready" ? "success"
    : event.state === "error" ? "failed"
    : event.state === "building" ? "building"
    : "cancelled";

  // Update site status
  await supabase
    .from("sites")
    .update({
      status: deployStatus === "success" ? "active" : deployStatus === "failed" ? "error" : "building",
      netlify_url: event.deploy_ssl_url || event.deploy_url,
    })
    .eq("id", site.id);

  // Create deployment record
  await supabase.from("deployments").insert({
    site_id: site.id,
    deploy_id: event.id,
    status: deployStatus,
    commit_message: event.title,
    commit_hash: event.commit_ref,
    branch: event.branch,
    deploy_url: event.deploy_ssl_url || event.deploy_url,
    error_message: event.error_message ?? null,
    finished_at: event.updated_at ?? null,
  });

  // Notify via N8N if configured
  if (process.env.N8N_DEPLOY_WEBHOOK_URL) {
    await fetch(process.env.N8N_DEPLOY_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site: site.name, status: deployStatus, event }),
    }).catch(console.error);
  }

  return NextResponse.json({ success: true });
}
