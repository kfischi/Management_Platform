"use client";

import * as React from "react";
import {
  Globe, ExternalLink, Github, RefreshCw,
  LayoutGrid, List, CheckCircle2, XCircle, Clock,
  PauseCircle, Hash, AlignLeft, Link as LinkIcon, User, Bot, Eye,
} from "lucide-react";
import { CollectionView, ColDef, BulkAction } from "@/components/admin/collection-view";
import { RecordPanel, FieldDef } from "@/components/admin/record-panel";
import { useToast } from "@/components/admin/toast";
import { AddSiteModal } from "@/components/admin/add-site-modal";
import { EditBuildHookButton } from "@/components/admin/edit-build-hook-button";
import { ClientPermissionsPanel } from "@/components/admin/client-permissions-panel";
import { SiteChatbotPanel } from "@/components/admin/site-chatbot-panel";
import { cn } from "@/lib/utils";

/* ─────────── types ─────────── */

export interface Site {
  id: string;
  name: string;
  domain: string | null;
  github_repo: string | null;
  netlify_url: string | null;
  netlify_build_hook?: string | null;
  status: "active" | "building" | "error" | "paused";
  owner_id: string | null;
  created_at: string;
  profiles?: { full_name: string | null; email: string } | null;
}

/* ─────────── status config ─────────── */

const STATUS_CFG = {
  active:   { label: "פעיל",   dot: "bg-green-500",  text: "text-green-700",  bg: "bg-green-50 border-green-200",  icon: CheckCircle2, pulse: true },
  building: { label: "בנייה",  dot: "bg-amber-500",  text: "text-amber-700",  bg: "bg-amber-50 border-amber-200",  icon: Clock,        pulse: true },
  error:    { label: "שגיאה",  dot: "bg-red-500",    text: "text-red-700",    bg: "bg-red-50 border-red-200",      icon: XCircle,      pulse: false },
  paused:   { label: "מושהה",  dot: "bg-slate-400",  text: "text-slate-600",  bg: "bg-slate-100 border-slate-200", icon: PauseCircle,  pulse: false },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status as keyof typeof STATUS_CFG] ?? STATUS_CFG.paused;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot, c.pulse && "animate-pulse")} />
      {c.label}
    </span>
  );
}

/* ─────────── table columns ─────────── */

const COLUMNS: ColDef<Site>[] = [
  {
    key: "name",
    title: "אתר",
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          <Globe className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{row.name}</p>
          {row.domain && <p className="text-xs text-muted-foreground">{row.domain}</p>}
        </div>
      </div>
    ),
  },
  {
    key: "profiles",
    title: "בעלים",
    sortable: false,
    render: (_, row) => {
      const p = row.profiles;
      return p ? (
        <span className="text-sm text-slate-600">{p.full_name ?? p.email}</span>
      ) : <span className="text-xs text-muted-foreground">—</span>;
    },
  },
  {
    key: "github_repo",
    title: "GitHub",
    sortable: false,
    render: (value) => value ? (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Github className="h-3 w-3" />
        <span className="truncate max-w-[160px]">{String(value)}</span>
      </div>
    ) : <span className="text-xs text-muted-foreground">—</span>,
  },
  {
    key: "status",
    title: "סטטוס",
    sortable: true,
    render: (value) => <StatusBadge status={String(value)} />,
  },
  {
    key: "netlify_url",
    title: "פעולות",
    render: (_, row) => (
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        {row.netlify_url && (
          <a
            href={row.netlify_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-slate-50 transition-colors text-slate-600"
          >
            <ExternalLink className="h-3 w-3" />
            צפייה
          </a>
        )}
        <DeployButton siteId={row.id} hasBuildHook={!!row.netlify_build_hook} />
      </div>
    ),
  },
];

/* ─────────── panel fields ─────────── */

