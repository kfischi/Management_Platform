"use client";

import * as React from "react";
import {
  Globe, ExternalLink, Github, RefreshCw, RotateCcw,
  LayoutGrid, List, Zap, CheckCircle2, XCircle, Clock,
  PauseCircle, Hash, AlignLeft, Link as LinkIcon, User,
  Eye, EyeOff,
} from "lucide-react";
import { CollectionView, ColDef, BulkAction } from "@/components/admin/collection-view";
import { RecordPanel, FieldDef } from "@/components/admin/record-panel";
import { useToast } from "@/components/admin/toast";
import { AddSiteModal } from "@/components/admin/add-site-modal";
import { EditBuildHookButton } from "@/components/admin/edit-build-hook-button";
import { ClientPermissionsPanel } from "@/components/admin/client-permissions-panel";
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

/* ─────────── mock data ─────────── */

const MOCK: Site[] = [
  { id: "s1",  name: "טק סולושנס",       domain: "techsol.co.il",         github_repo: "techsol/main-site",    netlify_url: "https://techsol.netlify.app",     status: "active",   owner_id: "u2",  created_at: "2024-01-05T10:00:00Z", profiles: { full_name: "ישראל ישראלי", email: "israel@techsol.co.il" } },
  { id: "s2",  name: "כהן מרקטינג",      domain: "cohen-marketing.co.il", github_repo: "cohen/marketing",      netlify_url: "https://cohen-mkt.netlify.app",   status: "active",   owner_id: "u3",  created_at: "2024-03-01T09:00:00Z", profiles: { full_name: "שרה כהן",     email: "sara@cohen-mkt.com" } },
  { id: "s3",  name: "לוי נדל״ן",         domain: "levy-realestate.co.il", github_repo: "levy-re/website",      netlify_url: null,                              status: "building", owner_id: "u4",  created_at: "2024-12-15T11:00:00Z", profiles: { full_name: "דוד לוי",     email: "david@levy-re.co.il" } },
  { id: "s4",  name: "מנחם פינטק",        domain: "menachem-fintech.io",   github_repo: "menachem/fintech-web", netlify_url: "https://menachem.netlify.app",    status: "active",   owner_id: "u5",  created_at: "2024-12-20T14:00:00Z", profiles: { full_name: "יוסי מנחם",   email: "yossi@menachem.io" } },
  { id: "s5",  name: "שפירא לוגיסטיקס",  domain: "shapira-logistics.com", github_repo: "shapira/pwa-tracking", netlify_url: "https://shapira.netlify.app",     status: "active",   owner_id: "u7",  created_at: "2023-09-01T08:00:00Z", profiles: { full_name: "אבי שפירא",   email: "avi@shapira-log.com" } },
  { id: "s6",  name: "אורן טכנולוגיות",  domain: null,                    github_repo: "oren/redesign",        netlify_url: null,                              status: "building", owner_id: "u10", created_at: "2025-02-10T10:00:00Z", profiles: { full_name: "גיל אורן",    email: "gil@oren-tech.co.il" } },
  { id: "s7",  name: "חסן אגרו",          domain: "hassan-agro.co.il",     github_repo: "hassan/agro-site",     netlify_url: "https://hassan-agro.netlify.app", status: "error",    owner_id: "u9",  created_at: "2024-05-20T13:00:00Z", profiles: { full_name: "מרים חסן",    email: "miriam@hassan.agro" } },
  { id: "s8",  name: "Agency Pro - Main", domain: "agencypro.co.il",       github_repo: "agency-pro/main",      netlify_url: "https://agencypro.netlify.app",   status: "active",   owner_id: "u1",  created_at: "2023-01-01T10:00:00Z", profiles: { full_name: "יוני פישר",   email: "yoni@example.com" } },
  { id: "s9",  name: "נגר בוטיק",         domain: null,                    github_repo: null,                   netlify_url: null,                              status: "paused",   owner_id: null,  created_at: "2024-11-01T10:00:00Z", profiles: null },
];

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
        <DeployButton siteId={row.id} />
      </div>
    ),
  },
];

