import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function POST(req: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { messages, model, system } = await req.json();

  // Fetch API key from settings
  const { data: settings } = await supabase
    .from("agency_settings")
    .select("key, value")
    .in("key", ["claude_api_key", "openai_api_key", "ai_provider"]);

  const settingsMap = Object.fromEntries((settings ?? []).map(r => [r.key, r.value]));
  const provider = settingsMap.ai_provider ?? "claude";

  if (provider === "claude") {
    const apiKey = settingsMap.claude_api_key;
    if (!apiKey) {
      return NextResponse.json({ error: "Claude API key not configured in Settings" }, { status: 400 });
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: model ?? "claude-opus-4-6",
        max_tokens: 1024,
        system: system ?? "You are a helpful assistant for a digital agency. Answer concisely in the same language as the user's message.",
        messages,
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return NextResponse.json({ error: `Anthropic API error: ${err}` }, { status: 500 });
    }

    const data = await anthropicRes.json();
    const text = data.content?.[0]?.text ?? "";
    return NextResponse.json({ role: "assistant", content: text });
  }

  if (provider === "openai") {
    const apiKey = settingsMap.openai_api_key;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured in Settings" }, { status: 400 });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: model ?? "gpt-4o",
        messages: system ? [{ role: "system", content: system }, ...messages] : messages,
        max_tokens: 1024,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return NextResponse.json({ error: `OpenAI API error: ${err}` }, { status: 500 });
    }

    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ role: "assistant", content: text });
  }

  return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
}
