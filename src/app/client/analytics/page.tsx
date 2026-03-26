"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import {
  TrendingUp, Globe, Rocket, CheckCircle2, XCircle, Clock,
  AlertCircle, RefreshCw, ExternalLink, GitBranch, Calendar,
  BarChart2, Activity, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Site {
  id: string;
  name: string;
  domain: string | null;
  netlify_url: string | null;
  status: "active" | "building" | "error" | "paused";
  updated_at: string;
}

interface Deployment {
  id: string;
  site_id: string;
  status: "success" | "building" | "failed" | "cancelled";
  commit_message: string | null;
  branch: string | null;
  deploy_url: string | null;
  created_at: string;
  finished_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  active:    "bg-green-100 text-green-700 border-green-200",
  building:  "bg-blue-100 text-blue-700 border-blue-200",
  error:     "bg-red-100 text-red-700 border-red-200",
  paused:    "bg-slate-100 text-slate-600 border-slate-200",
  success:   "bg-green-100 text-green-700 border-green-200",
  failed:    "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-amber-100 text-amber-700 border-amber-200",
};

const STATUS_LABELS: Record<string, string> = {
  active:    "פעיל",
  building:  "בנייה",
  error:     "שגיאה",
  paused:    "מושהה",
  success:   "הצליח",
  failed:    "נכשל",
  cancelled: "בוטל",
};

function DeployIcon({ status }: { status: string }) {
  if (status === "success")   return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "failed")    return <XCircle className="h-4 w-4 text-red-500" />;
  if (status === "building")  return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
  return <AlertCircle className="h-4 w-4 text-amber-500" />;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return "עכשיו";
  if (mins < 60)  return `לפני ${mins} דק׳`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `לפני ${hrs} שע׳`;
  return `לפני ${Math.floor(hrs / 24)} ימים`;
}

function formatDuration(start: string, end: string | null) {
  if (!end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

export default function ClientAnalyticsPage() {
  const supabase = createClient();
  const [sites, setSites] = React.useState<Site[]>([]);
  const [deployments, setDeployments] = React.useState<Deployment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedSite, setSelectedSite] = React.useState<string>("all");

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [{ data: sitesData }, { data: deploysData }] = await Promise.all([
        supabase.from("sites").select("id,name,domain,netlify_url,status,updated_at").eq("owner_id", user.id).order("created_at", { ascending: false }),
        supabase.from("deployments").select("id,site_id,status,commit_message,branch,deploy_url,created_at,finished_at").order("created_at", { ascending: false }).limit(50),
      ]);

      const userSites = sitesData ?? [];
      setSites(userSites);

      const siteIds = userSites.map(s => s.id);
      const filtered = (deploysData ?? []).filter(d => siteIds.includes(d.site_id));
      setDeployments(filtered);
      setLoading(false);
    }
    load();
  }, []);

  const filteredDeploys = selectedSite === "all"
    ? deployments
    : deployments.filter(d => d.site_id === selectedSite);

  const successCount  = filteredDeploys.filter(d => d.status === "success").length;
  const failedCount   = filteredDeploys.filter(d => d.status === "failed").length;
  const successRate   = filteredDeploys.length ? Math.round((successCount / filteredDeploys.length) * 100) : 0;
  const activeSites   = sites.filter(s => s.status === "active").length;

  // Last 7 days deploy counts
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      label: d.toLocaleDateString("he-IL", { weekday: "short" }),
      count: filteredDeploys.filter(dep => dep.created_at.startsWith(key)).length,
    };
  });
  const maxBar = Math.max(...last7.map(d => d.count), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl" dir="rtl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-primary" />
          אנליטיקה
        </h2>
        <p className="text-sm text-muted-foreground">ביצועים, פריסות, ומצב האתרים שלך</p>
      </div>

      {sites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 p-16 text-center">
          <Globe className="h-10 w-10 mb-3 text-muted-foreground/30" />
          <p className="text-sm font-medium text-slate-700">אין אתרים עדיין</p>
          <p className="text-xs text-muted-foreground mt-1">האתרים שלך יופיעו כאן לאחר שהסוכנות תגדיר אותם</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "אתרים פעילים", value: activeSites, icon: Globe,       color: "text-green-600" },
              { label: "סה״כ פריסות",  value: filteredDeploys.length, icon: Rocket, color: "text-blue-600" },
              { label: "הצלחות",        value: successCount, icon: CheckCircle2, color: "text-green-600" },
              { label: "אחוז הצלחה",   value: `${successRate}%`, icon: TrendingUp, color: "text-primary" },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border bg-white p-4">
                <div className={cn("mb-1", stat.color)}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Sites status */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              אתרים ({sites.length})
            </h3>
            <div className="divide-y rounded-xl border overflow-hidden bg-white">
              {sites.map(site => (
                <div key={site.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{site.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{site.domain ?? site.netlify_url ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", STATUS_COLORS[site.status])}>
                      {STATUS_LABELS[site.status]}
                    </span>
                    {(site.netlify_url || site.domain) && (
                      <a
                        href={site.netlify_url ?? `https://${site.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border text-slate-400 hover:bg-accent transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deploy chart */}
          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">פריסות — 7 ימים אחרונים</h3>
              </div>
              {sites.length > 1 && (
                <select
                  value={selectedSite}
                  onChange={e => setSelectedSite(e.target.value)}
                  className="rounded-lg border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">כל האתרים</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
            </div>
            <div className="flex items-end gap-2 h-24">
              {last7.map(day => (
                <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center" style={{ height: "72px" }}>
                    <div
                      className="w-full rounded-t-md bg-primary/70 transition-all"
                      style={{ height: day.count ? `${Math.max(8, (day.count / maxBar) * 72)}px` : "3px", opacity: day.count ? 1 : 0.2 }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deploy history */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              היסטוריית פריסות ({filteredDeploys.length})
            </h3>
            {filteredDeploys.length === 0 ? (
              <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
                אין פריסות עדיין
              </div>
            ) : (
              <div className="divide-y rounded-xl border overflow-hidden bg-white">
                {filteredDeploys.slice(0, 20).map(dep => {
                  const site = sites.find(s => s.id === dep.site_id);
                  return (
                    <div key={dep.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors">
                      <DeployIcon status={dep.status} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {dep.commit_message ?? "פריסה ידנית"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {site && <span className="text-xs text-muted-foreground">{site.name}</span>}
                          {dep.branch && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <GitBranch className="h-2.5 w-2.5" />{dep.branch}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <Clock className="h-2.5 w-2.5" />
                            {formatDuration(dep.created_at, dep.finished_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", STATUS_COLORS[dep.status])}>
                          {STATUS_LABELS[dep.status]}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {relativeTime(dep.created_at)}
                        </span>
                        {dep.deploy_url && (
                          <a
                            href={dep.deploy_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-6 w-6 items-center justify-center rounded-md border text-slate-400 hover:bg-accent transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick info */}
          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">סיכום</h3>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">נכשלו</dt>
                <dd className="font-semibold text-red-600">{failedCount}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">אחוז הצלחה</dt>
                <dd className="font-semibold">{successRate}%</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">אתרים בשגיאה</dt>
                <dd className="font-semibold text-red-600">{sites.filter(s => s.status === "error").length}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">אתרים מושהים</dt>
                <dd className="font-semibold">{sites.filter(s => s.status === "paused").length}</dd>
              </div>
            </dl>
          </div>
        </>
      )}
    </div>
  );
}