/* ─────────── panel fields ─────────── */

const PANEL_FIELDS: FieldDef[] = [
  { key: "name",       label: "שם האתר",   type: "text",     icon: <Globe className="h-3.5 w-3.5" />,    section: "פרטי אתר" },
  { key: "domain",     label: "דומיין",     type: "text",     icon: <LinkIcon className="h-3.5 w-3.5" />, section: "פרטי אתר" },
  { key: "github_repo",label: "GitHub Repo",type: "text",     icon: <Github className="h-3.5 w-3.5" />,  section: "פרטי אתר" },
  { key: "netlify_url",label: "Netlify URL",type: "url",      icon: <LinkIcon className="h-3.5 w-3.5" />, section: "פרטי אתר", copyable: true },
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

function DeployButton({ siteId }: { siteId: string }) {
  const [deploying, setDeploying] = React.useState(false);
  const { success, error } = useToast();

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      // Trigger deploy logic here
      await new Promise((r) => setTimeout(r, 1000));
      success("Deploy הופעל", `האתר ${siteId} בונה עכשיו`);
    } catch {
      error("שגיאה ב-Deploy");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <button
      onClick={handleDeploy}
      disabled={deploying}
      className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-slate-50 transition-colors text-slate-600 disabled:opacity-50"
    >
      <RefreshCw className={cn("h-3 w-3", deploying && "animate-spin")} />
      Deploy
    </button>
  );
}

/* ─────────── GridCard ─────────── */

function SiteGridCard({ site, onClick }: { site: Site; onClick: () => void }) {
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
        {site.netlify_url && (
          <a href={site.netlify_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-slate-50 text-slate-600">
            <ExternalLink className="h-3 w-3" /> צפייה
          </a>
        )}
        <DeployButton siteId={site.id} />
        <EditBuildHookButton
          siteId={site.id}
          currentHook={(site as { netlify_build_hook?: string | null }).netlify_build_hook ?? null}
        />
        <ClientPermissionsPanel siteId={site.id} siteName={site.name} />
      </div>
    </div>
  );
}

/* ─────────── component ─────────── */

export function SitesCollection({ initialData }: { initialData: Site[] }) {
  const data = initialData.length > 0 ? initialData : MOCK;
  const [sites, setSites] = React.useState<Site[]>(data);
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("grid");
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Site | null>(null);
  const { success } = useToast();

  /* Status summary */
  const summary = React.useMemo(() => ({
    active:   sites.filter((s) => s.status === "active").length,
    building: sites.filter((s) => s.status === "building").length,
    error:    sites.filter((s) => s.status === "error").length,
    paused:   sites.filter((s) => s.status === "paused").length,
  }), [sites]);

  async function handleSave(updated: Record<string, unknown>) {
    setSites((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...(updated as Partial<Site>) } : s))
    );
    success("האתר עודכן");
    setPanelOpen(false);
    setSelected(null);
  }

  const bulkActions: BulkAction[] = [
    {
      label: "השהה",
      onClick: (ids) => {
        setSites((prev) =>
          prev.map((s) => ids.includes(s.id) ? { ...s, status: "paused" as const } : s)
        );
        success(`${ids.length} אתרים הושהו`);
      },
    },
    {
      label: "מחק",
      variant: "destructive",
      onClick: (ids) => {
        setSites((prev) => prev.filter((s) => !ids.includes(s.id)));
        success(`נמחקו ${ids.length} אתרים`);
      },
    },
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
        onDelete={() => {
          if (selected) {
            setSites((prev) => prev.filter((s) => s.id !== selected.id));
            success("האתר נמחק");
            setPanelOpen(false);
          }
        }}
        activityLog={[]}
      />
    </>
  );
}
