"use client";

import * as React from "react";
import Link from "next/link";
import {
  Zap, Plus, Play, Pause, ExternalLink, Clock, CheckCircle2,
  AlertCircle, GitBranch, Loader2, Trash2, Settings2, BarChart2,
  RefreshCw, Search, Filter, ChevronRight, Activity, Bot,
  Webhook, Calendar, ArrowUpRight, TrendingUp, CircleDot,
} from "lucide-react";
import { TEMPLATES, TEMPLATE_CATEGORIES, type AutomationTemplate } from "./automation-templates";
import { cn } from "@/lib/utils";

/* ─────────── types ─────────── */

interface Automation {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  is_active: boolean;
  run_count: number;
  last_run_at: string | null;
  created_at: string;
  n8n_workflow_id: string | null;
  error_count?: number;
}

interface WorkflowRun {
  id: string;
  automation_id: string;
  status: "running" | "success" | "failed" | "cancelled";
  started_at: string;
  duration_ms: number | null;
  trigger_type: string | null;
}

interface Props {
  initialAutomations: Automation[];
  recentRuns: WorkflowRun[];
  n8nConnected: boolean;
  n8nUrl: string | null;
}

/* ─────────── helpers ─────────── */

const TRIGGER_ICONS: Record<string, string> = {
  webhook: "🔗", schedule: "⏰", manual: "▶️",
  email: "📧", whatsapp: "💬", lead: "🎯",
  payment: "💳", site: "🌐",
};

const RUN_STATUS_CFG = {
  running:   { label: "רץ",       color: "text-blue-400",  bg: "bg-blue-900/30",  dot: "bg-blue-400",  icon: Loader2 },
  success:   { label: "הצליח",    color: "text-green-400", bg: "bg-green-900/30", dot: "bg-green-400", icon: CheckCircle2 },
  failed:    { label: "נכשל",     color: "text-red-400",   bg: "bg-red-900/30",   dot: "bg-red-400",   icon: AlertCircle },
  cancelled: { label: "בוטל",     color: "text-slate-400", bg: "bg-slate-800",    dot: "bg-slate-500", icon: CircleDot },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return "לפני רגע";
  if (diff < 3600000) return `לפני ${Math.floor(diff / 60000)}ד'`;
  if (diff < 86400000) return `לפני ${Math.floor(diff / 3600000)}ש'`;
  return `לפני ${Math.floor(diff / 86400000)} ימים`;
}

function durationStr(ms: number | null) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/* ─────────── sub-components ─────────── */

