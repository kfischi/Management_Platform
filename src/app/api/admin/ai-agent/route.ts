/**
 * POST /api/admin/ai-agent
 *
 * Autonomous AI Agent — runs in the background and performs lead nurturing tasks:
 *   1. Finds leads that haven't been contacted in N days → auto-enroll in a sequence or flag
 *   2. Analyzes cold leads and generates AI insights
 *   3. Creates follow-up tasks in audit_logs
 *   4. Optionally triggers WhatsApp/email follow-ups
 *
 * Called by Vercel Cron (/api/admin/ai-agent daily) or triggered manually.
 * Protected by CRON_SECRET or admin session.
 *
 * body: { mode: "nurture" | "score" | "report" | "all" }
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  score: number | null;
  ai_insight: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const supabase = await createClient();

  // Auth check
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if ((profile as { role: string } | null)?.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { mode = "all" } = await req.json().catch(() => ({})) as { mode?: string };

  // Get API key
  const { data: settingsRaw } = await supabase
    .from("agency_settings")
    .select("key, value")
    .in("key", ["claude_api_key", "resend_api_key", "resend_from_email"]);

  const settings: Record<string, string> = {};
  for (const row of (settingsRaw ?? []) as { key: string; value: string | null }[]) {
    if (row.value) settings[row.key] = row.value;
  }

  const apiKey = settings["claude_api_key"] ?? process.env.ANTHROPIC_API_KEY;
  const results: Record<string, unknown> = {};

  /* ── Mode: score ── Score/re-score stale leads ── */
  if (mode === "score" || mode === "all") {
    const { data: leadsRaw } = await supabase
      .from("leads")
      .select("id, name, email, phone, company, status, score, ai_insight, tags, created_at, updated_at")
      .in("status", ["new", "contacted"])
      .is("ai_insight", null)
      .limit(20);

    const leads = (leadsRaw ?? []) as Lead[];
    let scored = 0;

    if (apiKey && leads.length > 0) {
      for (const lead of leads) {
        try {
          const prompt = `Analyze this lead and return a JSON object with:
{
  "score": <0-100 integer>,
  "insight": "<1-2 sentence Hebrew insight about the lead's potential>",
  "suggested_action": "<specific next action in Hebrew>"
}

Lead data:
- Name: ${lead.name ?? "לא ידוע"}
- Email: ${lead.email ? "יש" : "אין"}
- Phone: ${lead.phone ? "יש" : "אין"}
- Company: ${lead.company ?? "לא ידוע"}
- Status: ${lead.status}
- Created: ${lead.created_at}
- Tags: ${(lead.tags ?? []).join(", ") || "אין"}

Respond with ONLY the JSON object.`;

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
              messages: [{ role: "user", content: prompt }],
            }),
          });

          if (!anthropicRes.ok) continue;
          const msg = await anthropicRes.json() as { content: { type: string; text: string }[] };

          const raw = msg.content
            .filter((b: { type: string }) => b.type === "text")
            .map((b: { type: string; text: string }) => b.text)
            .join("")
            .replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

          const parsed = JSON.parse(raw) as { score: number; insight: string; suggested_action: string };

          await supabase.from("leads").update({
            score: parsed.score,
            ai_insight: `${parsed.insight} פעולה מוצעת: ${parsed.suggested_action}`,
          }).eq("id", lead.id);

          scored++;
        } catch { /* skip individual failures */ }
      }
    }

    results.scored = scored;
  }

  /* ── Mode: nurture ── Find cold leads and auto-enroll ── */
  if (mode === "nurture" || mode === "all") {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 3); // leads not updated in 3+ days

    const { data: coldLeadsRaw } = await supabase
      .from("leads")
      .select("id, name, email, status")
      .in("status", ["new", "contacted"])
      .lt("updated_at", cutoff.toISOString())
      .not("email", "is", null)
      .limit(30);

    const coldLeads = (coldLeadsRaw ?? []) as { id: string; name: string | null; email: string; status: string }[];

    // Find the first active "manual" sequence to auto-enroll into
    const { data: sequenceRaw } = await supabase
      .from("email_sequences")
      .select("id")
      .eq("is_active", true)
      .eq("trigger", "new_lead")
      .limit(1)
      .single();

    let enrolled = 0;
    if (sequenceRaw && coldLeads.length > 0) {
      const seqId = (sequenceRaw as { id: string }).id;

      // Only enroll leads not already in this sequence
      const { data: existingRaw } = await supabase
        .from("email_sequence_enrollments")
        .select("lead_id")
        .eq("sequence_id", seqId)
        .in("lead_id", coldLeads.map(l => l.id));

      const alreadyEnrolled = new Set(
        (existingRaw ?? []).map((e: { lead_id: string }) => e.lead_id)
      );
      const toEnroll = coldLeads.filter(l => !alreadyEnrolled.has(l.id));

      if (toEnroll.length > 0) {
        // Get first step delay
        const { data: firstStep } = await supabase
          .from("email_sequence_steps")
          .select("delay_days")
          .eq("sequence_id", seqId)
          .order("step_number")
          .limit(1)
          .single();

        const delay = (firstStep as { delay_days: number } | null)?.delay_days ?? 0;
        const nextSend = new Date();
        nextSend.setDate(nextSend.getDate() + delay);

        await supabase.from("email_sequence_enrollments").insert(
          toEnroll.map(l => ({
            sequence_id: seqId,
            lead_id: l.id,
            current_step: 0,
            next_send_at: nextSend.toISOString(),
            status: "active",
          }))
        );

        enrolled = toEnroll.length;
      }
    }

    results.cold_leads_found = coldLeads.length;
    results.enrolled_in_sequence = enrolled;
  }

  /* ── Mode: report ── Generate daily AI summary ── */
  if (mode === "report" || mode === "all") {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const [leadsRes, emailLogsRes] = await Promise.all([
      supabase
        .from("leads")
        .select("status, score")
        .gte("created_at", yesterday.toISOString()),
      supabase
        .from("email_logs")
        .select("status")
        .gte("sent_at", yesterday.toISOString()),
    ]);

    const newLeads = (leadsRes.data ?? []).length;
    const emailsSent = (emailLogsRes.data ?? []).length;
    const emailsFailed = (emailLogsRes.data ?? []).filter((e: { status: string }) => e.status === "failed").length;

    results.daily_report = {
      new_leads: newLeads,
      emails_sent: emailsSent,
      emails_failed: emailsFailed,
      generated_at: new Date().toISOString(),
    };

    // Log to audit
    await supabase.from("audit_logs").insert({
      user_id: null,
      action: "ai_agent.daily_report",
      resource_type: "system",
      resource_id: null,
      metadata: results.daily_report,
    } as never);
  }

  return NextResponse.json({ ok: true, mode, results });
}
