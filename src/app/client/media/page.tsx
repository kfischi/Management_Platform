"use client";

import * as React from "react";
import { Upload, Image as ImageIcon, FileText, Video, Music, Search, Trash2, Download, Copy, Check, Loader2, FolderOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface MediaFile {
  name: string;
  id: string;
  updated_at: string;
  metadata: { size: number; mimetype: string };
}

const BUCKET = "client-media";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mime }: { mime: string }) {
  if (mime?.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-blue-500" />;
  if (mime?.startsWith("video/")) return <Video className="h-5 w-5 text-purple-500" />;
  if (mime?.startsWith("audio/")) return <Music className="h-5 w-5 text-green-500" />;
  return <FileText className="h-5 w-5 text-slate-400" />;
}

export default function ClientMediaPage() {
  const supabase = createClient();
  const [files, setFiles] = React.useState<MediaFile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); loadFiles(user.id); }
    });
  }, []);

  async function loadFiles(uid: string) {
    setLoading(true);
    const { data } = await supabase.storage.from(BUCKET).list(uid, { sortBy: { column: "updated_at", order: "desc" } });
    setFiles((data as MediaFile[] ?? []).filter(f => !f.name.startsWith(".")));
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    const path = `${userId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
    if (!error) await loadFiles(userId);
    setUploading(false);
    e.target.value = "";
  }

  async function deleteFile(name: string) {
    if (!userId) return;
    await supabase.storage.from(BUCKET).remove([`${userId}/${name}`]);
    setFiles(prev => prev.filter(f => f.name !== name));
  }

  function getPublicUrl(name: string) {
    if (!userId) return "";
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(`${userId}/${name}`);
    return data.publicUrl;
  }

  function copyUrl(file: MediaFile) {
    navigator.clipboard.writeText(getPublicUrl(file.name));
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const images = filtered.filter(f => f.metadata?.mimetype?.startsWith("image/"));
  const others = filtered.filter(f => !f.metadata?.mimetype?.startsWith("image/"));

  return (
    <div className="space-y-5 max-w-4xl" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            מדיה
          </h2>
          <p className="text-sm text-muted-foreground">{files.length} קבצים · ספריית הקבצים שלך</p>
        </div>
        <div className="flex gap-2">
          <input ref={inputRef} type="file" className="hidden" accept="image/*,video/*,application/pdf" onChange={handleUpload} />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            העלה קובץ
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חפש קובץ..."
          className="w-full rounded-xl border bg-white px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/40" />
        </div>
      )}

      {!loading && files.length === 0 && (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 p-16 text-center cursor-pointer hover:border-primary/40 hover:bg-accent/20 transition-all"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mb-3 text-muted-foreground/30" />
          <p className="text-sm font-medium text-slate-700">גרור לכאן קבצים, או לחץ להעלאה</p>
          <p className="text-xs text-muted-foreground mt-1">תמונות, וידאו, PDF — עד 50MB לקובץ</p>
        </div>
      )}

      {/* Images grid */}
      {images.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">תמונות ({images.length})</h3>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {images.map(file => (
              <div key={file.id} className="group relative rounded-xl border overflow-hidden bg-slate-50 aspect-square">
                <img
                  src={getPublicUrl(file.name)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <p className="text-white text-xs font-medium truncate w-full text-center">{file.name.split("_").slice(1).join("_")}</p>
                  <div className="flex gap-2">
                    <button onClick={() => copyUrl(file)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
                      {copiedId === file.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a href={getPublicUrl(file.name)} download className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
                      <Download className="h-3.5 w-3.5" />
                    </a>
                    <button onClick={() => deleteFile(file.name)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/70 hover:bg-red-500 text-white transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other files */}
      {others.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">קבצים אחרים ({others.length})</h3>
          <div className="divide-y rounded-xl border overflow-hidden bg-white">
            {others.map(file => (
              <div key={file.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors">
                <FileIcon mime={file.metadata?.mimetype} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name.split("_").slice(1).join("_")}</p>
                  <p className="text-xs text-muted-foreground">{file.metadata?.size ? formatBytes(file.metadata.size) : "—"}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => copyUrl(file)} className="flex h-7 w-7 items-center justify-center rounded-lg border text-slate-500 hover:bg-accent transition-colors">
                    {copiedId === file.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <a href={getPublicUrl(file.name)} download className="flex h-7 w-7 items-center justify-center rounded-lg border text-slate-500 hover:bg-accent transition-colors">
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  <button onClick={() => deleteFile(file.name)} className="flex h-7 w-7 items-center justify-center rounded-lg border text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
