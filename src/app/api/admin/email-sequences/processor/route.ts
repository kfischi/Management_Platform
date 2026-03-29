/**
 * POST /api/admin/email-sequences/processor
 *
 * Processes all active enrollments whose next_send_at <= now.
 * Sends the next step email via Resend, advances current_step,
 * and schedules the step after that.
 *
 * Designed to be called by a Vercel Cron Job (every 15 min) or N8N.
 * Protected by CRON_SECRET env var.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Enrollment = {
  id: string;
  sequence_id: string;
  lead_id: string;
  current_step: number;
  next_send_at: string;
  status: string;
};
type Lead = { id: string; name: string | null; email: string | null };
type Step = {
  id: string;
  sequence_id: string;
  step_number: number;
  delay_days: number;
  subject: string;
  body_html: string;
  from_name: string | null;
  from_email: string | null;
};

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  fromName: string;
  fromEmail: string;
  resendKey: string;
}): Promise<{ id?: string; error?: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${opts.fromName} <${opts.fromEmail}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  });
  const json = await res.json() as { id?: string; message?: string };
  if (!res.ok) return { error: json.message ?? `HTTP ${res.status}` };
  return { id: json.id };
}

function personalise(html: string, lead: Lead): string {
  return html
    .replace(/{{name}}/g, lead.name ?? "")
    .replace(/{{email}}/g, lead.email ?? "");
}

export async function POST(req: NextRequest) {
  // Security: require either admin session or CRON_SECRET header
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const supabase = await createClient();

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      // Fall back to checking admin session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", user.id).single();
      if ((profile as { role: string } | null)?.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Get Resend key + from defaults from agency settings
  const { data: settingsRaw } = await supabase
    .from("agency_settings")
    .select("key, value")
    .in("key", ["resend_api_key", "resend_from_email", "resend_from_name"]);

  const settings: Record<string, string> = {};
  for (const row of (settingsRaw ?? []) as { key: string; value: string | null }[]) {
    if (row.value) settings[row.key] = row.value;
  }

  const resendKey = settings["resend_api_key"];
  if (!resendKey) {
    return NextResponse.json({ error: "Resend API key לא מוגדר" }, { status: 500 });
  }

  const defaultFromEmail = settings["resend_from_email"] ?? "noreply@agency.co.il";
  const defaultFromName  = settings["resend_from_name"]  ?? "הסוכנות";

  // Find enrollments due now
  const now = new Date().toISOString();
  const { data: enrollmentsRaw } = await supabase
    .from("email_sequence_enrollments")
    .select("*")
    .eq("status", "active")
    .lte("next_send_at", now)
    .limit(50); // process max 50 per run to stay within timeout

  const enrollments = (enrollmentsRaw ?? []) as Enrollment[];
  if (enrollments.length === 0)
    return NextResponse.json({ processed: 0, message: "אין אימיילים לשליחה כרגע" });

  let sent = 0;
  let failed = 0;

  for (const enrollment of enrollments) {
    try {
      const nextStepNumber = enrollment.current_step + 1;

      // Get the next step
      const { data: stepRaw } = await supabase
        .from("email_sequence_steps")
        .select("*")
        .eq("sequence_id", enrollment.sequence_id)
        .eq("step_number", nextStepNumber)
        .single();

      const step = stepRaw as Step | null;

      if (!step) {
        // No more steps — mark enrollment complete
        await supabase
          .from("email_sequence_enrollments")
          .update({ status: "completed", completed_at: now })
          .eq("id", enrollment.id);
        continue;
      }

      // Get lead email
      const { data: leadRaw } = await supabase
        .from("leads")
        .select("id, name, email")
        .eq("id", enrollment.lead_id)
        .single();

      const lead = leadRaw as Lead | null;
      if (!lead?.email) {
        // Skip leads with no email — advance anyway
        await supabase
          .from("email_sequence_enrollments")
          .update({ current_step: nextStepNumber })
          .eq("id", enrollment.id);
        continue;
      }

      // Send
      const result = await sendEmail({
        to: lead.email,
        subject: personalise(step.subject, lead),
        html: personalise(step.body_html, lead),
        fromName: step.from_name ?? defaultFromName,
        fromEmail: step.from_email ?? defaultFromEmail,
        resendKey,
      });

      // Log the send
      await supabase.from("email_logs").insert({
        enrollment_id: enrollment.id,
        step_id: step.id,
        lead_id: lead.id,
        to_email: lead.email,
        subject: step.subject,
        resend_id: result.id ?? null,
        status: result.error ? "failed" : "sent",
      });

      if (result.error) {
        failed++;
        continue;
      }

      // Schedule next step
      const { data: nextStepRaw } = await supabase
        .from("email_sequence_steps")
        .select("delay_days")
        .eq("sequence_id", enrollment.sequence_id)
        .eq("step_number", nextStepNumber + 1)
        .single();

      const nextStep = nextStepRaw as { delay_days: number } | null;

      if (nextStep) {
        const nextSend = new Date();
        nextSend.setDate(nextSend.getDate() + nextStep.delay_days);
        await supabase
          .from("email_sequence_enrollments")
          .update({ current_step: nextStepNumber, next_send_at: nextSend.toISOString() })
          .eq("id", enrollment.id);
      } else {
        // Last step — complete
        await supabase
          .from("email_sequence_enrollments")
          .update({ current_step: nextStepNumber, status: "completed", completed_at: now })
          .eq("id", enrollment.id);
      }

      sent++;
    } catch (e) {
      console.error("Sequence processor error:", e);
      failed++;
    }
  }

  return NextResponse.json({ processed: enrollments.length, sent, failed });
}
