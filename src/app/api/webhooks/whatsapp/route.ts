import { NextResponse } from "next/server";

// WhatsApp Business Cloud API Webhook
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Process incoming WhatsApp messages
    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry ?? []) {
        for (const change of entry.changes ?? []) {
          const messages = change.value?.messages ?? [];

          for (const message of messages) {
            console.log("Incoming WhatsApp:", {
              from: message.from,
              type: message.type,
              text: message.text?.body,
            });

            // Forward to N8N for processing
            if (process.env.N8N_WHATSAPP_WEBHOOK_URL) {
              await fetch(process.env.N8N_WHATSAPP_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, contact: change.value?.contacts?.[0] }),
              }).catch(console.error);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