function StatCard({ label, value, icon, color, sub }: {
  label: string; value: string | number; icon: React.ReactNode;
  color: string; sub?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400">{label}</span>
        <div className={cn("rounded-lg p-1.5", color)}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function AutomationRow({
  automation, onToggle, onDelete, onRun, running,
}: {
  automation: Automation;
  onToggle: () => void;
  onDelete: () => void;
  onRun: () => void;
  running: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 hover:border-slate-700 transition-colors group">
      {/* Toggle */}
      <div
        onClick={onToggle}
        className={cn(
          "relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0",
          automation.is_active ? "bg-green-600" : "bg-slate-700"
        )}
      >
        <div className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
          automation.is_active ? "translate-x-4" : "translate-x-0.5"
        )} />
      </div>

      {/* Trigger icon */}
      <span className="text-lg shrink-0">{TRIGGER_ICONS[automation.trigger_type] ?? "⚡"}</span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white truncate">{automation.name}</p>
          {automation.n8n_workflow_id && (
            <span className="text-xs bg-purple-900/40 text-purple-400 border border-purple-800 rounded-md px-1.5 py-0.5">n8n</span>
          )}
          {(automation.error_count ?? 0) > 0 && (
            <span className="text-xs bg-red-900/40 text-red-400 border border-red-800 rounded-md px-1.5 py-0.5">
              {automation.error_count} שגיאות
            </span>
          )}
        </div>
        {automation.description && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{automation.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-5 shrink-0 text-xs text-slate-500">
        <div className="text-center">
          <p className="font-semibold text-white">{automation.run_count}</p>
          <p>ריצות</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-slate-300">
            {automation.last_run_at ? timeAgo(automation.last_run_at) : "מעולם"}
          </p>
          <p>אחרון</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onRun}
          disabled={running}
          title="הפעל עכשיו"
          className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:text-green-400 hover:border-green-700 transition-colors"
        >
          {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <Link
          href={`/admin/automations/builder?id=${automation.id}`}
          title="עריכה"
          className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:text-indigo-400 hover:border-indigo-700 transition-colors"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={onDelete}
          title="מחק"
          className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:text-red-400 hover:border-red-700 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onUse,
}: {
  template: AutomationTemplate;
  onUse: () => void;
}) {
  const difficultyColor = {
    "קל": "text-green-400 bg-green-900/30 border-green-800",
    "בינוני": "text-amber-400 bg-amber-900/30 border-amber-800",
    "מתקדם": "text-red-400 bg-red-900/30 border-red-800",
  }[template.difficulty];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-600 transition-all group flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{template.icon}</span>
          <div>
            <p className="text-sm font-semibold text-white">{template.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn("text-xs border rounded px-1.5 py-0.5", difficultyColor)}>
                {template.difficulty}
              </span>
              <span className="text-xs text-slate-500">{template.estimatedMinutes}ד' הגדרה</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{template.description}</p>
      <div className="flex items-center gap-1 flex-wrap">
        {template.tags.map((tag) => (
          <span key={tag} className="text-xs bg-slate-800 text-slate-400 rounded px-1.5 py-0.5">{tag}</span>
        ))}
      </div>
      <button
        onClick={onUse}
        className="mt-auto w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-xs font-medium text-white transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        השתמש בתבנית
      </button>
    </div>
  );
}

/* ─────────── main dashboard ─────────── */

export default function AutomationsDashboard({
  initialAutomations, recentRuns, n8nConnected, n8nUrl,
}: Props) {
  const [automations, setAutomations] = React.useState<Automation[]>(initialAutomations);
  const [runs] = React.useState<WorkflowRun[]>(recentRuns);
  const [tab, setTab] = React.useState<"automations" | "templates" | "runs" | "n8n">("automations");
  const [templateCat, setTemplateCat] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [runningId, setRunningId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  async function toggleActive(automation: Automation) {
    const next = !automation.is_active;
    setAutomations((prev) =>
      prev.map((a) => a.id === automation.id ? { ...a, is_active: next } : a)
    );
    await fetch(`/api/admin/automations/${automation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: next }),
    });
  }

  async function deleteAutomation(id: string) {
    const res = await fetch(`/api/admin/automations/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAutomations((prev) => prev.filter((a) => a.id !== id));
      showToast("success", "נמחק בהצלחה");
    }
  }

  async function runAutomation(id: string) {
    setRunningId(id);
    try {
      const res = await fetch(`/api/admin/automations/${id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger_data: {} }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "שגיאה");
      setAutomations((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, run_count: a.run_count + 1, last_run_at: new Date().toISOString() }
            : a
        )
      );
      showToast("success", "הרצה הושלמה!");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "שגיאה");
    } finally {
      setRunningId(null);
    }
  }

  // Stats
  const totalRuns = automations.reduce((s, a) => s + a.run_count, 0);
  const activeCount = automations.filter((a) => a.is_active).length;
  const successRate = runs.length
    ? Math.round((runs.filter((r) => r.status === "success").length / runs.length) * 100)
    : 100;

  const filteredAutomations = automations.filter(
    (a) => !search || a.name.includes(search) || a.description?.includes(search)
  );

  const filteredTemplates = TEMPLATES.filter(
    (t) => templateCat === "all" || t.category === templateCat
  );

  return (
    <div className="-m-6 bg-slate-950 text-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-400" />
              מרכז אוטומציות
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              בנה, הפעל ונהל זרימות עבודה אוטומטיות עם AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* n8n status */}
            <div className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs",
              n8nConnected
                ? "border-green-800 bg-green-900/30 text-green-400"
                : "border-slate-700 bg-slate-800 text-slate-400"
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full", n8nConnected ? "bg-green-400 animate-pulse" : "bg-slate-500")} />
              n8n {n8nConnected ? "מחובר" : "לא מחובר"}
            </div>
            <Link
              href="/admin/automations/builder"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              אוטומציה חדשה
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <StatCard label="אוטומציות" value={automations.length} icon={<Zap className="h-4 w-4 text-indigo-400" />} color="bg-indigo-900/40" sub={`${activeCount} פעילות`} />
          <StatCard label="סה״כ ריצות" value={totalRuns.toLocaleString()} icon={<Activity className="h-4 w-4 text-green-400" />} color="bg-green-900/40" sub="מאז ההתחלה" />
          <StatCard label="שיעור הצלחה" value={`${successRate}%`} icon={<TrendingUp className="h-4 w-4 text-emerald-400" />} color="bg-emerald-900/40" sub={`${runs.length} ריצות אחרונות`} />
          <StatCard label="תבניות" value={TEMPLATES.length} icon={<Bot className="h-4 w-4 text-violet-400" />} color="bg-violet-900/40" sub="מוכנות לשימוש" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 bg-slate-900 px-6">
        <div className="flex gap-1">
          {[
            { key: "automations", label: "האוטומציות שלי", icon: Zap },
            { key: "templates",   label: "תבניות",          icon: Bot },
            { key: "runs",        label: "היסטוריה",        icon: Clock },
            { key: "n8n",         label: "n8n",             icon: GitBranch },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                tab === key
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {key === "automations" && automations.length > 0 && (
                <span className="text-xs bg-slate-700 rounded-full px-1.5 py-0.5 text-slate-300">
                  {automations.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6">

        {/* ── Tab: My Automations ── */}
        {tab === "automations" && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="חיפוש אוטומציה..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 pr-9 pl-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            {filteredAutomations.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 py-20 text-center gap-4">
                <div className="text-5xl">⚡</div>
                <div>
                  <p className="text-base font-semibold text-white">אין אוטומציות עדיין</p>
                  <p className="text-sm text-slate-400 mt-1">התחל עם תבנית מוכנה או צור חדשה מאפס</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTab("templates")}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    <Bot className="h-4 w-4" />
                    עיין בתבניות
                  </button>
                  <Link
                    href="/admin/automations/builder"
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    חדש מאפס
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAutomations.map((automation) => (
                  <AutomationRow
                    key={automation.id}
                    automation={automation}
                    onToggle={() => toggleActive(automation)}
                    onDelete={() => deleteAutomation(automation.id)}
                    onRun={() => runAutomation(automation.id)}
                    running={runningId === automation.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Templates ── */}
        {tab === "templates" && (
          <div className="space-y-4">
            {/* Category filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {["all", ...TEMPLATE_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateCat(cat)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    templateCat === cat
                      ? "border-indigo-600 bg-indigo-900/40 text-indigo-400"
                      : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                  )}
                >
                  {cat === "all" ? "הכל" : cat}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={() => {
                    window.location.href = `/admin/automations/builder?template=${template.id}`;
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: Run History ── */}
        {tab === "runs" && (
          <div className="space-y-3">
            {runs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 py-16 gap-3">
                <Clock className="h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-400">אין היסטוריית ריצות עדיין</p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50">
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">אוטומציה</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">סטטוס</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">טריגר</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">משך</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">זמן</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((run) => {
                      const cfg = RUN_STATUS_CFG[run.status];
                      const Icon = cfg.icon;
                      const auto = automations.find((a) => a.id === run.automation_id);
                      return (
                        <tr key={run.id} className="border-b border-slate-800/50 hover:bg-slate-900 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-200">{auto?.name ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", cfg.bg, cfg.color)}>
                              <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{run.trigger_type ?? "manual"}</td>
                          <td className="px-4 py-3 text-xs text-slate-400 tabular-nums">{durationStr(run.duration_ms)}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{timeAgo(run.started_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: n8n Integration ── */}
        {tab === "n8n" && (
          <div className="max-w-2xl space-y-5">
            {/* Connection status */}
            <div className={cn(
              "rounded-2xl border p-5",
              n8nConnected
                ? "border-green-800 bg-green-900/20"
                : "border-slate-700 bg-slate-900"
            )}>
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("rounded-xl p-2.5", n8nConnected ? "bg-green-900/40" : "bg-slate-800")}>
                  <GitBranch className={cn("h-5 w-5", n8nConnected ? "text-green-400" : "text-slate-400")} />
                </div>
                <div>
                  <p className="font-semibold text-white">n8n Workflow Engine</p>
                  <p className={cn("text-sm", n8nConnected ? "text-green-400" : "text-slate-400")}>
                    {n8nConnected ? "✓ מחובר ופעיל" : "לא מחובר"}
                  </p>
                </div>
                {n8nConnected && n8nUrl && (
                  <a
                    href={n8nUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-auto flex items-center gap-1.5 rounded-lg border border-green-700 px-3 py-1.5 text-xs text-green-400 hover:bg-green-900/30 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    פתח n8n
                  </a>
                )}
              </div>
              {!n8nConnected && (
                <div className="space-y-2 text-sm text-slate-400">
                  <p>הוסף את המשתנים הבאים ל-.env.local:</p>
                  <pre className="rounded-lg bg-slate-800 p-3 text-xs text-green-400 font-mono">
{`N8N_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key-here`}
                  </pre>
                </div>
              )}
            </div>

            {/* Webhook endpoints */}
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Webhook className="h-4 w-4 text-indigo-400" />
                Webhook Endpoints
              </h3>
              <p className="text-xs text-slate-400">כתובות Webhook לחיבור שירותים חיצוניים:</p>
              {[
                { name: "GitHub",   path: "/api/webhooks/github",   desc: "Push events, PR, releases" },
                { name: "Netlify",  path: "/api/webhooks/netlify",  desc: "Deploy status notifications" },
                { name: "Lead Form",path: "/api/webhooks/leads",    desc: "New leads from website forms" },
                { name: "WhatsApp", path: "/api/webhooks/whatsapp", desc: "WAHA incoming messages" },
              ].map((w) => (
                <div key={w.name} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-white">{w.name}</p>
                    <p className="text-xs text-slate-500">{w.desc}</p>
                  </div>
                  <code className="text-xs text-indigo-400 font-mono bg-slate-900 rounded px-2 py-1">
                    {w.path}
                  </code>
                </div>
              ))}
            </div>

            {/* n8n workflows list */}
            {n8nConnected && <N8nWorkflowsList />}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-xl z-50",
          toast.type === "success"
            ? "bg-green-900 border border-green-700 text-green-100"
            : "bg-red-900 border border-red-700 text-red-100"
        )}>
          {toast.type === "success"
            ? <CheckCircle2 className="h-4 w-4" />
            : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ─────────── n8n Workflows list ─────────── */

function N8nWorkflowsList() {
  const [workflows, setWorkflows] = React.useState<{ id: string; name: string; active: boolean }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function fetchWorkflows() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/n8n/workflows");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setWorkflows(Array.isArray(json) ? json : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Workflows ב-n8n</h3>
        <button
          onClick={fetchWorkflows}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          רענן
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {workflows.length === 0 && !loading && !error && (
        <p className="text-xs text-slate-500 py-4 text-center">לחץ "רענן" לטעינת workflows מ-n8n</p>
      )}
      {workflows.map((wf) => (
        <div key={wf.id} className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2.5">
          <div>
            <p className="text-sm text-white">{wf.name}</p>
            <p className="text-xs text-slate-500 font-mono">{wf.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs rounded-full border px-2 py-0.5",
              wf.active ? "border-green-700 text-green-400" : "border-slate-700 text-slate-500"
            )}>
              {wf.active ? "פעיל" : "כבוי"}
            </span>
            <Link
              href={`/admin/automations/builder?n8n_id=${wf.id}`}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
            >
              ייבא <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
