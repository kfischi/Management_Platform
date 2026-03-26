"use client";

import * as React from "react";
import {
  Server, Container, Plus, ExternalLink, RefreshCw, Play, Square,
  RotateCcw, Activity, HardDrive, Cpu, Wifi, Loader2, AlertCircle,
  Settings2, Link2Off
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CoolifyServer {
  id: string;
  name: string;
  ip?: string;
  description?: string;
  status?: string;
}

interface CoolifyApp {
  id: string;
  name: string;
  status: string;
  build_pack?: string;
  fqdn?: string;
  server?: { name?: string };
  last_deployment_status?: string;
}

interface InfraData {
  connected: boolean;
  error?: string;
  servers: CoolifyServer[];
  applications: CoolifyApp[];
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: "success" | "destructive" | "warning" | "secondary" }> = {
  running:     { label: "פעיל",     dot: "bg-green-500",  badge: "success" },
  started:     { label: "פעיל",     dot: "bg-green-500",  badge: "success" },
  stopped:     { label: "מופסק",   dot: "bg-red-500",    badge: "destructive" },
  exited:      { label: "יצא",      dot: "bg-red-400",    badge: "destructive" },
  restarting:  { label: "מאתחל",   dot: "bg-yellow-400", badge: "warning" },
  reachable:   { label: "זמין",     dot: "bg-green-500",  badge: "success" },
  unreachable: { label: "לא זמין", dot: "bg-red-500",    badge: "destructive" },
  unknown:     { label: "לא ידוע", dot: "bg-slate-400",  badge: "secondary" },
};

function statusOf(s?: string) {
  return STATUS_CONFIG[s ?? "unknown"] ?? STATUS_CONFIG.unknown;
}

export default function InfrastructurePage() {
  const [data, setData] = React.useState<InfraData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/infrastructure");
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  async function doAction(action: string, appId: string) {
    setActionLoading(`${action}:${appId}`);
    try {
      await fetch("/api/admin/infrastructure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, appId }),
      });
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  const apps = data?.applications ?? [];
  const servers = data?.servers ?? [];
  const runningCount = apps.filter(a => a.status === "running" || a.status === "started").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">תשתיות Coolify</h2>
          <p className="text-muted-foreground text-sm">
            {loading ? "טוען..." : data?.connected
              ? `${runningCount}/${apps.length} applications פעילים · ${servers.length} שרתים`
              : "לא מחובר"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            רענן
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <a href={typeof window !== "undefined" && localStorage.getItem("coolify_url") || "#"} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              פתח Coolify
            </a>
          </Button>
        </div>
      </div>

      {/* Not connected state */}
      {!loading && !data?.connected && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-5 flex items-start gap-3">
            <Link2Off className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-amber-900 text-sm">Coolify לא מחובר</p>
              <p className="text-xs text-amber-700 mt-0.5">
                {data?.error ?? "הגדר Coolify URL ו-Token בדף ההגדרות כדי לראות נתוני תשתית בזמן אמת."}
              </p>
              <Button size="sm" variant="outline" className="mt-2 gap-1.5 border-amber-300 text-amber-800 hover:bg-amber-100" asChild>
                <a href="/admin/settings">
                  <Settings2 className="h-3.5 w-3.5" />
                  פתח הגדרות
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground/40" />
        </div>
      )}

      {!loading && data?.connected && (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Applications", value: apps.length,   icon: Container, color: "text-blue-600",   bg: "bg-blue-50" },
              { label: "פעילים",       value: runningCount,  icon: Activity,  color: "text-green-600",  bg: "bg-green-50" },
              { label: "שרתים",        value: servers.length, icon: Server,   color: "text-purple-600", bg: "bg-purple-50" },
              { label: "מופסקים",      value: apps.filter(a => a.status === "stopped" || a.status === "exited").length, icon: Square, color: "text-red-600", bg: "bg-red-50" },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("rounded-lg p-2.5", s.bg)}>
                    <s.icon className={cn("h-5 w-5", s.color)} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Servers */}
          {servers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  שרתים ({servers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {servers.map(srv => {
                    const st = statusOf(srv.status);
                    return (
                      <div key={srv.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                            <Server className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{srv.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {srv.ip && <span className="flex items-center gap-0.5"><Wifi className="h-3 w-3" />{srv.ip}</span>}
                              {srv.description && <span>{srv.description}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className={cn("h-2 w-2 rounded-full animate-pulse", st.dot)} />
                          <Badge variant={st.badge} className="text-xs">{st.label}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Container className="h-4 w-4" />
                Applications & Containers ({apps.length})
              </CardTitle>
              <CardDescription>כל ה-applications הפרוסים ב-Coolify</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {apps.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">אין applications</p>
              ) : (
                <div className="divide-y">
                  {apps.map(app => {
                    const st = statusOf(app.status);
                    const isRunning = app.status === "running" || app.status === "started";
                    return (
                      <div key={app.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{app.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                            {app.fqdn && (
                              <a href={`https://${app.fqdn}`} target="_blank" rel="noopener noreferrer"
                                 className="flex items-center gap-0.5 hover:text-primary">
                                <ExternalLink className="h-3 w-3" />{app.fqdn}
                              </a>
                            )}
                            {app.build_pack && <Badge variant="secondary" className="text-[10px] py-0">{app.build_pack}</Badge>}
                            {app.server?.name && <span>· {app.server.name}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className={cn("h-2 w-2 rounded-full", st.dot)} />
                          <Badge variant={st.badge} className="text-xs">{st.label}</Badge>
                          {/* Action buttons */}
                          <div className="flex gap-0.5">
                            <Button
                              size="sm" variant="ghost" className="h-7 w-7 p-0"
                              title="Deploy" onClick={() => doAction("deploy", app.id)}
                              disabled={!!actionLoading}
                            >
                              {actionLoading === `deploy:${app.id}`
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <RefreshCw className="h-3 w-3" />}
                            </Button>
                            {isRunning ? (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="עצור"
                                onClick={() => doAction("stop", app.id)} disabled={!!actionLoading}>
                                {actionLoading === `stop:${app.id}`
                                  ? <Loader2 className="h-3 w-3 animate-spin" />
                                  : <Square className="h-3 w-3" />}
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="הפעל"
                                onClick={() => doAction("start", app.id)} disabled={!!actionLoading}>
                                {actionLoading === `start:${app.id}`
                                  ? <Loader2 className="h-3 w-3 animate-spin" />
                                  : <Play className="h-3 w-3" />}
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="אתחול"
                              onClick={() => doAction("restart", app.id)} disabled={!!actionLoading}>
                              {actionLoading === `restart:${app.id}`
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <RotateCcw className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Demo / unconfigured placeholder */}
      {!loading && !data?.connected && (
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Container className="h-4 w-4" />
              תצוגה לדוגמה
            </CardTitle>
            <CardDescription>כאשר Coolify מחובר, הנתונים יופיעו כאן בזמן אמת</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y opacity-50 pointer-events-none select-none">
              {[
                { name: "WMA Platform", fqdn: "platform.wma.co.il", status: "running",  pack: "nixpacks" },
                { name: "N8N",          fqdn: "n8n.wma.co.il",      status: "running",  pack: "docker-compose" },
                { name: "Client App",   fqdn: "client1.co.il",      status: "stopped",  pack: "nixpacks" },
              ].map(app => {
                const st = statusOf(app.status);
                return (
                  <div key={app.name} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.fqdn}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{app.pack}</Badge>
                    <div className={cn("h-2 w-2 rounded-full", st.dot)} />
                    <Badge variant={st.badge} className="text-xs">{st.label}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