const PANEL_FIELDS: FieldDef[] = [
  { key: "name",        label: "שם האתר",    type: "text",     icon: <Globe className="h-3.5 w-3.5" />,    section: "פרטי אתר" },
  { key: "domain",      label: "דומיין",      type: "text",     icon: <LinkIcon className="h-3.5 w-3.5" />, section: "פרטי אתר" },
  { key: "github_repo", label: "GitHub Repo", type: "text",     icon: <Github className="h-3.5 w-3.5" />,  section: "פרטי אתר" },
  { key: "netlify_url", label: "Netlify URL", type: "url",      icon: <LinkIcon className="h-3.5 w-3.5" />, section: "פרטי אתר", copyable: true },
  { key: "description", label: "תיאור",       type: "text",     icon: <AlignLeft className="h-3.5 w-3.5" />, section: "פרטי אתר" },
  {
    key: "status",
    label: "סטטוס",
    type: "badge",
    section: "מצב",
    options: [
      { value: "active",   label: "פעיל",   color: "bg-green-600 text-white" },
      { value: "building", label: "בנייה",  color: "bg-amber-500 text-white" },
      { value: "error",    label: "שגיאה",  color: "bg-red-600 text-white" },
      { value: "paused",   label: "מושהה",  color: "bg-slate-500 text-white" },
    ],
  },
  { key: "owner_id", label: "מזהה בעלים", type: "readonly", icon: <User className="h-3.5 w-3.5" />,  section: "מצב", readonly: true },
  { key: "id",       label: "מזהה",       type: "readonly", icon: <Hash className="h-3.5 w-3.5" />,  section: "מטא-דאטה", readonly: true, copyable: true },
];

/* ─────────── DeployButton ─────────── */

