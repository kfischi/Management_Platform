/**
 * POST /api/admin/ai-generate
 *
 * Generate site block content with Claude.
 * body: {
 *   type: "hero" | "text" | "services" | "faq" | "testimonials" | "cta" | ...
 *   context: string   — business description / brief
 *   language?: "he" | "en"  (default "he")
 * }
 * Returns: { content: Record<string, unknown> } — ready to use as block content
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

const BLOCK_PROMPTS: Record<string, string> = {
  hero: `Generate a hero section JSON with these fields:
    { "title": "...", "subtitle": "...", "cta_text": "...", "cta_link": "#contact" }
    The title should be bold and attention-grabbing. subtitle should be 1 sentence. CTA should be action-oriented.`,

  text: `Generate a text section JSON:
    { "heading": "...", "body": "..." }
    heading: compelling 3-6 word section title. body: 2-3 informative paragraphs about the business.`,

  services: `Generate a services section JSON:
    { "heading": "השירותים שלנו", "services": [{ "title": "...", "desc": "...", "icon": "emoji" }, ...] }
    Include 3-4 services with relevant emoji icons. Each desc should be 1-2 sentences.`,

  faq: `Generate an FAQ section JSON:
    { "heading": "שאלות נפוצות", "items": [{ "q": "...", "a": "..." }, ...] }
    Include 4-5 realistic FAQ questions and clear answers for this type of business.`,

  testimonials: `Generate a testimonials section JSON:
    { "heading": "מה אומרים עלינו", "testimonials": [{ "name": "...", "text": "...", "role": "..." }, ...] }
    Include 3 realistic testimonials with Israeli-sounding names.`,

  cta: `Generate a call-to-action section JSON:
    { "heading": "...", "subtext": "...", "cta_text": "...", "cta_link": "#contact" }
    heading: urgency-driven. subtext: 1 line value proposition. cta_text: action verb.`,

  contact: `Generate a contact section JSON:
    { "heading": "צרו קשר", "subtext": "...", "phone": "", "email": "", "address": "" }
    Leave phone/email/address empty (client will fill in). subtext: 1 warm inviting sentence.`,
};

export async function POST(req: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { type, context, language = "he" } = await req.json() as {
    type: string;
    context: string;
    language?: string;
  };

  if (!type || !context)
    return NextResponse.json({ error: "type ו-context הם שדות חובה" }, { status: 400 });

  const blockPrompt = BLOCK_PROMPTS[type];
  if (!blockPrompt)
    return NextResponse.json({ error: `סוג בלוק לא נתמך: ${type}` }, { status: 400 });

  // Get API key from agency settings
  const { data: settingsRaw } = await supabase
    .from("agency_settings")
    .select("key, value")
    .in("key", ["claude_api_key"]);

  const settings: Record<string, string> = {};
  for (const row of (settingsRaw ?? []) as { key: string; value: string | null }[]) {
    if (row.value) settings[row.key] = row.value;
  }

  const apiKey = settings["claude_api_key"] ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Claude API key לא מוגדר" }, { status: 500 });

  const systemPrompt = `You are a professional copywriter specializing in Israeli businesses.
Write all text in ${language === "he" ? "Hebrew" : "English"}.
Always respond with ONLY valid JSON — no markdown, no explanation, just the raw JSON object.
Tailor the content specifically to the business description provided.`;

  const userPrompt = `Business description: ${context}

${blockPrompt}

Respond with ONLY the JSON object, nothing else.`;

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
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return NextResponse.json({ error: `Claude API error: ${err}` }, { status: 500 });
    }

    const message = await anthropicRes.json() as { content: { type: string; text: string }[] };

    const rawText = message.content
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { type: string; text: string }) => b.text)
      .join("");

    // Strip any markdown code fences if Claude added them
    const cleaned = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let content: Record<string, unknown>;
    try {
      content = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Claude החזיר JSON לא תקין", raw: cleaned }, { status: 500 });
    }

    return NextResponse.json({ content });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "שגיאה לא ידועה";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
