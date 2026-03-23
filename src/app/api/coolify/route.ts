import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const coolifyHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${process.env.COOLIFY_API_TOKEN}`,
});

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource");
  const coolifyUrl = process.env.COOLIFY_URL;

  if (!coolifyUrl) return NextResponse.json({ error: "Coolify not configured" }, { status: 400 });

  try {
    let endpoint = "";
    if (resource === "servers") endpoint = "/api/v1/servers";
    else if (resource === "applications") endpoint = "/api/v1/applications";
    else if (resource === "services") endpoint = "/api/v1/services";
    else if (resource === "databases") endpoint = "/api/v1/databases";
    else return NextResponse.json({ error: "Invalid resource" }, { status: 400 });

    const response = await fetch(`${coolifyUrl}${endpoint}`, {
      headers: coolifyHeaders(),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Coolify API error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, applicationId } = await request.json();
  const coolifyUrl = process.env.COOLIFY_URL;

  if (!coolifyUrl) return NextResponse.json({ error: "Coolify not configured" }, { status: 400 });

  const actionMap: Record<string, string> = {
    deploy: "deploy",
    restart: "restart",
    stop: "stop",
    start: "start",
  };

  if (!actionMap[action]) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  try {
    const response = await fetch(
      `${coolifyUrl}/api/v1/applications/${applicationId}/${actionMap[action]}`,
      { method: "POST", headers: coolifyHeaders() }
    );
    const data = await response.json();

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: `coolify.${action}`,
      resource_type: "applications",
      resource_id: applicationId,
      metadata: { result: data },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Coolify action failed" }, { status: 500 });
  }
}
