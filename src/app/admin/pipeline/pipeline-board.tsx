"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2, RefreshCw, ChevronRight,
  Rocket, Eye, FileText, CheckCircle2,
  Building2, Star, Plus, Link2, Check as CheckIcon,
  Mail, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import OnboardingWizard from "./onboarding-wizard";

/* ─── types ─── */

type Stage = "lead" | "proposal" | "approved" | "building" | "review" | "approved_live" | "live";

interface PipelineLead {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  value: number;
  score: number;
  pipeline_stage: Stage;
  status: string;
  created_at: string;
  ai_insight: string | null;
  tags: string[];
  sites?: Array<{ id: string; review_token: string | null; review_status: string | null }> | null;
}

/* ─── constants ─── */

const STAGES: { id: Stage; label: string; color: string; bg: string; border: string; icon: React.ReactNode }[] = [
  {
    id: "lead",
    label: "ליד",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <Star className="h-3.5 w-3.5" />,
  },
  {
    id: "proposal",
    label: "הצעת מחיר",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: <FileText className="h-3.5 w-3.5" />,
  },
  {
    id: "approved",
    label: "אושר",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  {
    id: "building",
    label: "בבנייה",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: <Building2 className="h-3.5 w-3.5" />,
  },
  {
    id: "review",
    label: "סקירת לקוח",
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    icon: <Eye className="h-3.5 w-3.5" />,
  },
  {
    id: "approved_live",
    label: "מאושר לעלייה",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  {
    id: "live",
    label: "עלה לאוויר",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: <Rocket className="h-3.5 w-3.5" />,
  },
];

const NEXT_ACTION: Record<Stage, string> = {
  lead:          "שלח הצעה",
  proposal:      "סמן אושר",
  approved:      "התחל בנייה",
  building:      "שלח לסקירה",
  review:        "קבל אישור",
  approved_live: "העלה לאוויר",
  live:          "חי! 🚀",
};

const NEXT_STAGE: Record<Stage, Stage | null> = {
  lead:          "proposal",
  proposal:      "approved",
  approved:      "building",
  building:      "review",
  review:        "approved_live",
  approved_live: "live",
  live:          null,
};

function fmt(n: number) {
  return n >= 1000 ? `₪${(n / 1000).toFixed(1)}k` : `₪${n.toLocaleString()}`;
}

/* ─── lead card ─── */

function LeadCard({
  lead,
  onAdvance,
  advancing,
}: {
  lead: PipelineLead;
  onAdvance: (id: string, to: Stage) => void;
  advancing: string | null;
}) {
  const stageConfig = STAGES.find(s => s.id === lead.pipeline_stage)!;
  const nextStage = NEXT_STAGE[lead.pipeline_stage];
  const isAdvancing = advancing === lead.id;
  const [copied, setCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const siteReviewToken = lead.sites?.[0]?.review_token;

  function copyReviewLink() {
    if (!siteReviewToken) return;
    const url = `${window.location.origin}/review/${siteReviewToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function sendReviewEmail() {
    if (!siteReviewToken || !lead.email || emailSending) return;
    setEmailSending(true);
    try {
      const url = `${window.location.origin}/review/${siteReviewToken}`;
      await fetch("/api/admin/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "email",
          to: lead.email,
          subject: `האתר שלך מוכן לאישור — ${lead.name}`,
          message: `שלום ${lead.name},<br><br>האתר שלך מוכן לסקירה ואישור.<br><br>לחץ על הקישור הבא כדי לצפות ולאשר: <a href="${url}">${url}</a><br><br>בברכה`,
        }),
      });
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{lead.name}</p>
          {lead.company && (
            <p className="text-xs text-slate-400 truncate">{lead.company}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className={cn("h-1.5 w-1.5 rounded-full", lead.score >= 80 ? "bg-green-500" : lead.score >= 60 ? "bg-yellow-500" : "bg-red-400")} />
          <span className="text-xs text-slate-500 font-mono">{lead.score}</span>
        </div>
      </div>

      {/* Value */}
      <p className="text-base font-bold text-indigo-600 mb-2">{fmt(lead.value)}</p>

      {/* AI insight */}
      {lead.ai_insight && (
        <p className="text-xs text-slate-500 italic mb-2 line-clamp-2">{lead.ai_insight}</p>
      )}

      {/* Tags */}
      {lead.tags?.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {lead.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">{t}</span>
          ))}
        </div>
      )}

      {/* Advance button — for `lead` stage, open create-proposal page */}
      {nextStage && lead.pipeline_stage === "lead" && (
        <a
          href={`/admin/proposals?lead_id=${lead.id}&client_name=${encodeURIComponent(lead.name)}&client_email=${encodeURIComponent(lead.email)}&project_name=${encodeURIComponent(lead.company || lead.name)}&value=${lead.value}`}
          className={cn(
            "w-full mt-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg py-1.5 transition-all",
            stageConfig.bg, stageConfig.color, stageConfig.border, "border",
            "hover:brightness-95"
          )}
        >
          <FileText className="h-3 w-3" />
          {NEXT_ACTION[lead.pipeline_stage]}
        </a>
      )}

      {/* Advance button — all other stages */}
      {nextStage && lead.pipeline_stage !== "lead" && (
        <button
          onClick={() => onAdvance(lead.id, nextStage)}
          disabled={isAdvancing}
          className={cn(
            "w-full mt-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg py-1.5 transition-all",
            stageConfig.bg, stageConfig.color, stageConfig.border, "border",
            "hover:brightness-95 disabled:opacity-50"
          )}
        >
          {isAdvancing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          {NEXT_ACTION[lead.pipeline_stage]}
        </button>
      )}

      {/* Review stage: copy + email buttons */}
      {lead.pipeline_stage === "review" && siteReviewToken && (
        <div className="mt-1.5 flex gap-1.5">
          <button
            onClick={copyReviewLink}
            className="flex-1 flex items-center justify-center gap-1 text-xs font-medium rounded-lg py-1.5 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            {copied ? <CheckIcon className="h-3 w-3 text-green-600" /> : <Link2 className="h-3 w-3" />}
            {copied ? "הועתק!" : "קישור"}
          </button>
          {lead.email && (
            <button
              onClick={sendReviewEmail}
              disabled={emailSending}
              className="flex-1 flex items-center justify-center gap-1 text-xs font-medium rounded-lg py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              {emailSending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
              {emailSending ? "שולח..." : "שלח מייל"}
            </button>
          )}
        </div>
      )}

      {/* Live site — show link if available */}
      {lead.pipeline_stage === "live" && (
        <div className="w-full mt-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg py-1.5 bg-green-50 text-green-600 border border-green-200">
          <Rocket className="h-3 w-3" /> חי! 🚀
        </div>
      )}
    </div>
  );
}

/* ─── main board ─── */

export default function PipelineBoard() {
  const [leads, setLeads] = useState<PipelineLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pipeline");
      const data = await res.json() as PipelineLead[];
      setLeads(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdvance = useCallback(async (leadId: string, toStage: Stage) => {
    setAdvancing(leadId);
    try {
      const res = await fetch("/api/admin/pipeline/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, to_stage: toStage }),
      });
      if (res.ok) {
        setLeads(prev =>
          prev.map(l => l.id === leadId ? { ...l, pipeline_stage: toStage } : l)
        );
      }
    } finally {
      setAdvancing(null);
    }
  }, []);

  const grouped = STAGES.reduce<Record<Stage, PipelineLead[]>>((acc, s) => {
    acc[s.id] = leads.filter(l => l.pipeline_stage === s.id);
    return acc;
  }, {} as Record<Stage, PipelineLead[]>);

  const totalPipelineValue = leads
    .filter(l => l.pipeline_stage !== "live")
    .reduce((sum, l) => sum + (l.value || 0), 0);

  const liveCount = grouped["live"].length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline מכירות</h1>
          <p className="text-slate-500 text-sm mt-1">
            {leads.length} עסקאות · פייפליין פתוח: <span className="font-semibold text-indigo-600">{fmt(totalPipelineValue)}</span>
            {liveCount > 0 && <> · <span className="text-green-600 font-semibold">{liveCount} חיים 🚀</span></>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            onClick={() => setShowWizard(true)}
          >
            <Plus className="h-4 w-4" />
            לקוח חדש
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map(stage => {
              const stageLeads = grouped[stage.id];
              const stageValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);

              return (
                <div key={stage.id} className="w-64 flex-none">
                  {/* Column header */}
                  <div className={cn("rounded-xl px-3 py-2.5 mb-3 flex items-center justify-between", stage.bg, "border", stage.border)}>
                    <div className="flex items-center gap-1.5">
                      <span className={stage.color}>{stage.icon}</span>
                      <span className={cn("text-sm font-semibold", stage.color)}>{stage.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {stageValue > 0 && (
                        <span className={cn("text-xs font-bold", stage.color)}>{fmt(stageValue)}</span>
                      )}
                      <span className={cn("text-xs font-bold bg-white/70 rounded-full px-1.5 py-0.5 min-w-[20px] text-center", stage.color)}>
                        {stageLeads.length}
                      </span>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2.5">
                    {stageLeads.map(lead => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onAdvance={handleAdvance}
                        advancing={advancing}
                      />
                    ))}

                    {stageLeads.length === 0 && (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl py-8 text-center text-slate-300 text-sm">
                        ריק
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showWizard && (
        <OnboardingWizard
          onClose={() => setShowWizard(false)}
          onDone={() => { setShowWizard(false); load(); }}
        />
      )}
    </div>
  );
}
