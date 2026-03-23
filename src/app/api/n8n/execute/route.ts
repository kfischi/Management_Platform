import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workflowId, data } = await request.json();

  const n8nUrl = process.env.N8N_URL;
  const n8nApiKey = process.env.N8N_API_KEY;

  if (!n8nUrl || !n8nApiKey) {
    return NextResponse.json({ error: "N8N not configured" }, { status: 400 });
  }

  try {
    const response = await fetch(`${n8nUrl}/api/v1/workflows/${workflowId}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": n8nApiKey,
      },
      body: JSON.stringify({ workflowData: data }),
    });

    const result = await response.json();

    // Log execution
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "automation.executed",
      resource_type: "automations",
      resource_id: workflowId,
      metadata: { result: result.id },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "N8N execution failed" }, { status: 500 });
  }
}
