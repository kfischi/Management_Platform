import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Plus, Upload, Folder, Search, Filter, Grid, List } from "lucide-react";

export default async function MediaPage() {
  const supabase = await createClient();

  const { data: media } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const totalSize = media?.reduce((sum, m) => sum + m.size, 0) ?? 0;
  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ספריית מדיה</h2>
          <p className="text-muted-foreground">
            {media?.length ?? 0} קבצים · {formatSize(totalSize)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Folder className="h-4 w-4" />
            תיקייה חדשה
          </Button>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            העלה קבצים
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-md border bg-background px-3 py-2 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="חפש קבצים..."
            className="bg-transparent text-sm focus:outline-none flex-1"
          />
        </div>
        <Button variant="outline" size="icon">
          <Grid className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Upload Zone */}
      <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 p-10 text-center hover:border-primary/40 hover:bg-accent/30 transition-colors cursor-pointer">
        <Upload className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium">גרור ושחרר קבצים כאן</p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, MP4, PDF עד 50MB</p>
      </div>

      {/* Media Grid */}
      {media && media.length > 0 ? (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {media.map((item) => (
            <div key={item.id} className="group relative rounded-lg border overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              {item.mime_type.startsWith("image/") ? (
                <div className="aspect-square bg-muted">
                  <img
                    src={item.url}
                    alt={item.alt_text ?? item.original_name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <span className="text-3xl">
                    {item.mime_type.startsWith("video/") ? "🎥" :
                     item.mime_type === "application/pdf" ? "📄" : "📁"}
                  </span>
                </div>
              )}
              <div className="p-2">
                <p className="text-xs font-medium truncate">{item.original_name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Image className="h-14 w-14 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-1">ספריית המדיה ריקה</h3>
            <p className="text-muted-foreground text-sm mb-6">התחל בהעלאת תמונות וקבצים</p>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              העלה קבצים ראשונים
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
