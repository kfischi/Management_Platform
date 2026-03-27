/**
 * GET /api/admin/communications
 *   Returns { notifications, whatsappConnected, resendConnected, resendEmails }
 *
 * POST /api/admin/communications
 *   body: { channel: "whatsapp" | "email", to, message, subject? }
 *   Sends via Resend (email) or N8N Evolution API (WhatsApp)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import type { Database } from "@/types/database";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
type SettingRow = { key: string; value: string | null };

async function getSettings(supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>) {
  const { data } = await supabase.from("agency_settings").select("key, value");
  const map: Record<string, string | null> = {};
  for (const row of (data ?? []) as SettingRow[]) map[row.key] = row.value;
  return map;
}

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const [settings, notifResult] = await Promise.all([
    getSettings(supabase),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  const notifications = (notifResult.data ?? []) as NotificationRow[];

  const resendKey = settings["resend_api_key"];
  const whatsappToken = settings["whatsapp_token"] || settings["evolution_api_key"];
  const n8nUrl = process.env.N8N_URL;

  // Fetch sent emails from Resend if key is configured
  let resendEmails: { id: string; to: string[]; subject: string; created_at: string; last_event: string }[] = [];
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails?limit=20", {
        headers: { Authorization: `Bearer ${resendKey}` },
      });
      if (res.ok) {
        const json = await res.json();
        resendEmails = json.data ?? [];
      }
    } catch { /* ignore */ }
  }

  return NextResponse.json({
    notifications,
    whatsappConnected: !!(whatsappToken || n8nUrl),
    resendConnected: !!resendKey,
    resendEmails,
    stats: {
      totalNotifications: notifications.length,
      unread: notifications.filter(n => !n.read).length,
    },
  });
}

export async function POST(req: NextRequest) {
  const { supabase, user, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { channel, to, message, subject } = body as {
    channel: "whatsapp" | "email";
    to: string;
    message: string;
    subject?: string;
  };

  if (!channel || !to || !message) {
    return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
  }

  const settings = await getSettings(supabase);

  if (channel === "email") {
    const resendKey = settings["resend_api_key"];
    const fromEmail = settings["resend_from_email"] ?? "noreply@agency.co.il";
    if (!resendKey) return NextResponse.json({ error: "Resend לא מוגדר" }, { status: 400 });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromEmail, to, subject: subject ?? "הודעה מהסוכנות", html: `<p>${message}</p>` }),
    });
    const json = await res.json();
    if (!res.ok) return NextResponse.json({ error: json.message ?? "שגיאה בשליחת אימייל" }, { status: 500 });
    return NextResponse.json({ ok: true, id: json.id });
  }

  if (channel === "whatsapp") {
    // Try N8N Evolution API webhook
    const n8nWhatsappWebhook = settings["n8n_whatsapp_webhook"] ?? process.env.N8N_WHATSAPP_WEBHOOK;
    const evolutionKey = settings["evolution_api_key"];
    const evolutionUrl = settings["evolution_api_url"] ?? process.env.EVOLUTION_API_URL;

    if (evolutionUrl && evolutionKey) {
      // Direct Evolution API
      const instanceName = settings["evolution_instance"] ?? "default";
      const res = await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
        method: "POST",
        headers: { apikey: evolutionKey, "Content-Type": "application/json" },
        body: JSON.stringify({ number: to.replace(/\D/g, ""), textMessage: { text: message } }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        return NextResponse.json({ error: (json as { message?: string }).message ?? "שגיאה בשליחת WhatsApp" }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    if (n8nWhatsappWebhook) {
      const res = await fetch(n8nWhatsappWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, message, sent_by: user.id }),
      });
      if (!res.ok) return NextResponse.json({ error: "N8N שגיאה" }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "WhatsApp לא מוגדר — הגדר Evolution API URL בהגדרות" }, { status: 400 });
  }

  return NextResponse.json({ error: "ערוץ לא נתמך" }, { status: 400 });
}
