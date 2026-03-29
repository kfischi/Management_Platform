/**
 * POST /api/admin/seo-audit
 * AI Site Auditor — analyzes a site's pages and blocks with Claude.
 * body: { site_id: string }
 *
 * Returns structured audit with scores and recommendations.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

interface AuditItem {
  category: string;
  issue: string;
  severity: "critical" | "warning" | "info";
  recommendation: string;
  page?: string;
}

interface AuditResult {
  site_id: string;
  site_name: string;
  score: number;
  summary: string;
  items: AuditItem[];
  generated_at: string;
}

export async function POST(req: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { site_id } = await req.json() as { site_id: string };
  if (!site_id) return NextResponse.json({ error: "site_id חובה" }, { status: 400 });

  // Fetch site
  const { data: siteRaw } = await supabase
    .from("sites")
    .select("id, name, domain")
    .eq("id", site_id)
    .single();
  const site = siteRaw as { id: string; name: string; domain: string | null } | null;
  if (!site) return NextResponse.json({ error: "אתר לא נמצא" }, { status: 404 });

  // Fetch all pages
  const { data: pagesRaw } = await supabase
    .from("site_pages")
    .select("id, slug, title, meta_title, meta_desc, is_published")
    .eq("site_id", site_id)
    .order("order_index");
  const pages = (pagesRaw ?? []) as { id: string; slug: string; title: string; meta_title: string | null; meta_desc: string | null; is_published: boolean }[];

  // Fetch blocks for each page
  const pageDetails: { slug: string; title: string; meta_title: string | null; meta_desc: string | null; blocks: { block_type: string; content: Record<string, unknown> }[] }[] = [];
  for (const page of pages) {
    const { data: blocksRaw } = await supabase
      .from("content_blocks")
      .select("block_type, content")
      .eq("page_id", page.id)
      .eq("is_visible", true)
      .order("order_index");
    pageDetails.push({
      slug: page.slug,
      title: page.title,
      meta_title: page.meta_title,
      meta_desc: page.meta_desc,
      blocks: (blocksRaw ?? []) as { block_type: string; content: Record<string, unknown> }[],
    });
  }

  // Get API key
  const { data: settingsRaw } = await supabase
    .from("agency_settings").select("key, value").eq("key", "claude_api_key").single();
  const apiKey = (settingsRaw as { key: string; value: string | null } | null)?.value ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Claude API key לא מוגדר" }, { status: 500 });

  // Build audit prompt
  const siteSnapshot = pageDetails.map(p => `
Page: /${p.slug} (${p.title})
Meta title: ${p.meta_title ?? "MISSING"}
Meta description: ${p.meta_desc ?? "MISSING"}
Blocks: ${p.blocks.map(b => {
    const content = b.content;
    if (b.block_type === "hero") return `Hero: "${content.title ?? ""}"`;
    if (b.block_type === "text") return `Text: "${String(content.heading ?? "").slice(0, 60)}"`;
    return b.block_type;
  }).join(", ")}
`).join("\n---\n");

  const prompt = `You are an expert SEO and web performance auditor for Israeli business websites.
Analyze this site and return a JSON audit report.

Site: ${site.name}
Domain: ${site.domain ?? "not set"}
Pages: ${pages.length}

${siteSnapshot}

Return ONLY this JSON structure (no markdown):
{
  "score": <0-100>,
  "summary": "<2-3 sentence summary in Hebrew>",
  "items": [
    {
      "category": "SEO" | "Content" | "UX" | "Performance" | "Conversion",
      "issue": "<issue description in Hebrew>",
      "severity": "critical" | "warning" | "info",
      "recommendation": "<specific actionable fix in Hebrew>",
      "page": "<slug or null>"
    }
  ]
}

Check for: missing meta titles/descriptions, thin content, no CTA blocks, missing contact info,
no testimonials, no FAQ, unclear value proposition, missing hero, no services listed,
duplicate titles, too many or too few pages, missing alt text, no pricing info.
Return 5-12 items sorted by severity.`;

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text().catch(() => "");
    return NextResponse.json({ error: `Claude error: ${err}` }, { status: 500 });
  }

  const msg = await anthropicRes.json() as { content: { type: string; text: string }[] };
  const raw = msg.content
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { type: string; text: string }) => b.text)
    .join("")
    .replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

  let parsed: { score: number; summary: string; items: AuditItem[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Claude החזיר JSON לא תקין", raw }, { status: 500 });
  }

  const result: AuditResult = {
    site_id,
    site_name: site.name,
    score: parsed.score,
    summary: parsed.summary,
    items: parsed.items,
    generated_at: new Date().toISOString(),
  };

  return NextResponse.json(result);
}