function DeployButton({ siteId, hasBuildHook }: { siteId: string; hasBuildHook: boolean }) {
  const [deploying, setDeploying] = React.useState(false);
  const { success, error } = useToast();

  const handleDeploy = async () => {
    if (!hasBuildHook) {
      error("אין Build Hook", "הגדר Netlify build hook קודם");
      return;
    }
    setDeploying(true);
    try {
      const res = await fetch(`/api/admin/sites/${siteId}/deploy`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "שגיאה");
      success("Deploy הופעל", "האתר בונה עכשיו");
    } catch (err) {
      error("שגיאה ב-Deploy", err instanceof Error ? err.message : "");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <button
      onClick={handleDeploy}
      disabled={deploying}
      title={!hasBuildHook ? "הגדר build hook קודם" : "הפעל deploy"}
      className={cn(
        "flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors disabled:opacity-50",
        hasBuildHook ? "hover:bg-slate-50 text-slate-600" : "text-slate-400 cursor-not-allowed"
      )}
    >
      <RefreshCw className={cn("h-3 w-3", deploying && "animate-spin")} />
      Deploy
    </button>
  );
}

/* ─────────── GridCard ─────────── */

function SiteGridCard({ site, onClick, onChatbot }: { site: Site; onClick: () => void; onChatbot: () => void }) {
  const status = STATUS_CFG[site.status] ?? STATUS_CFG.paused;
  const owner = site.profiles;
  return (
    <div
      onClick={onClick}
      className="group rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <Globe className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{site.name}</p>
            <p className="text-xs text-muted-foreground">{owner?.full_name ?? owner?.email ?? "ללא בעלים"}</p>
          </div>
        </div>
        <StatusBadge status={site.status} />
      </div>

      <div className="space-y-1.5 mb-3">
        {site.domain && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3 w-3 shrink-0" />
            <span className="truncate">{site.domain}</span>
          </div>
        )}
        {site.github_repo && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Github className="h-3 w-3 shrink-0" />
            <span className="truncate">{site.github_repo}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t" onClick={(e) => e.stopPropagation()}>
        <a
          href={`/sites/${site.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 text-slate-600 transition-colors"
          title="תצוגה מקדימה"
        >
          <Eye className="h-3 w-3" /> תצוגה
        </a>
        {site.netlify_url && (
          <a href={site.netlify_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-slate-50 text-slate-600">
            <ExternalLink className="h-3 w-3" /> Netlify
          </a>
        )}
        <DeployButton siteId={site.id} hasBuildHook={!!site.netlify_build_hook} />
        <EditBuildHookButton
          siteId={site.id}
          currentHook={site.netlify_build_hook ?? null}
        />
        <ClientPermissionsPanel siteId={site.id} siteName={site.name} />
        <button
          onClick={onChatbot}
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 text-slate-600 transition-colors"
          title="הגדרות AI ו-WhatsApp"
        >
          <Bot className="h-3 w-3" /> AI
        </button>
      </div>
    </div>
  );
}

/* ─────────── SitesCollection ─────────── */

export function SitesCollection({ initialData }: { initialData: Site[] }) {
  const [sites, setSites] = React.useState<Site[]>(initialData);
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("grid");
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Site | null>(null);
  const [chatbotSite, setChatbotSite] = React.useState<Site | null>(null);
  const { success, error } = useToast();

  /* Status summary */
  const summary = React.useMemo(() => ({
    active:   sites.filter((s) => s.status === "active").length,
    building: sites.filter((s) => s.status === "building").length,
    error:    sites.filter((s) => s.status === "error").length,
    paused:   sites.filter((s) => s.status === "paused").length,
  }), [sites]);

  async function handleSave(updated: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/admin/sites/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "שגיאה בשמירה");
      setSites((prev) =>
        prev.map((s) => (s.id === updated.id ? { ...s, ...(json as Partial<Site>) } : s))
      );
      success("האתר עודכן");
      setPanelOpen(false);
      setSelected(null);
    } catch (err) {
      error("שגיאה בשמירה", err instanceof Error ? err.message : "");
    }
  }

  async function handleDelete(site: Site) {
    try {
      const res = await fetch(`/api/admin/sites/${site.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "שגיאה במחיקה");
      }
      setSites((prev) => prev.filter((s) => s.id !== site.id));
      success("האתר נמחק");
      setPanelOpen(false);
      setSelected(null);
    } catch (err) {
      error("שגיאה במחיקה", err instanceof Error ? err.message : "");
    }
  }

  async function handleBulkPause(ids: string[]) {
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/admin/sites/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "paused" }),
        })
      )
    );
    setSites((prev) =>
      prev.map((s) => ids.includes(s.id) ? { ...s, status: "paused" as const } : s)
    );
    success(`${ids.length} אתרים הושהו`);
  }

  async function handleBulkDelete(ids: string[]) {
    await Promise.all(
      ids.map((id) => fetch(`/api/admin/sites/${id}`, { method: "DELETE" }))
    );
    setSites((prev) => prev.filter((s) => !ids.includes(s.id)));
    success(`נמחקו ${ids.length} אתרים`);
  }

  const bulkActions: BulkAction[] = [
    { label: "השהה", onClick: handleBulkPause },
    { label: "מחק",  variant: "destructive", onClick: handleBulkDelete },
  ];

  return (
    <>
      {/* Status summary */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {(Object.entries(STATUS_CFG) as [string, typeof STATUS_CFG["active"]][]).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = summary[key as keyof typeof summary];
          return (
            <div key={key} className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm min-w-[130px] ${count > 0 ? "bg-white" : "bg-slate-50"}`}>
              <Icon className={`h-4 w-4 ${cfg.text}`} />
              <div>
                <p className={`text-xl font-bold tabular-nums ${cfg.text}`}>{count}</p>
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* View toggle + new site */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 rounded-lg border bg-white p-1 shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              viewMode === "grid" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:bg-slate-100"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            כרטיסיות
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              viewMode === "table" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:bg-slate-100"
            )}
          >
            <List className="h-3.5 w-3.5" />
            טבלה
          </button>
        </div>
        <AddSiteModal />
      </div>

      {/* Grid view */}
      {viewMode === "grid" ? (
        sites.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-24 text-center gap-3">
            <Globe className="h-10 w-10 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">אין אתרים עדיין</p>
            <AddSiteModal variant="empty" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <SiteGridCard
                key={site.id}
                site={site}
                onClick={() => { setSelected(site); setPanelOpen(true); }}
                onChatbot={() => setChatbotSite(site)}
              />
            ))}
          </div>
        )
      ) : (
        <CollectionView
          title="אתרים"
          subtitle={`${sites.length} אתרים במסד הנתונים`}
          data={sites as unknown as Record<string, unknown>[]}
          columns={COLUMNS as unknown as ColDef<Record<string, unknown>>[]}
          keyField="id"
          onRowClick={(row) => { setSelected(row as unknown as Site); setPanelOpen(true); }}
          bulkActions={bulkActions}
          filterFields={[
            { key: "name",   label: "שם" },
            { key: "domain", label: "דומיין" },
            { key: "status", label: "סטטוס" },
          ]}
          pageSize={10}
          emptyIcon={<Globe className="h-10 w-10 opacity-20" />}
          emptyText="לא נמצאו אתרים"
        />
      )}

      <RecordPanel
        open={panelOpen}
        onClose={() => { setPanelOpen(false); setSelected(null); }}
        title={selected?.name ?? "אתר חדש"}
        subtitle={selected?.domain ?? selected?.status}
        record={selected as unknown as Record<string, unknown>}
        fields={PANEL_FIELDS}
        onSave={handleSave}
        onDelete={() => selected && handleDelete(selected)}
        activityLog={[]}
      />

      {chatbotSite && (
        <SiteChatbotPanel
          siteId={chatbotSite.id}
          siteName={chatbotSite.name}
          open={!!chatbotSite}
          onClose={() => setChatbotSite(null)}
        />
      )}
    </>
  );
}
