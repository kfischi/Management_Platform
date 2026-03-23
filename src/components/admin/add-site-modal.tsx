"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  Github,
  Search,
  Check,
  Lock,
  Globe,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type GitHubRepo = {
  id: number;
  full_name: string;
  name: string;
  description: string | null;
  private: boolean;
  updated_at: string;
  language: string | null;
};

function RepoPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (repo: GitHubRepo) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const fetchRepos = async () => {
    if (repos.length > 0) return; // already loaded
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/github/repos");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה בטעינת ריפויים");
      setRepos(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) fetchRepos();
  };

  const filtered = repos.filter(
    (r) =>
      r.full_name.toLowerCase().includes(query.toLowerCase()) ||
      (r.description ?? "").toLowerCase().includes(query.toLowerCase())
  );

  const selected = repos.find((r) => r.full_name === value);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          <Github className="h-4 w-4 shrink-0" />
          {selected ? (
            <span className="text-foreground font-mono">{selected.full_name}</span>
          ) : (
            "בחר ריפו מ-GitHub..."
          )}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="חפש ריפו..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              dir="ltr"
            />
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                טוען ריפויים...
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 px-3 py-4 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {repos.length === 0 ? "אין ריפויים" : "לא נמצאו תוצאות"}
              </p>
            )}
            {!loading &&
              filtered.map((repo) => (
                <button
                  key={repo.id}
                  type="button"
                  onClick={() => {
                    onChange(repo);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    {repo.private ? (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-mono font-medium truncate">{repo.full_name}</p>
                    {repo.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {repo.description}
                      </p>
                    )}
                    {repo.language && (
                      <span className="text-xs text-muted-foreground">{repo.language}</span>
                    )}
                  </div>
                  {repo.full_name === value && (
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AddSiteModal({ variant = "default" }: { variant?: "default" | "empty" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    domain: "",
    github_repo: "",
    netlify_url: "",
    description: "",
  });

  const handleRepoSelect = (repo: GitHubRepo) => {
    setForm((f) => ({
      ...f,
      github_repo: repo.full_name,
      // Auto-fill name if empty
      name: f.name || repo.name,
      // Auto-fill description if empty
      description: f.description || repo.description || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("שם האתר הוא שדה חובה");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה בהוספת האתר");
      }
      setOpen(false);
      setForm({ name: "", domain: "", github_repo: "", netlify_url: "", description: "" });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "שגיאה לא ידועה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "empty" ? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            הוסף אתר ראשון
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            אתר חדש
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת אתר חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* GitHub Repo Picker */}
          <div className="space-y-1.5">
            <Label>ריפו GitHub</Label>
            <RepoPicker
              value={form.github_repo}
              onChange={handleRepoSelect}
            />
            {form.github_repo && (
              <p className="text-xs text-muted-foreground">
                נבחר:{" "}
                <span className="font-mono text-foreground">{form.github_repo}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">שם האתר *</Label>
            <Input
              id="name"
              placeholder="לדוגמה: אתר חברת X"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              dir="rtl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="domain">דומיין</Label>
            <Input
              id="domain"
              placeholder="example.com"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="netlify_url">Netlify URL</Label>
            <Input
              id="netlify_url"
              placeholder="https://your-site.netlify.app"
              value={form.netlify_url}
              onChange={(e) => setForm({ ...form, netlify_url: e.target.value })}
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">תיאור</Label>
            <Input
              id="description"
              placeholder="תיאור קצר של האתר"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              dir="rtl"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              הוסף אתר
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
