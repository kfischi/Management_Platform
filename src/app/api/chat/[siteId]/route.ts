import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/* ─── GET — return chatbot config (is it enabled + greeting) ─── */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const supabase = await createClient();

  const { data: rawSettings } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("site_id", siteId)
    .in("key", ["chatbot_enabled", "chatbot_greeting", "chatbot_context"]);

  const s: Record<string, unknown> = {};
  for (const row of (rawSettings ?? []) as { key: string; value: unknown }[]) {
    s[row.key] = row.value;
  }

  return NextResponse.json({
    enabled:  s.chatbot_enabled === true,
    greeting: typeof s.chatbot_greeting === "string" ? s.chatbot_greeting : "שלום! אשמח לעזור 😊",
  });
}

/* ─── POST — send a message, get AI reply ─── */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const supabase = await createClient();

  const body = await req.json();
  const { messages, sessionId, visitorId } = body as {
    messages: ChatMessage[];
    sessionId: string | null;
    visitorId: string;
  };

  if (!messages?.length || !visitorId) {
    return NextResponse.json({ error: "Missing messages or visitorId" }, { status: 400 });
  }

  /* ── 1. Fetch chatbot context + Claude API key ── */
  const { data: agencyRaw } = await supabase
    .from("agency_settings")
    .select("key, value")
    .in("key", ["claude_api_key", "ai_provider"]);

  const agency: Record<string, unknown> = {};
  for (const row of (agencyRaw ?? []) as { key: string; value: unknown }[]) {
    agency[row.key] = row.value;
  }

  const { data: siteSettingsRaw } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("site_id", siteId)
    .in("key", ["chatbot_context", "chatbot_greeting", "whatsapp_number"]);

  const siteCfg: Record<string, unknown> = {};
  for (const row of (siteSettingsRaw ?? []) as { key: string; value: unknown }[]) {
    siteCfg[row.key] = row.value;
  }

  const ctx    = (siteCfg.chatbot_context ?? {}) as Record<string, unknown>;
  const waNum  = typeof siteCfg.whatsapp_number === "string" ? siteCfg.whatsapp_number : "";
  const apiKey = typeof agency.claude_api_key === "string" ? agency.claude_api_key : "";

  /* ── 2. Build system prompt ── */
  const businessName = typeof ctx.businessName === "string" ? ctx.businessName : "העסק שלנו";
  const services     = typeof ctx.services === "string"     ? ctx.services     : "";
  const hours        = typeof ctx.hours === "string"        ? ctx.hours        : "";
  const prices       = typeof ctx.prices === "string"       ? ctx.prices       : "";
  const faq          = typeof ctx.faq === "string"          ? ctx.faq          : "";
  const tone         = typeof ctx.tone === "string"         ? ctx.tone         : "ידידותי ומקצועי";
  const phone        = typeof ctx.phone === "string"        ? ctx.phone        : "";

  const systemPrompt = `אתה נציג AI של "${businessName}".
אופי: ${tone}.
${services ? `שירותים: ${services}` : ""}
${prices   ? `מחירים: ${prices}`   : ""}
${hours    ? `שעות פעילות: ${hours}` : ""}
${faq      ? `שאלות נפוצות: ${faq}` : ""}
${phone    ? `טלפון: ${phone}`      : ""}

הנחיות:
• ענה תמיד בעברית, בקצרה ובאדיבות.
• אם לקוח שואל על מחיר שלא ידוע לך — אמור "נשמח לשלוח הצעת מחיר מותאמת אישית, השאר פרטים".
• כשלקוח מספק שם + טלפון — אמור "תודה! נציג יחזור אליך בהקדם 🙏" וסיים את תהליך לכידת הליד.
• אם לא יכול לעזור — הפנה לטלפון ${phone || waNum || "שלנו"}.
• אל תמציא מידע שלא ניתן לך.
• שמור על תשובות קצרות (עד 3 משפטים).`.trim();

  /* ── 3. Ensure session exists ── */
  let activeSessionId = sessionId;
  if (!activeSessionId) {
    const { data: newSession } = await supabase
      .from("chat_sessions")
      .insert({ site_id: siteId, visitor_id: visitorId })
      .select("id")
      .single();
    activeSessionId = (newSession as { id: string } | null)?.id ?? null;
  }

  /* ── 4. Save user message ── */
  const lastUserMsg = messages[messages.length - 1];
  if (activeSessionId && lastUserMsg?.role === "user") {
    await supabase.from("chat_messages").insert({
      session_id: activeSessionId,
      role: "user",
      content: lastUserMsg.content,
    });
  }

  /* ── 5. Call Claude API ── */
  if (!apiKey) {
    const fallback = `שלום! אשמח לעזור. ניתן לפנות אלינו ישירות${phone ? ` בטלפון ${phone}` : ""}.`;
    return NextResponse.json({ content: fallback, sessionId: activeSessionId });
  }

  let replyText = "";
  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        system: systemPrompt,
        messages: messages.slice(-10), // last 10 for context window efficiency
      }),
    });

    if (anthropicRes.ok) {
      const data = await anthropicRes.json();
      replyText = data.content?.[0]?.text ?? "";
    } else {
      replyText = "שגיאה זמנית. נסה שוב בעוד רגע.";
    }
  } catch {
    replyText = "שגיאה זמנית. נסה שוב בעוד רגע.";
  }

  /* ── 6. Save assistant reply ── */
  if (activeSessionId && replyText) {
    await supabase.from("chat_messages").insert({
      session_id: activeSessionId,
      role: "assistant",
      content: replyText,
    });
    // Update last_msg_at
    await supabase
      .from("chat_sessions")
      .update({ last_msg_at: new Date().toISOString() })
      .eq("id", activeSessionId);
  }

  /* ── 7. Lead capture — detect name + phone in conversation ── */
  if (activeSessionId) {
    const fullConversation = messages.map(m => m.content).join("\n");
    const phoneMatch = fullConversation.match(/0[5-9]\d{8}/);
    const nameMatch  = fullConversation.match(/שמ[יי]?\s+([א-ת\s]{2,20})/i) ??
                       fullConversation.match(/אני\s+([א-ת\s]{2,20})/i);

    if (phoneMatch) {
      // Check if lead already exists for this session
      const { data: sessionRaw } = await supabase
        .from("chat_sessions")
        .select("lead_id")
        .eq("id", activeSessionId)
        .single();

      const session = sessionRaw as { lead_id: string | null } | null;
      if (!session?.lead_id) {
        const { data: newLeadRaw } = await supabase
          .from("leads")
          .insert({
            name: nameMatch?.[1]?.trim() ?? "ליד מהצ'אט",
            phone: phoneMatch[0],
            source: "chatbot",
            status: "new" as const,
            score: 60,
            email: null,
            company: null,
            tags: [],
            ai_insight: null,
            notes: null,
            value: null,
          } as any)
          .select("id")
          .single();

        const newLead = newLeadRaw as { id: string } | null;
        if (newLead) {
          await supabase
            .from("chat_sessions")
            .update({ lead_id: newLead.id })
            .eq("id", activeSessionId);
        }
      }
    }
  }

  return NextResponse.json({ content: replyText, sessionId: activeSessionId });
}
