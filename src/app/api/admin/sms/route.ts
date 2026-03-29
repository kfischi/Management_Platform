/**
 * POST /api/admin/sms
 * Send SMS via Twilio
 * body: { to: string, message: string }
 *
 * GET /api/admin/sms
 * Returns SMS settings status
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { data } = await supabase
    .from("agency_settings")
    .select("key, value")
    .in("key", ["twilio_account_sid", "twilio_auth_token", "twilio_from_number"]);

  const settings: Record<string, string> = {};
  for (const row of (data ?? []) as { key: string; value: string | null }[]) {
    if (row.value) settings[row.key] = row.value;
  }

  return NextResponse.json({
    configured: !!(settings.twilio_account_sid && settings.twilio_auth_token && settings.twilio_from_number),
  });
}

export async function POST(req: NextRequest) {
  const { supabase, user, error } = await requireAdmin();
  if (error) return error;

  const { to, message } = await req.json() as { to: string; message: string };
  if (!to || !message)
    return NextResponse.json({ error: "to ו-message הם שדות חובה" }, { status: 400 });

  const { data: settingsRaw } = await supabase
    .from("agency_settings")
    .select("key, value")
    .in("key", ["twilio_account_sid", "twilio_auth_token", "twilio_from_number"]);

  const settings: Record<string, string> = {};
  for (const row of (settingsRaw ?? []) as { key: string; value: string | null }[]) {
    if (row.value) settings[row.key] = row.value;
  }

  const sid   = settings.twilio_account_sid   ?? process.env.TWILIO_ACCOUNT_SID;
  const token = settings.twilio_auth_token    ?? process.env.TWILIO_AUTH_TOKEN;
  const from  = settings.twilio_from_number   ?? process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from)
    return NextResponse.json({ error: "Twilio לא מוגדר — הגדר בהגדרות הסוכנות" }, { status: 400 });

  // Normalise Israeli number: 05x → +9725x
  const normalised = to.replace(/^0/, "+972").replace(/\D/g, "").replace(/^972/, "+972");

  const formData = new URLSearchParams({
    To: normalised,
    From: from,
    Body: message,
  });

  const twilioRes = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    }
  );

  if (!twilioRes.ok) {
    const err = await twilioRes.json().catch(() => ({})) as { message?: string };
    return NextResponse.json({ error: err.message ?? `Twilio error ${twilioRes.status}` }, { status: 502 });
  }

  const result = await twilioRes.json() as { sid: string; status: string };

  // Audit log
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "sms.sent",
    resource_type: "communications",
    resource_id: null,
    metadata: { to: normalised, sid: result.sid, status: result.status },
  });

  return NextResponse.json({ ok: true, sid: result.sid, status: result.status });
}
