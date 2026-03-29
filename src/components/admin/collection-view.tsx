"use client";

import * as React from "react";
import {
  Search, Plus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Check, Trash2, Loader2, SlidersHorizontal, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────── public types ─────────── */

export interface ColDef<T = Record<string, unknown>> {
  key: keyof T & string;
  title: string;
  sortable?: boolean;
  hidden?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface BulkAction {
  label: string;
  variant?: "default" | "destructive";
  onClick: (ids: string[]) => void;
}

export interface FilterField {
  key: string;
  label: string;
}

interface CollectionViewProps<T = Record<string, unknown>> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: ColDef<T>[];
  keyField: keyof T & string;
  onRowClick?: (row: T) => void;
  onNew?: () => void;
  newLabel?: string;
  bulkActions?: BulkAction[];
  filterFields?: FilterField[];
  pageSize?: number;
  emptyIcon?: React.ReactNode;
  emptyText?: string;
  loading?: boolean;
}

/* ─────────── CollectionView ─────────── */

export function CollectionView<T = Record<string, unknown>>({
  title,
  subtitle,
  data,
  columns,
  keyField,
  onRowClick,
  onNew,
  newLabel = "חדש",
  bulkActions = [],
  filterFields = [],
  pageSize = 10,
  emptyIcon,
  emptyText = "אין נתונים",
  loading = false,
}: CollectionViewProps<T>) {
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const searchRef = React.useRef<HTMLInputElement>(null);

  /* keyboard shortcut: Ctrl+F focuses search */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = React.useMemo(() => {
    let rows = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        columns.some((col) => {
          const val = (row as Record<string, unknown>)[col.key];
          return String(val ?? "").toLowerCase().includes(q);
        })
      );
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortKey];
        const bv = (b as Record<string, unknown>)[sortKey];
        const cmp = String(av ?? "").localeCompare(String(bv ?? ""), "he", { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, search, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const allPageIds = pageRows.map((r) => String((r as Record<string, unknown>)[keyField]));
  const allChecked = allPageIds.length > 0 && allPageIds.every((id) => selected.has(id));
  const someChecked = allPageIds.some((id) => selected.has(id));

  const toggleAll = () => {
    if (allChecked) {
      setSelected((prev) => { const s = new Set(prev); allPageIds.forEach((id) => s.delete(id)); return s; });
    } else {
      setSelected((prev) => { const s = new Set(prev); allPageIds.forEach((id) => s.add(id)); return s; });
    }
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };
  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  React.useEffect(() => setPage(1), [search]);

  const selectedIds = [...selected];

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-1.5 rounded-lg border bg-slate-50 px-3 py-1.5 text-sm text-muted-foreground w-44 focus-within:w-60 transition-all duration-200 focus-within:border-indigo-300 focus-within:bg-white">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש..."
              className="bg-transparent flex-1 min-w-0 focus:outline-none text-sm text-slate-700 placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch("")} className="shrink-0 hover:text-slate-700">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {onNew && (
            <button
              onClick={onNew}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-3.5 py-1.5 text-xs font-semibold transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              {newLabel}
            </button>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-5 py-2.5 bg-indigo-50 border-b border-indigo-100">
          <span className="text-xs font-semibold text-indigo-700">{selected.size} נבחרו</span>
          <div className="flex items-center gap-2">
            {bulkActions.map((action) => (
              <button
                key={action.label}
                onClick={() => { action.onClick(selectedIds); setSelected(new Set()); }}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  action.variant === "destructive"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                )}
              >
                {action.variant === "destructive" && <Trash2 className="h-3 w-3" />}
                {action.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="mr-auto flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700"
          >
            <X className="h-3 w-3" />
            ביטול
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : pageRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <div className="text-muted-foreground/30">{emptyIcon}</div>
          <p className="text-sm text-muted-foreground">{emptyText}</p>
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-indigo-600 hover:underline">
              נקה חיפוש
            </button>
          )}
          {onNew && !search && (
            <button
              onClick={onNew}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold mt-1"
            >
              <Plus className="h-4 w-4" />
              {newLabel}
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50/60">
                {bulkActions.length > 0 && (
                  <th className="w-10 px-4 py-3">
                    <Checkbox checked={allChecked} indeterminate={someChecked && !allChecked} onChange={toggleAll} />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap",
                      col.sortable && "cursor-pointer hover:text-slate-800 select-none group"
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    <span className="flex items-center gap-1 justify-end">
                      {col.title}
                      {col.sortable && sortKey === col.key
                        ? sortDir === "asc"
                          ? <ChevronUp className="h-3 w-3 text-indigo-500" />
                          : <ChevronDown className="h-3 w-3 text-indigo-500" />
                        : col.sortable
                          ? <ChevronUp className="h-3 w-3 text-slate-200 group-hover:text-slate-400" />
                          : null}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => {
                const id = String((row as Record<string, unknown>)[keyField]);
                const isSelected = selected.has(id);
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "border-b last:border-0 transition-colors",
                      onRowClick && "cursor-pointer",
                      isSelected
                        ? "bg-indigo-50/60 hover:bg-indigo-50"
                        : "hover:bg-slate-50/80"
                    )}
                  >
                    {bulkActions.length > 0 && (
                      <td
                        className="w-10 px-4 py-3 align-middle"
                        onClick={(e) => { e.stopPropagation(); toggleOne(id); }}
                      >
                        <Checkbox checked={isSelected} onChange={() => toggleOne(id)} />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-right align-middle">
                        {col.render
                          ? col.render((row as Record<string, unknown>)[col.key], row)
                          : (
                            <span className="text-sm text-slate-700">
                              {String((row as Record<string, unknown>)[col.key] ?? "—")}
                            </span>
                          )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t bg-slate-50/50">
          <span className="text-xs text-muted-foreground">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} מתוך {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <PagBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronRight className="h-3.5 w-3.5" />
            </PagBtn>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((pg) => (
              <PagBtn key={pg} onClick={() => setPage(pg)} active={pg === page}>
                {pg}
              </PagBtn>
            ))}
            {totalPages > 7 && <span className="px-1 text-xs text-muted-foreground">…</span>}
            <PagBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </PagBtn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── helpers ─────────── */

function Checkbox({
  checked,
  indeterminate = false,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label className="flex items-center justify-center cursor-pointer">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div
        className={cn(
          "h-4 w-4 rounded border transition-colors flex items-center justify-center",
          checked || indeterminate
            ? "bg-indigo-600 border-indigo-600"
            : "border-slate-300 bg-white hover:border-indigo-400"
        )}
      >
        {checked && <Check className="h-2.5 w-2.5 text-white" />}
        {indeterminate && !checked && <div className="h-0.5 w-2 bg-white rounded" />}
      </div>
    </label>
  );
}

function PagBtn({
  children,
  onClick,
  disabled = false,
  active = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-7 min-w-[28px] px-1.5 rounded-md text-xs font-medium transition-colors",
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}
