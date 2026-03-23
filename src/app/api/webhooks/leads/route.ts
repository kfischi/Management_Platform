import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name, email, phone, company, message,
      source = "webhook", utm_source, utm_campaign,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Create client record
    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        profile_id: "00000000-0000-0000-0000-000000000000", // placeholder
        contact_name: name,
        email,
        phone: phone ?? null,
        company_name: company ?? null,
        notes: message ?? null,
        status: "lead",
        tags: [source, utm_source, utm_campaign].filter(Boolean) as string[],
      })
      .select()
      .single();

    if (error) throw error;

    // Log audit
    await supabase.from("audit_logs").insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      action: "lead.created",
      resource_type: "clients",
      resource_id: client.id,
      metadata: { source, utm_source, utm_campaign },
    });

    // Trigger N8N webhook for follow-up automation
    if (process.env.N8N_LEAD_WEBHOOK_URL) {
      await fetch(process.env.N8N_LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, source }),
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, client_id: client.id });
  } catch (error) {
    console.error("Lead webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
