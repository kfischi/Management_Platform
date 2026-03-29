"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Webhook, Loader2, Check, ExternalLink } from "lucide-react";

type Props = {
  siteId: string;
  currentHook: string | null;
};

export function EditBuildHookButton({ siteId, currentHook }: Props) {
  const [open, setOpen] = useState(false);
  const [hook, setHook] = useState(currentHook ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sites/${siteId}/build-hook`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ netlify_build_hook: hook.trim() || null }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => { setSaved(false); setOpen(false); }, 1200);
    } catch {
      setError("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="gap-1 text-xs"
        onClick={() => setOpen(true)}
        title="הגדר Netlify Build Hook"
      >
        <Webhook className="h-3 w-3" />
        Build Hook
        {currentHook && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-base">Netlify Build Hook</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  הכנס את ה-Build Hook URL של האתר ב-Netlify
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setOpen(false)}>✕</Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Build Hook URL</label>
              <input
                type="url"
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                placeholder="https://api.netlify.com/build_hooks/..."
                dir="ltr"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">איך מוצאים את ה-Hook?</p>
              <p>Netlify → האתר → Site configuration → Build &amp; deploy</p>
              <p>→ Continuous deployment → Build hooks → Add build hook</p>
              <a
                href="https://app.netlify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline mt-1"
              >
                פתח Netlify <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                ביטול
              </Button>
              <Button className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Webhook className="h-4 w-4" />
                )}
                {saved ? "נשמר!" : saving ? "שומר..." : "שמור"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
