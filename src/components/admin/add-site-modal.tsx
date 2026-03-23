"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
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
            <Label htmlFor="github_repo">GitHub Repo</Label>
            <Input
              id="github_repo"
              placeholder="username/repo-name"
              value={form.github_repo}
              onChange={(e) => setForm({ ...form, github_repo: e.target.value })}
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
