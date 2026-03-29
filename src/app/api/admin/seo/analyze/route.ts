import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  // Normalize URL
  const normalized = url.startsWith("http") ? url : `https://${url}`;

  // Call Google PageSpeed Insights (free, no key needed for basic usage)
  const apiKey = process.env.PAGESPEED_API_KEY ?? "";
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalized)}&strategy=mobile${apiKey ? `&key=${apiKey}` : ""}`;

  try {
    const psRes = await fetch(apiUrl, { signal: AbortSignal.timeout(30000) });
    if (!psRes.ok) throw new Error(`PageSpeed API ${psRes.status}`);

    const ps = await psRes.json();
    const cats = ps.lighthouseResult?.categories;
    const audits = ps.lighthouseResult?.audits;

    const score = Math.round((cats?.performance?.score ?? 0) * 100);
    const accessibility = Math.round((cats?.accessibility?.score ?? 0) * 100);
    const bestPractices = Math.round((cats?.["best-practices"]?.score ?? 0) * 100);
    const seo = Math.round((cats?.seo?.score ?? 0) * 100);

    // Extract key audits
    const issues: Array<{ title: string; description: string; impact: string; passed: boolean }> = [];
    const keyAudits = [
      "meta-description", "document-title", "link-text", "crawlable-anchors",
      "robots-txt", "image-alt", "hreflang", "canonical",
      "structured-data", "tap-targets", "font-size", "uses-responsive-images",
    ];
    for (const key of keyAudits) {
      const audit = audits?.[key];
      if (!audit) continue;
      issues.push({
        title: audit.title,
        description: audit.description ?? "",
        impact: audit.score === 1 ? "none" : audit.score === null ? "info" : audit.score < 0.5 ? "high" : "medium",
        passed: audit.score === 1 || audit.score === null,
      });
    }

    // LCP / FID / CLS
    const lcp = audits?.["largest-contentful-paint"]?.displayValue ?? "—";
    const fcp = audits?.["first-contentful-paint"]?.displayValue ?? "—";
    const cls = audits?.["cumulative-layout-shift"]?.displayValue ?? "—";
    const tbt = audits?.["total-blocking-time"]?.displayValue ?? "—";

    // Title & description
    const titleAudit = audits?.["document-title"];
    const descAudit  = audits?.["meta-description"];

    return NextResponse.json({
      url: normalized,
      score,
      accessibility,
      bestPractices,
      seo,
      vitals: { lcp, fcp, cls, tbt },
      title: titleAudit?.details?.items?.[0]?.snippet ?? null,
      description: descAudit?.details?.items?.[0]?.snippet ?? null,
      issues,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
