"use client";

import * as React from "react";
import {
  X, Bot, Save, Loader2, ExternalLink, MessageCircle,
  ToggleLeft, ToggleRight, Phone, Clock, DollarSign,
  HelpCircle, Sparkles, Eye,
} from "lucide-react";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";

interface ChatbotContext {
  businessName: string;
  services:     string;
  prices:       string;
  hours:        string;
  faq:          string;
  tone:         string;
  phone:        string;
}

interface ChatbotConfig {
  enabled:  boolean;
  greeting: string;
  whatsapp: string;
  context:  ChatbotContext;
}

const DEFAULT_CONFIG: ChatbotConfig = {
  enabled:  false,
  greeting: "שלום! אשמח לעזור 😊",
  whatsapp: "",
  context:  {
    businessName: "",
    services:     "",
    prices:       "",
    hours:        "",
    faq:          "",
    tone:         "ידידותי ומקצועי",
    phone:        "",
  },
};

const TONES = [
  "ידידותי ומקצועי",
  "רשמי ועסקי",
  "קז'ואל ומשוחרר",
  "חם ואישי",
  "תמציתי ועניני",
];

interface Props {
  siteId:   string;
  siteName: string;
  open:     boolean;
  onClose:  () => void;
}

export function SiteChatbotPanel({ siteId, siteName, open, onClose }: Props) {
  const [config, setConfig]     = React.useState<ChatbotConfig>(DEFAULT_CONFIG);
  const [loading, setLoading]   = React.useState(false);
  const [saving, setSaving]     = React.useState(false);
  const [tab, setTab]           = React.useState<"chatbot" | "whatsapp" | "preview">("chatbot");
  const { success, error }      = useToast();

  // Load config when panel opens
  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/admin/sites/${siteId}/chatbot`)
      .then(r => r.json())
      .then(data => {
        setConfig({
          enabled:  data.enabled ?? false,
          greeting: data.greeting ?? DEFAULT_CONFIG.greeting,
          whatsapp: data.whatsapp ?? "",
          context:  { ...DEFAULT_CONFIG.context, ...(data.context ?? {}) },
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, siteId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/sites/${siteId}/chatbot`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "שגיאה בשמירה");
      }
      success("הגדרות הצ'אטבוט נשמרו ✓");
    } catch (err) {
      error("שגיאה בשמירה", err instanceof Error ? err.message : "");
    } finally {
      setSaving(false);
    }
  };

  const setCtx = (field: keyof ChatbotContext, value: string) =>
    setConfig(c => ({ ...c, context: { ...c.context, [field]: value } }));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative mr-auto ml-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-gradient-to-l from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
              <Bot className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">הגדרות AI ו-WhatsApp</p>
              <p className="text-xs text-slate-500">{siteName}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-white px-4">
          {([
            { key: "chatbot",  label: "AI Chatbot",   icon: Bot },
            { key: "whatsapp", label: "WhatsApp",      icon: MessageCircle },
            { key: "preview",  label: "תצוגה מקדימה", icon: Eye },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                tab === key
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {/* ── Tab: Chatbot ── */}
              {tab === "chatbot" && (
                <div className="space-y-6">
                  {/* Enable toggle */}
                  <div className="flex items-center justify-between rounded-2xl border p-4 bg-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800">הפעל AI Chatbot</p>
                      <p className="text-xs text-slate-500 mt-0.5">הצ'אטבוט יופיע על האתר ויענה ללקוחות 24/7</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfig(c => ({ ...c, enabled: !c.enabled }))}
                      className="transition-colors"
                    >
                      {config.enabled
                        ? <ToggleRight className="h-8 w-8 text-indigo-600" />
                        : <ToggleLeft  className="h-8 w-8 text-slate-400" />}
                    </button>
                  </div>

                  {/* Greeting */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-indigo-500" />
                      הודעת פתיחה
                    </label>
                    <input
                      type="text"
                      value={config.greeting}
                      onChange={e => setConfig(c => ({ ...c, greeting: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none transition-colors"
                      placeholder="שלום! אשמח לעזור 😊"
                      dir="rtl"
                    />
                  </div>

                  {/* Business context */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="flex items-center gap-2 bg-indigo-50 px-4 py-3 border-b">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      <p className="text-sm font-semibold text-indigo-800">הקשר עסקי — ה-AI ילמד מהמידע הזה</p>
                    </div>
                    <div className="p-4 space-y-4">
                      <Field label="שם העסק" icon={<Bot className="h-3.5 w-3.5 text-indigo-400" />}>
                        <input
                          type="text"
                          value={config.context.businessName}
                          onChange={e => setCtx("businessName", e.target.value)}
                          className="input-field"
                          placeholder="לדוגמה: מסעדת הים"
                          dir="rtl"
                        />
                      </Field>

                      <Field label="שירותים / מוצרים" icon={<Sparkles className="h-3.5 w-3.5 text-indigo-400" />}>
                        <textarea
                          rows={3}
                          value={config.context.services}
                          onChange={e => setCtx("services", e.target.value)}
                          className="input-field resize-none"
                          placeholder={"ארוחת בוקר, ארוחת צהריים, משלוחים\nאירועים פרטיים עד 120 איש"}
                          dir="rtl"
                        />
                      </Field>

                      <Field label="מחירים" icon={<DollarSign className="h-3.5 w-3.5 text-indigo-400" />}>
                        <textarea
                          rows={2}
                          value={config.context.prices}
                          onChange={e => setCtx("prices", e.target.value)}
                          className="input-field resize-none"
                          placeholder="ארוחת צהריים מ-₪45\nאירוע מ-₪80 לאיש"
                          dir="rtl"
                        />
                      </Field>

                      <Field label="שעות פעילות" icon={<Clock className="h-3.5 w-3.5 text-indigo-400" />}>
                        <input
                          type="text"
                          value={config.context.hours}
                          onChange={e => setCtx("hours", e.target.value)}
                          className="input-field"
                          placeholder="א׳-ה׳: 08:00-22:00 | ו׳-ש׳: 09:00-23:00"
                          dir="rtl"
                        />
                      </Field>

                      <Field label="טלפון לייחוס" icon={<Phone className="h-3.5 w-3.5 text-indigo-400" />}>
                        <input
                          type="tel"
                          value={config.context.phone}
                          onChange={e => setCtx("phone", e.target.value)}
                          className="input-field"
                          placeholder="050-1234567"
                          dir="ltr"
                        />
                      </Field>

                      <Field label="שאלות ותשובות נפוצות" icon={<HelpCircle className="h-3.5 w-3.5 text-indigo-400" />}>
                        <textarea
                          rows={4}
                          value={config.context.faq}
                          onChange={e => setCtx("faq", e.target.value)}
                          className="input-field resize-none"
                          placeholder={"ש: האם יש חניה?\nת: כן, חניה חינם מול הכניסה\n\nש: האם אפשר להגיע ללא הזמנה?\nת: כן, אבל מומלץ להזמין מקום"}
                          dir="rtl"
                        />
                      </Field>

                      <Field label="אופי/טון הצ'אט" icon={<Sparkles className="h-3.5 w-3.5 text-indigo-400" />}>
                        <div className="flex flex-wrap gap-2">
                          {TONES.map(tone => (
                            <button
                              key={tone}
                              type="button"
                              onClick={() => setCtx("tone", tone)}
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                                config.context.tone === tone
                                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                  : "border-slate-200 text-slate-600 hover:border-indigo-300"
                              )}
                            >
                              {tone}
                            </button>
                          ))}
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: WhatsApp ── */}
              {tab === "whatsapp" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    <p className="font-semibold flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      כפתור WhatsApp צף
                    </p>
                    <p className="mt-1 text-green-700">
                      כפתור WhatsApp ירוק יופיע בפינה השמאלית התחתונה של האתר. לחיצה תפתח WhatsApp ישירות.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      מספר WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={config.whatsapp}
                      onChange={e => setConfig(c => ({ ...c, whatsapp: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-400 focus:outline-none transition-colors"
                      placeholder="972501234567"
                      dir="ltr"
                    />
                    <p className="text-xs text-slate-400">
                      פורמט בינלאומי ללא + (לדוגמה: 972501234567)
                    </p>
                  </div>

                  {/* Preview */}
                  {config.whatsapp && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500 mb-3">תצוגה מקדימה</p>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
                          style={{ background: "#25D366" }}
                        >
                          <svg viewBox="0 0 32 32" className="h-6 w-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.627 4.64 1.813 6.653L2.667 29.333l6.88-1.773A13.285 13.285 0 0016.004 29.333C23.36 29.333 29.333 23.36 29.333 16S23.36 2.667 16.004 2.667zm0 24c-2.16 0-4.267-.587-6.107-1.693l-.44-.267-4.08 1.053 1.08-3.96-.28-.453A10.61 10.61 0 015.333 16c0-5.88 4.787-10.667 10.667-10.667S26.667 10.12 26.667 16 21.88 26.667 16 26.667zm5.84-7.973c-.32-.16-1.893-.933-2.187-1.04-.293-.107-.507-.16-.72.16s-.827 1.04-1.013 1.253c-.187.213-.373.24-.693.08-.32-.16-1.347-.493-2.56-1.573-.947-.84-1.587-1.88-1.773-2.2-.187-.32-.02-.493.14-.653.144-.144.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.253-.613-.52-.533-.72-.547-.187-.013-.4-.013-.613-.013-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667s1.147 3.093 1.307 3.307c.16.213 2.253 3.44 5.453 4.827.76.333 1.36.533 1.827.68.773.24 1.48.2 2.04.12.62-.093 1.893-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">כפתור WhatsApp</p>
                          <a
                            href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:underline"
                            dir="ltr"
                          >
                            wa.me/{config.whatsapp.replace(/\D/g, "")}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: Preview ── */}
              {tab === "preview" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800">
                    <p className="font-semibold">קישור לצפייה באתר</p>
                    <p className="mt-1 text-indigo-600">
                      האתר זמין לצפייה בכתובת הבאה. שתף ללקוח לאישור לפני שיגור.
                    </p>
                  </div>

                  <a
                    href={`/sites/${siteId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
                  >
                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700" dir="ltr">
                      /sites/{siteId}
                    </span>
                    <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
                  </a>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">סטטוס</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        config.enabled ? "bg-green-500 animate-pulse" : "bg-slate-300"
                      )} />
                      <span className="text-slate-700">
                        AI Chatbot: {config.enabled ? "פעיל" : "כבוי"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        config.whatsapp ? "bg-green-500" : "bg-slate-300"
                      )} />
                      <span className="text-slate-700">
                        WhatsApp: {config.whatsapp ? "מוגדר" : "לא מוגדר"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-white px-6 py-4 flex items-center justify-between gap-3">
          <a
            href={`/sites/${siteId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            פתח אתר
          </a>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              סגור
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              שמור הגדרות
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── helper ─── */
function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
