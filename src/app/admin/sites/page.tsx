import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, Github, Plus, RefreshCw, RotateCcw } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function SitesPage() {
  const supabase = await createClient();

  const { data: sites } = await supabase
    .from("sites")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false });

  const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "info"; dot: string }> = {
    active: { label: "פעיל", variant: "success", dot: "bg-green-500" },
    building: { label: "בנייה", variant: "warning", dot: "bg-yellow-500" },
    error: { label: "שגיאה", variant: "destructive", dot: "bg-red-500" },
    paused: { label: "מושהה", variant: "info", dot: "bg-gray-400" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ניהול אתרים</h2>
          <p className="text-muted-foreground">
            {sites?.length ?? 0} אתרים במערכת
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          אתר חדש
        </Button>
      </div>

      {/* Grid */}
      {sites && sites.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => {
            const status = statusConfig[site.status] ?? statusConfig.paused;
            const owner = site.profiles as { full_name: string | null; email: string } | null;

            return (
              <Card key={site.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{site.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {owner?.full_name || owner?.email || "ללא בעלים"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${status.dot} animate-pulse`} />
                      <Badge variant={status.variant} className="text-xs">
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {site.domain && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span className="truncate">{site.domain}</span>
                    </div>
                  )}
                  {site.github_repo && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Github className="h-3 w-3" />
                      <span className="truncate">{site.github_repo}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    נוצר: {formatDate(site.created_at)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {site.netlify_url && (
                      <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" asChild>
                        <a href={site.netlify_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                          צפייה
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      <RefreshCw className="h-3 w-3" />
                      Deploy
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      <RotateCcw className="h-3 w-3" />
                      Rollback
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Globe className="h-14 w-14 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-1">אין אתרים עדיין</h3>
            <p className="text-muted-foreground text-sm mb-6">
              התחל בהוספת האתר הראשון שלך
            </p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              הוסף אתר ראשון
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
