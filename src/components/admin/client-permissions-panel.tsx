"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ShieldCheck, CheckCircle2, Zap,
  Type, ImageIcon, Bot, Phone, Briefcase, HelpCircle,
  Star, MousePointerClick, ArrowUpDown, Eye, Globe, Settings,
  Lock, Sparkles } from "lucide-react";
import {
  PERMISSION_PRESETS,
  PERMISSION_GROUPS,
  FULL_PERMISSIONS,
  type ClientPermissions,
  type PresetKey,
} from "@/lib/permissions";

/* ── per-permission icon + color ─────────────────────────────────────────── */
const PERM_META: Record<keyof ClientPermissions, { icon: React.ElementType; color: string; glow: string }> = {
  edit_text:         { icon: Type,               color: "from-sky-500 to-blue-600",     glow: "shadow-sky-500/40" },
  edit_images:       { icon: ImageIcon,           color: "from-violet-500 to-purple-600",glow: "shadow-violet-500/40" },
  edit_chatbot:      { icon: Bot,                 color: "from-cyan-500 to-teal-600",    glow: "shadow-cyan-500/40" },
  edit_contact:      { icon: Phone,               color: "from-green-500 to-emerald-600",glow: "shadow-green-500/40" },
  edit_services:     { icon: Briefcase,           color: "from-orange-500 to-amber-600", glow: "shadow-orange-500/40" },
  edit_faq:          { icon: HelpCircle,          color: "from-pink-500 to-rose-600",    glow: "shadow-pink-500/40" },
  edit_testimonials: { icon: Star,                color: "from-yellow-500 to-amber-500", glow: "shadow-yellow-500/40" },
  edit_cta:          { icon: MousePointerClick,   color: "from-red-500 to-rose-600",     glow: "shadow-red-500/40" },
  reorder_blocks:    { icon: ArrowUpDown,         color: "from-indigo-500 to-blue-600",  glow: "shadow-indigo-500/40" },
  toggle_visibility: { icon: Eye,                 color: "from-teal-500 to-cyan-600",    glow: "shadow-teal-500/40" },
  publish_site:      { icon: Globe,               color: "from-emerald-500 to-green-600",glow: "shadow-emerald-500/40" },
  edit_settings:     { icon: Settings,            color: "from-slate-400 to-slate-600",  glow: "shadow-slate-400/40" },
};

/* ── preset visuals ───────────────────────────────────────────────────────── */
const PRESET_META: Record<PresetKey, { gradient: string; border: string; glow: string; icon: React.ElementType; countColor: string }> = {
  maintenance: {
    gradient:   "from-[#0a1628] to-[#0d2040]",
    border:     "border-blue-600/40 hover:border-blue-400/70",
    glow:       "hover:shadow-blue-500/20",
    icon:       Lock,
    countColor: "text-blue-400",
  },
  standard: {
    gradient:   "from-[#160d28] to-[#1e0f3a]",
    border:     "border-purple-600/40 hover:border-purple-400/70",
    glow:       "hover:shadow-purple-500/20",
    icon:       Zap,
    countColor: "text-purple-400",
  },
  full: {
    gradient:   "from-[#0a1f18] to-[#0d2e20]",
    border:     "border-emerald-600/40 hover:border-emerald-400/70",
    glow:       "hover:shadow-emerald-500/20",
    icon:       Sparkles,
    countColor: "text-emerald-400",
  },
};

/* ── helpers ──────────────────────────────────────────────────────────────── */
function detectPreset(perms: ClientPermissions): PresetKey | null {
  for (const p of PERMISSION_PRESETS) {
    if (JSON.stringify(p.permissions) === JSON.stringify(perms)) return p.key;
  }
  return null;
}

/* ── component ────────────────────────────────────────────────────────────── */
type Props = { siteId: string; siteName: string };

