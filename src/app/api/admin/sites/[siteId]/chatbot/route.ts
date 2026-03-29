import { requireAdmin } from "@/lib/supabase/require-admin";
import { NextRequest, NextResponse } from "next/server";

const CHATBOT_KEYS = [
  "chatbot_enabled",
  "chatbot_greeting",
  "chatbot_context",
  "whatsapp_number",
] as const;

/* ─── GET — read chatbot settings for a site ─── */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { data: rawSettings } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("site_id", siteId)
    .in("key", [...CHATBOT_KEYS]);

  const settings: Record<string, unknown> = {};
  for (const row of (rawSettings ?? []) as { key: string; value: unknown }[]) {
    settings[row.key] = row.value;
  }

  return NextResponse.json({
    enabled:     settings.chatbot_enabled === true,
    greeting:    typeof settings.chatbot_greeting === "string"
                   ? settings.chatbot_greeting
                   : "שלום! אשמח לעזור 😊",
    whatsapp:    typeof settings.whatsapp_number === "string"
                   ? settings.whatsapp_number
                   : "",
    context:     (typeof settings.chatbot_context === "object" && settings.chatbot_context !== null)
                   ? settings.chatbot_context as Record<string, unknown>
                   : {},
  });
}

/* ─── PUT — upsert chatbot settings ─── */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json() as {
    enabled:  boolean;
    greeting: string;
    whatsapp: string;
    context:  Record<string, unknown>;
  };

  const rows = [
    { site_id: siteId, key: "chatbot_enabled",  value: body.enabled },
    { site_id: siteId, key: "chatbot_greeting", value: body.greeting },
    { site_id: siteId, key: "whatsapp_number",  value: body.whatsapp },
    { site_id: siteId, key: "chatbot_context",  value: body.context },
  ];

  const { error: upsertError } = await supabase
    .from("site_settings")
    .upsert(rows as any, { onConflict: "site_id,key" });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
