import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Server, Container, Plus, ExternalLink, RefreshCw, Play, Square, RotateCcw, Activity, HardDrive, Cpu, Wifi } from "lucide-react";

// Coolify API integration types
interface CoolifyServer {
  id: string;
  name: string;
  ip: string;
  status: "reachable" | "unreachable" | "unknown";
  description?: string;
}

interface CoolifyApplication {
  id: string;
  name: string;
  status: "running" | "stopped" | "restarting" | "exited" | "unknown";
  type: "dockerfile" | "docker-compose" | "nixpacks" | "static";
  fqdn?: string;
  server_name?: string;
  last_deployment_status?: "success" | "failed" | "in_progress";
}

// Mock data - will be replaced by Coolify API calls
const mockServers: CoolifyServer[] = [
  { id: "srv-1", name: "Production Server", ip: "10.0.0.1", status: "reachable", description: "Main production VPS" },
  { id: "srv-2", name: "Dev Server", ip: "10.0.0.2", status: "reachable", description: "Development & staging" },
];

const mockApps: CoolifyApplication[] = [
  { id: "app-1", name: "WMA Platform", status: "running", type: "nixpacks", fqdn: "platform.wma.co.il", server_name: "Production Server", last_deployment_status: "success" },
  { id: "app-2", name: "N8N", status: "running", type: "docker-compose", fqdn: "n8n.wma.co.il", server_name: "Production Server", last_deployment_status: "success" },
  { id: "app-3", name: "Client App 1", status: "running", type: "nixpacks", fqdn: "client1.co.il", server_name: "Production Server", last_deployment_status: "success" },
  { id: "app-4", name: "Client App 2", status: "stopped", type: "dockerfile", fqdn: "client2.co.il", server_name: "Dev Server", last_deployment_status: "failed" },
];

export default function InfrastructurePage() {
  const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "info"; dot: string }> = {
    running: { label: "פעיל", variant: "success", dot: "bg-green-500" },
    stopped: { label: "מופסק", variant: "destructive", dot: "bg-red-500" },
    restarting: { label: "מאתחל", variant: "warning", dot: "bg-yellow-500" },
    exited: { label: "יצא", variant: "destructive", dot: "bg-red-400" },
    unknown: { label: "לא ידוע", variant: "info", dot: "bg-gray-400" },
    reachable: { label: "זמין", variant: "success", dot: "bg-green-500" },
    unreachable: { label: "לא זמין", variant: "destructive", dot: "bg-red-500" },
  };

  const deployStatusConfig: Record<string, { label: string; variant: "success" | "destructive" | "warning" }> = {
    success: { label: "הצליח", variant: "success" },
    failed: { label: "נכשל", variant: "destructive" },
    in_progress: { label: "בתהליך", variant: "warning" },
  };

  const runningCount = mockApps.filter(a => a.status === "running").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">תשתיות Coolify</h2>
          <p className="text-muted-foreground">
            {runningCount}/{mockApps.length} applications פעילים · {mockServers.length} שרתים
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <a href={process.env.NEXT_PUBLIC_COOLIFY_URL ?? "#"} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              פתח Coolify
            </a>
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Deploy חדש
          </Button>
        </div>
      </div>

      {/* Resource Overview */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Applications", value: mockApps.length, icon: Container, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "פעילים", value: runningCount, icon: Activity, color: "text-green-600", bg: "bg-green-50" },
          { label: "שרתים", value: mockServers.length, icon: Server, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "מופסקים", value: mockApps.filter(a => a.status === "stopped").length, icon: Square, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`rounded-lg p-2.5 ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Servers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4" />
            שרתים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockServers.map((server) => {
              const status = statusConfig[server.status];
              return (
                <div key={server.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <Server className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{server.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Wifi className="h-3 w-3" />
                          {server.ip}
                        </span>
                        {server.description && <span>{server.description}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Fake metrics */}
                    <div className="hidden sm:flex gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Cpu className="h-3 w-3" />
                        <span>23%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        <span>45%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${status.dot} animate-pulse`} />
                      <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      ניהול
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Container className="h-4 w-4" />
            Applications & Containers
          </CardTitle>
          <CardDescription>כל ה-applications הפרוסים ב-Coolify</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-3 py-2 text-xs font-medium text-muted-foreground uppercase border-b">
              <span>שם</span>
              <span>סוג</span>
              <span>Deploy</span>
              <span>סטטוס</span>
              <span>פעולות</span>
            </div>
            {mockApps.map((app) => {
              const status = statusConfig[app.status];
              const deployStatus = app.last_deployment_status
                ? deployStatusConfig[app.last_deployment_status]
                : null;

              return (
                <div key={app.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-3 py-3 rounded-lg hover:bg-accent/50 transition-colors items-center">
                  <div>
                    <p className="font-medium text-sm">{app.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {app.fqdn && (
                        <a href={`https://${app.fqdn}`} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-1 hover:text-primary">
                          <ExternalLink className="h-3 w-3" />
                          {app.fqdn}
                        </a>
                      )}
                      {app.server_name && <span>· {app.server_name}</span>}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">{app.type}</Badge>
                  {deployStatus && (
                    <Badge variant={deployStatus.variant} className="text-xs">{deployStatus.label}</Badge>
                  )}
                  <div className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${status.dot}`} />
                    <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Deploy">
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    {app.status === "running" ? (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="עצור">
                        <Square className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="הפעל">
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="אתחול">
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
