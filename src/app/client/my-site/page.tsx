import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, Github, RefreshCw, CheckCircle2, Clock, XCircle, Edit3 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function MySitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("owner_id", user.id);

  const site = sites?.[0];

  const { data: deployments } = await supabase
    .from("deployments")
    .select("*")
    .eq("site_id", site?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(10);

  const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "info" }> = {
    active: { label: "פעיל ✓", variant: "success" },
    building: { label: "בנייה...", variant: "warning" },
    error: { label: "שגיאה", variant: "destructive" },
    paused: { label: "מושהה", variant: "info" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">האתר שלי</h2>
        <p className="text-muted-foreground">פרטים וסטטוס האתר שלך</p>
      </div>

      {site ? (
        <>
          {/* Site Card */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{site.name}</CardTitle>
                    <CardDescription>{site.description || "האתר שלי"}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant={statusConfig[site.status]?.variant ?? "info"}
                  className="text-sm px-3 py-1"
                >
                  {statusConfig[site.status]?.label ?? site.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {site.domain && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">דומיין</p>
                      <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer"
                         className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                        {site.domain}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
                {site.netlify_url && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Netlify URL</p>
                      <a href={site.netlify_url} target="_blank" rel="noopener noreferrer"
                         className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                        צפה באתר
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
                {site.github_repo && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">קוד מקור</p>
                      <p className="text-sm font-medium">{site.github_repo}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">עדכון אחרון</p>
                    <p className="text-sm font-medium">{formatDate(site.updated_at)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button className="gap-2" asChild>
                  <Link href="/client/editor">
                    <Edit3 className="h-4 w-4" />
                    ערוך תוכן האתר
                  </Link>
                </Button>
                {site.netlify_url && (
                  <Button variant="outline" className="gap-2" asChild>
                    <a href={site.netlify_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      פתח את האתר
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deployments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">היסטוריית עדכונים</CardTitle>
              <CardDescription>כל הפרסומים של האתר שלך</CardDescription>
            </CardHeader>
            <CardContent>
              {deployments && deployments.length > 0 ? (
                <div className="space-y-2">
                  {deployments.map((dep) => (
                    <div key={dep.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                      {dep.status === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      ) : dep.status === "building" ? (
                        <Clock className="h-5 w-5 text-yellow-500 shrink-0 animate-spin" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{dep.commit_message || "עדכון אתר"}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(dep.created_at)}</span>
                          {dep.branch && <span>· {dep.branch}</span>}
                          {dep.commit_hash && (
                            <span className="font-mono">{dep.commit_hash.slice(0, 7)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={dep.status === "success" ? "success" : dep.status === "building" ? "warning" : "destructive"}
                          className="text-xs"
                        >
                          {dep.status === "success" ? "הצליח" : dep.status === "building" ? "בתהליך" : "נכשל"}
                        </Badge>
                        {dep.deploy_url && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                            <a href={dep.deploy_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">אין היסטוריית עדכונים עדיין</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Globe className="h-14 w-14 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-1">אין אתר מוגדר עדיין</h3>
            <p className="text-muted-foreground text-sm mb-6">צור קשר עם WMA Agency להתחלת הפרויקט</p>
            <Button className="gap-2">
              💬 צור קשר עכשיו
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
