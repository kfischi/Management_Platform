"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Lock,
  Unlock,
  ChevronDown,
} from "lucide-react";
import {
  PERMISSION_PRESETS,
  PERMISSION_GROUPS,
  FULL_PERMISSIONS,
  type ClientPermissions,
  type PresetKey,
} from "@/lib/permissions";

type Props = {
  siteId: string;
  siteName: string;
};

const PRESET_COLORS = {
  blue:   { btn: "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100",   active: "ring-2 ring-blue-400 bg-blue-100" },
  purple: { btn: "border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100", active: "ring-2 ring-purple-400 bg-purple-100" },
  green:  { btn: "border-green-300 bg-green-50 text-green-700 hover:bg-green-100",  active: "ring-2 ring-green-400 bg-green-100" },
};

function detectPreset(perms: ClientPermissions): PresetKey | null {
  for (const p of PERMISSION_PRESETS) {
    if (JSON.stringify(p.permissions) === JSON.stringify(perms)) return p.key;
  }
  return null;
}

export function ClientPermissionsPanel({ siteId, siteName }: Props) {
  const [open, setOpen] = useState(false);
  const [perms, setPerms] = useState<ClientPermissions>(FULL_PERMISSIONS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const activePreset = detectPreset(perms);

  const loadPerms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/site-permissions?siteId=${siteId}`);
      if (res.ok) setPerms(await res.json());
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    if (open) loadPerms();
  }, [open, loadPerms]);

  const applyPreset = (key: PresetKey) => {
    const preset = PERMISSION_PRESETS.find((p) => p.key === key);
    if (preset) setPerms({ ...preset.permissions });
  };

  const toggle = (key: keyof ClientPermissions) => {
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/site-permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_id: siteId, permissions: perms }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = Object.values(perms).filter(Boolean).length;
  const totalCount = Object.keys(perms).length;

  return (
    <>
      {/* Trigger button */}
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs"
        onClick={() => setOpen(true)}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        הרשאות
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">הרשאות לקוח</h2>
                  <p className="text-xs text-muted-foreground">{siteName}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setOpen(false)}>✕</Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="overflow-y-auto flex-1 p-5 space-y-6">
                  {/* Presets */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">חבילות מוכנות</p>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {PERMISSION_PRESETS.map((preset) => {
                        const colors = PRESET_COLORS[preset.color];
                        const isActive = activePreset === preset.key;
                        return (
                          <button
                            key={preset.key}
                            onClick={() => applyPreset(preset.key)}
                            className={`rounded-lg border p-3 text-right transition-all ${colors.btn} ${isActive ? colors.active : ""}`}
                          >
                            <p className="font-semibold text-sm">{preset.label}</p>
                            <p className="text-xs opacity-70 mt-0.5 leading-snug">{preset.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <p className="text-xs text-muted-foreground">או התאם אישית</p>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Permission groups */}
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.label} className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {group.label}
                      </p>
                      <div className="rounded-lg border divide-y overflow-hidden">
                        {group.items.map((item) => {
                          const enabled = perms[item.key];
                          return (
                            <button
                              key={item.key}
                              onClick={() => toggle(item.key)}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-accent/50 ${
                                enabled ? "bg-background" : "bg-muted/30"
                              }`}
                            >
                              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                                enabled ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                              }`}>
                                {enabled ? (
                                  <Unlock className="h-3.5 w-3.5" />
                                ) : (
                                  <Lock className="h-3.5 w-3.5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${!enabled ? "text-muted-foreground" : ""}`}>
                                  {item.label}
                                </p>
                                {item.hint && (
                                  <p className="text-xs text-muted-foreground truncate">{item.hint}</p>
                                )}
                              </div>
                              {/* Toggle pill */}
                              <div className={`w-10 h-5 rounded-full transition-colors shrink-0 relative ${
                                enabled ? "bg-primary" : "bg-muted-foreground/30"
                              }`}>
                                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                  enabled ? "translate-x-5" : "translate-x-0.5"
                                }`} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-5 border-t bg-muted/20 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {enabledCount} / {totalCount} הרשאות פעילות
                  </span>
                  <div className="flex items-center gap-2">
                    {saved && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> נשמר
                      </span>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                      סגור
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      )}
                      {saving ? "שומר..." : "שמור הרשאות"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
