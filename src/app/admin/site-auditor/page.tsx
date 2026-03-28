"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, AlertTriangle, CheckCircle2, Info,
  Loader2, RefreshCw, Globe, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Severity = "critical" | "warning" | "info";
type AuditItem = {
  category: string;
  issue: string;
  severity: Severity;
  recommendation: string;
  page?: string;
};
type AuditResult = {
  site_id: string;
  site_name: string;
  score: number;
  summary: string;
  items: AuditItem[];
  generated_at: string;
};
type Site = { id: string; name: string; domain: string | null };

const SEV_CONFIG: Record<Severity, { label: string; color: string; icon: React.ReactNode; border: string }> = {
  critical: { label: "קריטי",  color: "text-red-600 bg-red-50",     border: "border-red-200",    icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
  warning:  { label: "אזהרה", color: "text-amber-700 bg-amber-50",  border: "border-amber-200",  icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
  info:     { label: "מידע",   color: "text-blue-600 bg-blue-50",    border: "border-blue-200",   icon: <Info className="h-4 w-4 text-blue-400" /> },
};

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg width={128} height={128} className="-rotate-90">
        <circle cx={64} cy={64} r={52} fill="none" stroke="#e2e8f0" strokeWidth={10} />
        <circle
          cx={64} cy={64} r={52}
          fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="mt-[-80px] flex flex-col items-center">
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-400 mt-0.5">ציון כולל</span>
      </div>
      <div className="mt-12" />
    </div>
  );
}

export default function SiteAuditorPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [auditing, setAuditing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState<Severity | "all">("all");

  useEffect(() => {
    fetch("/api/sites")
      .then(r => r.json())
      .then((data: Site[]) => {
        setSites(data);
        if (data.length > 0) setSelectedSite(data[0].id);
      });
  }, []);

  const runAudit = async () => {
    if (!selectedSite) return;
    setAuditing(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_id: selectedSite }),
      });
      const data = await res.json() as AuditResult;
      setResult(data);
      setFilter("all");
      setExpanded(null);
    } finally {
      setAuditing(false);
    }
  };

  const filtered = result?.items.filter(i => filter === "all" || i.severity === filter) ?? [];
  const criticalCount = result?.items.filter(i => i.severity === "critical").length ?? 0;
  const warningCount  = result?.items.filter(i => i.severity === "warning").length ?? 0;

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" /> AI Site Auditor
          </h1>
          <p className="text-slate-500 text-sm mt-1">ניתוח SEO, תוכן והמרות בכל אתר</p>
        </div>
      </div>

      {/* Site selector + run */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-500 block mb-1">בחר אתר</label>
            <select
              value={selectedSite ?? ""}
              onChange={e => setSelectedSite(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}{s.domain ? ` (${s.domain})` : ""}</option>
              ))}
            </select>
          </div>
          <div className="pt-5">
            <Button
              onClick={runAudit}
              disabled={auditing || !selectedSite}
              className="bg-purple-600 hover:bg-purple-700 gap-2"
            >
              {auditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {auditing ? "מנתח..." : "הפעל ניתוח"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {auditing && (
        <div className="text-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-slate-500">Claude מנתח את האתר...</p>
          <p className="text-xs text-slate-400 mt-1">בודק SEO, תוכן, CTA, ומבנה עמודים</p>
        </div>
      )}

      {result && !auditing && (
        <div className="space-y-5">
          {/* Score + summary */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-l from-purple-600 to-indigo-700 px-6 py-5 text-white flex items-center gap-6">
              <ScoreGauge score={result.score} />
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-1">{result.site_name}</h2>
                <p className="text-purple-100 text-sm leading-relaxed">{result.summary}</p>
                <div className="flex gap-3 mt-4">
                  {criticalCount > 0 && (
                    <span className="bg-red-500/20 text-red-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                      🚨 {criticalCount} קריטי
                    </span>
                  )}
                  {warningCount > 0 && (
                    <span className="bg-amber-500/20 text-amber-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                      ⚠️ {warningCount} אזהרה
                    </span>
                  )}
                  <span className="bg-white/10 text-purple-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {result.items.length} ממצאים
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "critical", "warning", "info"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                  filter === f ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                )}
              >
                {f === "all" ? `הכל (${result.items.length})` : `${SEV_CONFIG[f].label} (${result.items.filter(i => i.severity === f).length})`}
              </button>
            ))}
          </div>

          {/* Issues list */}
          <div className="space-y-2">
            {filtered.map((item, i) => {
              const sev = SEV_CONFIG[item.severity];
              const isOpen = expanded === i;
              return (
                <div
                  key={i}
                  className={cn("rounded-xl border overflow-hidden transition-all", sev.border)}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : i)}
                    className="w-full flex items-center gap-3 p-4 text-right hover:bg-slate-50 transition-colors"
                  >
                    {sev.icon}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-800">{item.issue}</span>
                        <Badge variant="outline" className={cn("text-xs", sev.color)}>{item.category}</Badge>
                        {item.page && (
                          <span className="text-xs text-slate-400 font-mono">/{item.page}</span>
                        )}
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pr-11">
                      <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 leading-relaxed">
                        <span className="font-semibold text-slate-700">המלצה: </span>
                        {item.recommendation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 text-center">
            נוצר: {new Date(result.generated_at).toLocaleString("he-IL")}
          </p>
        </div>
      )}
    </div>
  );
}