export function ClientPermissionsPanel({ siteId, siteName }: Props) {
  const [open, setOpen]       = useState(false);
  const [perms, setPerms]     = useState<ClientPermissions>(FULL_PERMISSIONS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  const activePreset   = detectPreset(perms);
  const enabledCount   = Object.values(perms).filter(Boolean).length;
  const totalCount     = Object.keys(perms).length;
  const progressPct    = Math.round((enabledCount / totalCount) * 100);

  const loadPerms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/site-permissions?siteId=${siteId}`);
      if (res.ok) setPerms(await res.json());
    } finally { setLoading(false); }
  }, [siteId]);

  useEffect(() => { if (open) loadPerms(); }, [open, loadPerms]);

  const applyPreset = (key: PresetKey) => {
    const preset = PERMISSION_PRESETS.find((p) => p.key === key);
    if (preset) setPerms({ ...preset.permissions });
  };

  const toggle = (key: keyof ClientPermissions) =>
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));

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
    } finally { setSaving(false); }
  };

  return (
    <>
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm transition-all hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-300 hover:shadow-sm hover:shadow-violet-500/20"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        הרשאות
      </button>

      {/* ── Modal overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-white/8 overflow-hidden"
            style={{ background: "linear-gradient(160deg, #0f0f14 0%, #13121a 100%)" }}
          >
            {/* top accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-500/30">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base tracking-tight">הרשאות לקוח</h2>
                  <p className="text-xs text-white/40 mt-0.5">{siteName}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/8 hover:text-white"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
              </div>
            ) : (
              <>
                <div className="overflow-y-auto flex-1 px-6 pb-2 space-y-7">

                  {/* ── Presets ── */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
                      חבילות מוכנות
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {PERMISSION_PRESETS.map((preset) => {
                        const meta      = PRESET_META[preset.key];
                        const isActive  = activePreset === preset.key;
                        const Icon      = meta.icon;
                        const pCount    = Object.values(preset.permissions).filter(Boolean).length;
                        return (
                          <button
                            key={preset.key}
                            onClick={() => applyPreset(preset.key)}
                            className={`relative flex flex-col items-start gap-2.5 rounded-xl border p-4 text-right transition-all duration-200 bg-gradient-to-b ${meta.gradient} ${meta.border} hover:shadow-lg ${meta.glow} ${
                              isActive
                                ? "ring-1 ring-white/20 border-white/20 shadow-lg"
                                : ""
                            }`}
                          >
                            {isActive && (
                              <div className="absolute top-2 left-2 h-2 w-2 rounded-full bg-white/70 shadow shadow-white/50" />
                            )}
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${
                              preset.color === "blue" ? "from-blue-500 to-blue-700" :
                              preset.color === "purple" ? "from-purple-500 to-violet-700" :
                              "from-emerald-500 to-green-700"
                            } shadow-md`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-sm">{preset.label}</p>
                              <p className={`text-xs font-semibold mt-0.5 ${meta.countColor}`}>
                                {pCount} הרשאות
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Divider ── */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/8" />
                    <span className="text-[11px] text-white/25 uppercase tracking-widest">התאמה אישית</span>
                    <div className="flex-1 h-px bg-white/8" />
                  </div>

                  {/* ── Permission groups ── */}
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.label} className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
                        {group.label}
                      </p>
                      <div className="rounded-xl border border-white/6 overflow-hidden divide-y divide-white/5">
                        {group.items.map((item) => {
                          const enabled    = perms[item.key];
                          const meta       = PERM_META[item.key];
                          const Icon       = meta.icon;
                          return (
                            <button
                              key={item.key}
                              onClick={() => toggle(item.key)}
                              className={`group w-full flex items-center gap-3.5 px-4 py-3.5 text-right transition-all duration-150 ${
                                enabled
                                  ? "bg-white/3 hover:bg-white/5"
                                  : "bg-transparent hover:bg-white/3"
                              }`}
                            >
                              {/* icon */}
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br transition-all duration-200 ${
                                enabled
                                  ? `${meta.color} shadow-md ${meta.glow}`
                                  : "from-white/8 to-white/5"
                              }`}>
                                <Icon className={`h-3.5 w-3.5 transition-colors ${enabled ? "text-white" : "text-white/30"}`} />
                              </div>

                              {/* text */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium transition-colors ${enabled ? "text-white" : "text-white/35"}`}>
                                  {item.label}
                                </p>
                                {item.hint && (
                                  <p className="text-[11px] text-white/25 truncate mt-0.5">{item.hint}</p>
                                )}
                              </div>

                              {/* toggle switch */}
                              <div className={`relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ${
                                enabled ? "bg-gradient-to-r from-violet-600 to-indigo-600" : "bg-white/10"
                              }`}>
                                <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                                  enabled ? "translate-x-5.5 shadow-violet-500/50" : "translate-x-1"
                                }`} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="h-1" />
                </div>

                {/* ── Footer ── */}
                <div className="shrink-0 px-6 py-4 border-t border-white/8" style={{ background: "rgba(0,0,0,0.3)" }}>
                  {/* progress bar */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white/40 tabular-nums w-16 text-left">
                      {enabledCount}/{totalCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    {saved ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        נשמר בהצלחה
                      </span>
                    ) : (
                      <span className="text-xs text-white/25">{progressPct}% הרשאות פעילות</span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setOpen(false)}
                        className="px-4 py-2 rounded-lg text-sm text-white/50 transition-colors hover:bg-white/6 hover:text-white/80"
                      >
                        סגור
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/50 disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        )}
                        {saving ? "שומר..." : "שמור הרשאות"}
                      </button>
                    </div>
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
