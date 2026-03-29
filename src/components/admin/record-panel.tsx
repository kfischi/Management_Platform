"use client";

import * as React from "react";
import {
  X, Save, Trash2, Copy, Check, ChevronDown, Clock, User,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────── public types ─────────── */

export interface BadgeOption {
  value: string;
  label: string;
  color: string; // e.g. "bg-green-600 text-white"
}

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "url" | "readonly" | "badge" | "email" | "tel";
  section?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  copyable?: boolean;
  readonly?: boolean;
  options?: BadgeOption[]; // for type "badge"
}

export interface ActivityEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  detail?: string;
}

interface RecordPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  record: Record<string, unknown> | null;
  fields: FieldDef[];
  onSave: (updated: Record<string, unknown>) => Promise<void>;
  onDelete?: () => void;
  activityLog?: ActivityEntry[];
}

/* ─────────── RecordPanel ─────────── */

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
  const [tab, setTab] = React.useState<"details" | "activity">("details");
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  /* Sync draft when record changes */
  React.useEffect(() => {
    if (record) setDraft({ ...record });
  }, [record]);

  /* Escape to close */
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draft]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (value: string, key: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const set = (key: string, value: unknown) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  /* Group fields by section */
  const sections = React.useMemo(() => {
    const map = new Map<string, FieldDef[]>();
    for (const f of fields) {
      const sec = f.section ?? "כללי";
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(f);
    }
    return map;
  }, [fields]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(record);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-full max-w-[480px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        dir="rtl"
      >
        {/* ── Top header ── */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-800 truncate">{title || "רשומה חדשה"}</h2>
              {isDirty && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" title="שינויים לא שמורים" />
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-muted-foreground transition-colors shrink-0 mr-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b shrink-0">
          {[
            { id: "details" as const, label: "פרטים" },
            { id: "activity" as const, label: `היסטוריה (${activityLog.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 py-2.5 text-xs font-medium transition-colors border-b-2",
                tab === t.id
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-muted-foreground hover:text-slate-700"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">
          {tab === "details" ? (
            <div className="p-5 space-y-6">
              {[...sections.entries()].map(([section, sectionFields]) => (
                <div key={section}>
                  <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="h-px flex-1 bg-slate-100" />
                    {section}
                    <span className="h-px flex-1 bg-slate-100" />
                  </h3>
                  <div className="space-y-3">
                    {sectionFields.map((field) => (
                      <FieldInput
                        key={field.key}
                        field={field}
                        value={draft[field.key]}
                        onChange={(v) => set(field.key, v)}
                        onCopy={() => copyToClipboard(String(draft[field.key] ?? ""), field.key)}
                        copied={copiedKey === field.key}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ActivityLog entries={activityLog} />
          )}
        </div>

        {/* ── Footer actions ── */}
        <div className="px-5 py-4 border-t bg-slate-50/80 flex items-center gap-2 shrink-0">
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={cn(
              "flex items-center gap-2 flex-1 justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all",
              isDirty
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            {saving
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Save className="h-4 w-4" />}
            {saving ? "שומר..." : "שמור"}
            {isDirty && !saving && (
              <kbd className="hidden sm:inline-flex items-center rounded border border-white/30 bg-white/20 px-1 text-[9px]">⌘S</kbd>
            )}
          </button>

          {onDelete && (
            <>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600 font-medium">בטוח?</span>
                  <button
                    onClick={() => { onDelete(); setConfirmDelete(false); }}
                    className="rounded-lg bg-red-600 text-white px-3 py-2 text-xs font-semibold hover:bg-red-700"
                  >
                    מחק
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg border px-3 py-2 text-xs hover:bg-slate-100"
                  >
                    ביטול
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 text-xs font-medium transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  מחק
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────── FieldInput ─────────── */

function FieldInput({
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
  const strVal = String(value ?? "");
  const isReadonly = field.readonly || field.type === "readonly";

  return (
    <div className="group">
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
        {field.icon && <span className="text-muted-foreground">{field.icon}</span>}
        {field.label}
        {field.copyable && (
          <button
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-muted-foreground hover:text-indigo-600"
          >
            {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
          </button>
        )}
      </label>

      {field.type === "badge" && field.options ? (
        <BadgeSelect
          value={strVal}
          options={field.options}
          onChange={onChange}
        />
      ) : field.type === "textarea" ? (
        <textarea
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          disabled={isReadonly}
          placeholder={field.placeholder}
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-slate-50 disabled:text-muted-foreground resize-none"
        />
      ) : (
        <div className="relative flex items-center">
          <input
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "url" ? "url" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
            value={strVal}
            onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
            disabled={isReadonly}
            readOnly={isReadonly}
            placeholder={field.placeholder}
            className={cn(
              "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-300",
              isReadonly && "bg-slate-50 text-muted-foreground cursor-default",
              field.type === "url" && "text-indigo-600"
            )}
          />
        </div>
      )}
    </div>
  );
}

/* ─────────── BadgeSelect ─────────── */

function BadgeSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: BadgeOption[];
  onChange: (v: unknown) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value) ?? options[0];
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClickOut = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOut);
    return () => document.removeEventListener("mousedown", onClickOut);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm w-full hover:bg-slate-50 transition-colors"
      >
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", selected?.color)}>
          {selected?.label}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground mr-auto" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 left-0 z-50 rounded-xl border bg-white shadow-xl py-1 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors",
                opt.value === value && "bg-indigo-50"
              )}
            >
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", opt.color)}>
                {opt.label}
              </span>
              {opt.value === value && <Check className="h-3.5 w-3.5 text-indigo-600 mr-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── ActivityLog ─────────── */

function ActivityLog({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <Clock className="h-8 w-8 text-muted-foreground/20" />
        <p className="text-xs text-muted-foreground">אין פעילות עדיין</p>
      </div>
    );
  }
  return (
    <div className="p-5">
      <div className="relative space-y-0">
        {/* vertical line */}
        <div className="absolute right-[17px] top-0 bottom-0 w-px bg-slate-100" />
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 pb-4 relative">
            <div className="shrink-0 h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white z-10">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 pt-1.5 min-w-0">
              <p className="text-sm text-slate-700">
                <span className="font-medium text-slate-800">{entry.user}</span>
                {" "}{entry.action}
              </p>
              {entry.detail && (
                <p className="text-xs text-muted-foreground mt-0.5 font-mono bg-slate-50 px-2 py-0.5 rounded-md inline-block">
                  {entry.detail}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {entry.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
