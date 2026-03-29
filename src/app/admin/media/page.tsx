"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Upload, Search, Grid, List, Trash2, Copy, Check, Download,
  FileText, Film, Music, File, Image as ImageIcon, Loader2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  storage_path: string;
  alt_text: string | null;
  folder: string | null;
  created_at: string;
}

const BUCKET = "admin-media";

function formatBytes(b: number) {
  if (b > 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  if (b > 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${b} B`;
}

function FileIcon({ mime }: { mime: string }) {
  if (mime.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-blue-500" />;
  if (mime.startsWith("video/")) return <Film className="h-8 w-8 text-purple-500" />;
  if (mime.startsWith("audio/")) return <Music className="h-8 w-8 text-green-500" />;
  if (mime === "application/pdf") return <FileText className="h-8 w-8 text-red-500" />;
  return <File className="h-8 w-8 text-slate-400" />;
}

export default function AdminMediaPage() {
  const supabase = createClient();
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropRef = React.useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setItems((data ?? []) as MediaItem[]);
    setLoading(false);
  }

  React.useEffect(() => { load(); }, []);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
      if (uploadErr) continue;

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      await supabase.from("media").insert({
        owner_id: user.id,
        filename: path,
        original_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size: file.size,
        url: urlData.publicUrl,
        storage_path: path,
      });
    }
    setUploading(false);
    await load();
  }

  async function deleteItem(item: MediaItem) {
    setDeleting(item.id);
    await supabase.storage.from(BUCKET).remove([item.storage_path]);
    await supabase.from("media").delete().eq("id", item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
    setDeleting(null);
  }

  function copyUrl(item: MediaItem) {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  // Drag & drop
  function onDragOver(e: React.DragEvent) { e.preventDefault(); }
  function onDrop(e: React.DragEvent) { e.preventDefault(); handleUpload(e.dataTransfer.files); }

  const filtered = items.filter(i =>
    i.original_name.toLowerCase().includes(search.toLowerCase())
  );
  const images = filtered.filter(i => i.mime_type.startsWith("image/"));
  const others = filtered.filter(i => !i.mime_type.startsWith("image/"));
  const totalSize = items.reduce((s, i) => s + i.size, 0);

  return (
    <div className="space-y-5">
      <input ref={inputRef} type="file" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ספריית מדיה</h2>
          <p className="text-muted-foreground text-sm">{items.length} קבצים · {formatBytes(totalSize)}</p>
        </div>
        <Button onClick={() => inputRef.current?.click()} disabled={uploading} className="gap-2">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "מעלה..." : "העלה קבצים"}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-lg border bg-background px-3 py-2 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חפש קבצים..."
            className="bg-transparent text-sm focus:outline-none flex-1"
          />
          {search && <button onClick={() => setSearch("")}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
        </div>
        <div className="flex rounded-lg border overflow-hidden">
          <button onClick={() => setViewMode("grid")} className={cn("p-2 transition-colors", viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
            <Grid className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode("list")} className={cn("p-2 transition-colors", viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={dropRef}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="rounded-xl border-2 border-dashed border-muted-foreground/20 p-8 text-center hover:border-primary/40 hover:bg-accent/20 transition-colors cursor-pointer"
      >
        <Upload className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm font-medium">גרור ושחרר קבצים כאן, או לחץ להעלאה</p>
        <p className="text-xs text-muted-foreground mt-1">תמונות, PDF, וידאו, קבצים — עד 50MB לקובץ</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground/40" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/20 mb-3" />
          <p className="text-sm font-medium text-slate-600">{search ? "לא נמצאו קבצים" : "ספריית המדיה ריקה"}</p>
          <p className="text-xs text-muted-foreground mt-1">{search ? "נסה חיפוש אחר" : "התחל בהעלאת קבצים"}</p>
        </div>
      ) : (
        <>
          {/* Images section */}
          {images.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                תמונות ({images.length})
              </p>
              <div className={cn(
                viewMode === "grid"
                  ? "grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
                  : "divide-y rounded-xl border overflow-hidden bg-white"
              )}>
                {images.map(item => viewMode === "grid" ? (
                  <div key={item.id} className="group relative rounded-xl border overflow-hidden hover:shadow-md transition-shadow bg-white">
                    <div className="aspect-square bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt={item.alt_text ?? item.original_name} className="h-full w-full object-cover" />
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <button onClick={() => copyUrl(item)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors">
                        {copiedId === item.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <a href={item.url} download={item.original_name} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors">
                        <Download className="h-3.5 w-3.5" />
                      </a>
                      <button onClick={() => deleteItem(item)} disabled={deleting === item.id} className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/80 text-white hover:bg-red-600/80 transition-colors">
                        {deleting === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <div className="p-2 border-t">
                      <p className="text-xs font-medium truncate">{item.original_name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(item.size)}</p>
                    </div>
                  </div>
                ) : (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/30 transition-colors">
                    <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.original_name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(item.size)} · {item.mime_type}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => copyUrl(item)} className="h-7 w-7 flex items-center justify-center rounded-md border hover:bg-accent transition-colors">
                        {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                      <a href={item.url} download={item.original_name} className="h-7 w-7 flex items-center justify-center rounded-md border hover:bg-accent transition-colors">
                        <Download className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                      <button onClick={() => deleteItem(item)} disabled={deleting === item.id} className="h-7 w-7 flex items-center justify-center rounded-md border hover:bg-red-50 hover:border-red-200 transition-colors">
                        {deleting === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> : <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other files section */}
          {others.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-3">
                קבצים ({others.length})
              </p>
              <div className="divide-y rounded-xl border overflow-hidden bg-white">
                {others.map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors">
                    <div className="shrink-0">
                      <FileIcon mime={item.mime_type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.original_name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(item.size)} · {item.mime_type}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => copyUrl(item)} className="h-7 w-7 flex items-center justify-center rounded-md border hover:bg-accent transition-colors">
                        {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                      <a href={item.url} download={item.original_name} className="h-7 w-7 flex items-center justify-center rounded-md border hover:bg-accent transition-colors">
                        <Download className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                      <button onClick={() => deleteItem(item)} disabled={deleting === item.id} className="h-7 w-7 flex items-center justify-center rounded-md border hover:bg-red-50 hover:border-red-200 transition-colors">
                        {deleting === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> : <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
