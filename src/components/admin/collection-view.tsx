"use client";

import * as React from "react";
import {
  Search, Plus, SlidersHorizontal, Columns3, Download,
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
  X, Trash2, MoreHorizontal, Check, ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/* ───────────────────────── types ───────────────────────── */

export interface ColDef<T = Record<string, unknown>> {
  key: string;
  title: string;
  sortable?: boolean;
  hidden?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface FilterState {
  field: string;
  operator: string;
  value: string;
}

export interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  onClick: (selectedIds: string[]) => void;
}

interface CollectionViewProps<T extends Record<string, unknown>> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: ColDef<T>[];
  keyField: keyof T;
  onNew?: () => void;
  newLabel?: string;
  onRowClick?: (row: T) => void;
  bulkActions?: BulkAction[];
  filterFields?: { key: string; label: string }[];
  pageSize?: number;
  emptyIcon?: React.ReactNode;
  emptyText?: string;
}

const OPERATORS = [
  { value: "contains", label: "מכיל" },
  { value: "equals", label: "שווה ל" },
  { value: "starts_with", label: "מתחיל ב" },
  { value: "ends_with", label: "מסתיים ב" },
  { value: "not_contains", label: "לא מכיל" },
];

/* ─────────────────────── component ─────────────────────── */

export function CollectionView<T extends Record<string, unknown>>({
  title,
  subtitle,
  data,
  columns: initialColumns,
  keyField,
  onNew,
  newLabel = "חדש",
  onRowClick,
  bulkActions = [],
  filterFields = [],
  pageSize: defaultPageSize = 20,
  emptyIcon,
  emptyText = "אין פריטים להצגה",
}: CollectionViewProps<T>) {
  /* visibility */
  const [colVisibility, setColVisibility] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialColumns.map((c) => [c.key, !c.hidden]))
  );

  const columns = initialColumns.filter((c) => colVisibility[c.key] !== false);

  /* sort */
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  /* search */
  const [search, setSearch] = React.useState("");

  /* filters */
  const [showFilter, setShowFilter] = React.useState(false);
  const [filters, setFilters] = React.useState<FilterState[]>([]);
  const [draftFilter, setDraftFilter] = React.useState<FilterState>({
    field: filterFields[0]?.key ?? "",
    operator: "contains",
    value: "",
  });

  function addFilter() {
    if (!draftFilter.field || !draftFilter.value) return;
    setFilters((f) => [...f, draftFilter]);
    setDraftFilter({ field: filterFields[0]?.key ?? "", operator: "contains", value: "" });
  }

  function removeFilter(idx: number) {
    setFilters((f) => f.filter((_, i) => i !== idx));
  }

  /* selection */
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  function toggleRow(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === pageData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pageData.map((r) => String(r[keyField]))));
    }
  }

  /* pagination */
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);

  /* derived */
  const filtered = React.useMemo(() => {
    let rows = [...data];

    // text search across all string fields
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(q))
      );
    }

    // column filters
    filters.forEach(({ field, operator, value }) => {
      rows = rows.filter((row) => {
        const cell = String(row[field] ?? "").toLowerCase();
        const val = value.toLowerCase();
        switch (operator) {
          case "contains": return cell.includes(val);
          case "equals": return cell === val;
          case "starts_with": return cell.startsWith(val);
          case "ends_with": return cell.endsWith(val);
          case "not_contains": return !cell.includes(val);
          default: return true;
        }
      });
    });

    // sort
    if (sortKey) {
      rows.sort((a, b) => {
        const av = String(a[sortKey] ?? "");
        const bv = String(b[sortKey] ?? "");
        const cmp = av.localeCompare(bv, "he");
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return rows;
  }, [data, search, filters, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  // reset page on filter/search change
  React.useEffect(() => setPage(1), [search, filters, sortKey, sortDir]);

  const allSelected = pageData.length > 0 && selected.size === pageData.length;
  const someSelected = selected.size > 0 && !allSelected;

  /* export */
  function exportCSV() {
    const visibleCols = initialColumns.filter((c) => colVisibility[c.key] !== false && !c.render);
    const header = visibleCols.map((c) => c.title).join(",");
    const rows = filtered.map((row) =>
      visibleCols.map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ─────────────── render ─────────────── */
  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {onNew && (
          <Button onClick={onNew} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            {newLabel}
          </Button>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 mb-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש..."
            className="pr-8 h-8 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        {filterFields.length > 0 && (
          <Button
            variant={showFilter || filters.length > 0 ? "default" : "outline"}
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setShowFilter((v) => !v)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            סינון
            {filters.length > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                {filters.length}
              </span>
            )}
          </Button>
        )}

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Columns3 className="h-3.5 w-3.5" />
              עמודות
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>הצג עמודות</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {initialColumns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.key}
                checked={colVisibility[col.key] !== false}
                onCheckedChange={(v) =>
                  setColVisibility((prev) => ({ ...prev, [col.key]: v }))
                }
              >
                {col.title}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export */}
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={exportCSV}>
          <Download className="h-3.5 w-3.5" />
          ייצוא
        </Button>

        {/* Count */}
        <span className="mr-auto text-xs text-muted-foreground">
          {filtered.length} פריטים
        </span>
      </div>

      {/* ── Filter builder ── */}
      {showFilter && (
        <div className="mb-3 rounded-lg border bg-slate-50/60 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">בנה סינון</p>
          <div className="flex items-center gap-2 flex-wrap">
            {/* field selector */}
            <select
              value={draftFilter.field}
              onChange={(e) => setDraftFilter((d) => ({ ...d, field: e.target.value }))}
              className="h-8 rounded-md border bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {filterFields.map((f) => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>

            {/* operator */}
            <select
              value={draftFilter.operator}
              onChange={(e) => setDraftFilter((d) => ({ ...d, operator: e.target.value }))}
              className="h-8 rounded-md border bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {OPERATORS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* value */}
            <Input
              value={draftFilter.value}
              onChange={(e) => setDraftFilter((d) => ({ ...d, value: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addFilter()}
              placeholder="ערך..."
              className="h-8 text-xs w-36"
            />

            <Button size="sm" className="h-8 text-xs" onClick={addFilter}>
              הוסף
            </Button>
          </div>

          {/* active filter chips */}
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {filters.map((f, i) => {
                const fieldLabel = filterFields.find((ff) => ff.key === f.field)?.label ?? f.field;
                const opLabel = OPERATORS.find((o) => o.value === f.operator)?.label ?? f.operator;
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs text-indigo-700"
                  >
                    <span className="font-medium">{fieldLabel}</span>
                    <span className="opacity-60">{opLabel}</span>
                    <span className="font-medium">"{f.value}"</span>
                    <button onClick={() => removeFilter(i)} className="ml-0.5 hover:text-indigo-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={() => setFilters([])}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                נקה הכל
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Table ── */}
      <div className="flex-1 rounded-lg border bg-white overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-slate-50/80">
              {/* select-all */}
              <th className="w-10 px-3 py-2.5">
                <CheckboxCell
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                />
              </th>

              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap",
                    col.sortable && "cursor-pointer select-none hover:text-slate-800 group"
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1 justify-end">
                    {col.title}
                    {col.sortable && (
                      <span className="opacity-40 group-hover:opacity-80 transition-opacity">
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5 text-indigo-600 opacity-100" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-indigo-600 opacity-100" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}

              {/* actions col */}
              <th className="w-10 px-3 py-2.5" />
            </tr>
          </thead>

          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="py-20 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {emptyIcon ?? <ArrowUpDown className="h-10 w-10 opacity-20" />}
                    <p className="text-sm">{emptyText}</p>
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        נקה חיפוש
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              pageData.map((row) => {
                const id = String(row[keyField]);
                const isSelected = selected.has(id);
                return (
                  <tr
                    key={id}
                    className={cn(
                      "border-b last:border-0 transition-colors cursor-pointer",
                      isSelected
                        ? "bg-indigo-50/60"
                        : "hover:bg-slate-50/80"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {/* checkbox */}
                    <td className="w-10 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <CheckboxCell
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                      />
                    </td>

                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-2.5 text-right">
                        {col.render
                          ? col.render(row[col.key], row)
                          : <span className="text-sm text-slate-700">{String(row[col.key] ?? "—")}</span>
                        }
                      </td>
                    ))}

                    {/* row actions */}
                    <td className="w-10 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => onRowClick?.(row)}>
                            פתח
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {bulkActions.map((action) => (
                            <DropdownMenuItem
                              key={action.label}
                              className={action.variant === "destructive" ? "text-red-600 focus:text-red-600" : ""}
                              onClick={() => action.onClick([id])}
                            >
                              {action.icon && <span className="ml-2">{action.icon}</span>}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {filtered.length > 0 && (
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} מתוך {filtered.length}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pg: number;
              if (totalPages <= 5) pg = i + 1;
              else if (page <= 3) pg = i + 1;
              else if (page >= totalPages - 2) pg = totalPages - 4 + i;
              else pg = page - 2 + i;
              return (
                <Button
                  key={pg}
                  variant={pg === page ? "default" : "outline"}
                  size="sm"
                  className="h-7 w-7 p-0 text-xs"
                  onClick={() => setPage(pg)}
                >
                  {pg}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </div>

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="h-7 rounded-md border bg-white px-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n} בעמוד</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Bulk action bar ── */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl border bg-slate-900 px-4 py-2.5 shadow-2xl text-white animate-in slide-in-from-bottom-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold">
            {selected.size}
          </div>
          <span className="text-sm font-medium ml-1">נבחרו</span>
          <div className="mx-2 h-4 w-px bg-white/20" />
          {bulkActions.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant={action.variant === "destructive" ? "destructive" : "secondary"}
              className="h-7 text-xs gap-1"
              onClick={() => {
                action.onClick([...selected]);
                setSelected(new Set());
              }}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
          <button
            onClick={() => setSelected(new Set())}
            className="mr-1 text-white/50 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────── Checkbox ─────────────── */

function CheckboxCell({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate ?? false;
    }
  }, [indeterminate]);

  return (
    <div
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded border transition-colors cursor-pointer",
        checked || indeterminate
          ? "bg-indigo-600 border-indigo-600"
          : "border-slate-300 bg-white hover:border-indigo-400"
      )}
      onClick={onChange}
    >
      <input ref={ref} type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {checked && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
      {!checked && indeterminate && <div className="h-0.5 w-2 rounded bg-white" />}
    </div>
  );
}
