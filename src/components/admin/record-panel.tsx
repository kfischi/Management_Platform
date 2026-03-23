"use client";

import * as React from "react";
import {
  X, Save, Clock, User, Calendar, Tag, Phone, Mail,
  Building, Globe, FileText, Hash, ToggleLeft, ChevronDown,
  Pencil, ExternalLink, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ────────────────────── types ────────────────────── */

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "number"
  | "textarea"
  | "select"
  | "badge"
  | "date"
  | "readonly";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  icon?: React.ReactNode;
  options?: { value: string; label: string; color?: string }[];
  section?: string;
  readonly?: boolean;
  copyable?: boolean;
}

export interface RecordPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  record: Record<string, unknown> | null;
  fields: FieldDef[];
  onSave?: (updated: Record<string, unknown>) => Promise<void> | void;
  onDelete?: (record: Record<string, unknown>) => void;
  activityLog?: ActivityEntry[];
}

export interface ActivityEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  detail?: string;
}

/* ────────────────────── component ────────────────────── */

export function RecordPanel({
  open,
  onClose,
  title,
  subtitle,
  record,
  fields,
  onSave,
  onDelete,
  activityLog = [],
}: RecordPanelProps) {
  const [draft, setDraft] = React.useState<Record<string, unknown>>({});
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"fields" | "activity">("fields");
  const [copied, setCopied] = React.useState<string | null>(null);

  /* sync record → draft when record changes */
  React.useEffect(() => {
    if (record) {
      setDraft({ ...record });
      setDirty(false);
    }
  }, [record]);

  function update(key: string, value: unknown) {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
  }

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(draft);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  function copyToClipboard(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  /* group fields by section */
  const sections = React.useMemo(() => {
    const map = new Map<string, FieldDef[]>();
    fields.forEach((f) => {
      const sec = f.section ?? "פרטים";
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(f);
    });
    return map;
  }, [fields]);

  if (!open || !record) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed top-0 left-0 z-50 flex h-full w-[480px] flex-col bg-white shadow-2xl border-r animate-in slide-in-from-left-8 duration-300">

        {/* ── Top bar ── */}
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold truncate">{title}</h2>
              {dirty && (
                <span className="text-[10px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium shrink-0">
                  שינויים לא שמורים
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 mr-3">
            {onSave && (
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={handleSave}
                disabled={!dirty || saving}
              >
                {saving ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                שמור
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b px-5 bg-slate-50/80">
          {(["fields", "activity"] as const).map((tab) => (
            <button
              key={tab}
              className={cn(
                "px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px",
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "fields" ? "שדות" : `פעילות (${activityLog.length})`}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "fields" && (
            <div className="p-5 space-y-6">
              {[...sections.entries()].map(([section, sectionFields]) => (
                <div key={section}>
                  <p className="mb-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    {section}
                  </p>
                  <div className="space-y-3">
                    {sectionFields.map((field) => (
                      <FieldRow
                        key={field.key}
                        field={field}
                        value={draft[field.key]}
                        onChange={(v) => update(field.key, v)}
                        onCopy={() => copyToClipboard(String(draft[field.key] ?? ""), field.key)}
                        copied={copied === field.key}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="p-5">
              {activityLog.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                  <Clock className="h-8 w-8 opacity-20" />
                  <p className="text-sm">אין פעילות עדיין</p>
                </div>
              ) : (
                <ol className="relative border-r border-slate-100 space-y-4 mr-3">
                  {activityLog.map((entry) => (
                    <li key={entry.id} className="relative pr-5">
                      <div className="absolute right-0 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-white bg-indigo-400 shadow" />
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-semibold">{entry.user}</span>
                        <span className="text-xs text-muted-foreground">{entry.action}</span>
                      </div>
                      {entry.detail && (
                        <p className="mt-0.5 text-xs text-slate-500 bg-slate-50 rounded px-2 py-1">{entry.detail}</p>
                      )}
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{entry.timestamp}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>

        {/* ── Footer metadata ── */}
        <div className="border-t px-5 py-3 bg-slate-50/80">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              נוצר {formatRelative(String(record.created_at ?? ""))}
            </span>
            {!!record.updated_at && String(record.updated_at) !== String(record.created_at) && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                עודכן {formatRelative(String(record.updated_at ?? ""))}
              </span>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(record)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                מחק
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

/* ──────────── FieldRow ──────────── */

function FieldRow({
  field,
  value,
  onChange,
  onCopy,
  copied,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const str = String(value ?? "");

  return (
    <div className="group">
      <Label className="mb-1.5 text-xs font-medium text-slate-600 flex items-center gap-1.5">
        {field.icon && <span className="text-slate-400">{field.icon}</span>}
        {field.label}
      </Label>

      {field.readonly || field.type === "readonly" ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-md bg-slate-50 border px-3 py-2 text-sm text-slate-700 min-h-[36px]">
            {str || <span className="text-muted-foreground text-xs">—</span>}
          </div>
          {field.copyable && (
            <button
              onClick={onCopy}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      ) : field.type === "textarea" ? (
        <textarea
          value={str}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      ) : field.type === "select" ? (
        <select
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">בחר...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : field.type === "badge" ? (
        <div className="flex flex-wrap gap-1.5">
          {field.options?.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border transition-all",
                str === opt.value
                  ? "border-transparent shadow-sm " + (opt.color ?? "bg-indigo-600 text-white")
                  : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="relative">
          <Input
            type={field.type}
            value={str}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 text-sm pr-3"
          />
          {field.copyable && str && (
            <button
              onClick={onCopy}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────── helpers ──────────── */

function formatRelative(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "עכשיו";
    if (mins < 60) return `לפני ${mins} דקות`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `לפני ${hours} שעות`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `לפני ${days} ימים`;
    return d.toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}
