"use client";

import * as React from "react";
import {
  FileText, Building, Download, Calendar, DollarSign,
  Hash, AlignLeft, Link as LinkIcon,
} from "lucide-react";
import { CollectionView, ColDef, BulkAction } from "@/components/admin/collection-view";
import { RecordPanel, FieldDef, ActivityEntry } from "@/components/admin/record-panel";
import { useToast } from "@/components/admin/toast";

/* ─────────── types ─────────── */

export interface Contract {
  id: string;
  title: string;
  description: string | null;
  client_id: string | null;
  amount: number;
  currency: string;
  status: "active" | "pending" | "expired" | "cancelled";
  start_date: string;
  end_date: string | null;
  file_url: string | null;
  created_at: string;
  updated_at?: string;
  clients?: { contact_name: string; company_name: string | null } | null;
}

/* ─────────── status config ─────────── */

const STATUS_CFG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  active:    { label: "פעיל",     dot: "bg-green-500",  text: "text-green-700",  bg: "bg-green-50 border-green-200"  },
  pending:   { label: "ממתין",    dot: "bg-amber-500",  text: "text-amber-700",  bg: "bg-amber-50 border-amber-200"  },
  expired:   { label: "פג תוקף", dot: "bg-red-500",    text: "text-red-700",    bg: "bg-red-50 border-red-200"      },
  cancelled: { label: "בוטל",    dot: "bg-slate-400",  text: "text-slate-600",  bg: "bg-slate-50 border-slate-200"  },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

/* ─────────── format ─────────── */

function formatCurrency(n: number, cur = "ILS") {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
}
function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" });
}

/* ─────────── mock data ─────────── */

const MOCK: Contract[] = [
  { id: "c1", title: "פיתוח אתר תדמית", description: "אתר תדמית 5 עמודים + SEO", client_id: "1", amount: 18000, currency: "ILS", status: "active", start_date: "2024-01-01", end_date: "2024-12-31", file_url: null, created_at: "2024-01-01T10:00:00Z", clients: { contact_name: "ישראל ישראלי", company_name: "טק סולושנס" } },
  { id: "c2", title: "ניהול SEO שנתי", description: "אופטימיזציה + תוכן חודשי", client_id: "2", amount: 24000, currency: "ILS", status: "active", start_date: "2024-03-01", end_date: "2025-02-28", file_url: null, created_at: "2024-03-01T09:00:00Z", clients: { contact_name: "שרה כהן", company_name: "כהן מרקטינג" } },
  { id: "c3", title: "חנות אינטרנטית", description: "Shopify + אינטגרציה עם מחסן", client_id: "3", amount: 45000, currency: "ILS", status: "pending", start_date: "2025-01-01", end_date: "2025-06-30", file_url: null, created_at: "2024-12-15T11:00:00Z", clients: { contact_name: "דוד לוי", company_name: "לוי נדל״ן" } },
  { id: "c4", title: "ליווי שיווקי רבעוני", description: "סושיאל + קמפיינים + analytics", client_id: "5", amount: 12000, currency: "ILS", status: "active", start_date: "2025-01-01", end_date: "2025-03-31", file_url: null, created_at: "2024-12-20T14:00:00Z", clients: { contact_name: "יוסי מנחם", company_name: "מנחם פינטק" } },
  { id: "c5", title: "עיצוב מחדש", description: "Redesign מלא + UX audit", client_id: "10", amount: 32000, currency: "ILS", status: "pending", start_date: "2025-04-01", end_date: "2025-07-31", file_url: null, created_at: "2025-02-10T10:00:00Z", clients: { contact_name: "גיל אורן", company_name: "אורן טכנולוגיות" } },
  { id: "c6", title: "אפליקציית לוגיסטיקה", description: "PWA מעקב משלוחים real-time", client_id: "7", amount: 75000, currency: "ILS", status: "active", start_date: "2023-09-01", end_date: "2024-08-31", file_url: null, created_at: "2023-09-01T08:00:00Z", clients: { contact_name: "אבי שפירא", company_name: "שפירא לוגיסטיקס" } },
  { id: "c7", title: "תחזוקה שוטפת", description: "תחזוקה + hosting + support", client_id: "1", amount: 4800, currency: "ILS", status: "expired", start_date: "2023-01-01", end_date: "2023-12-31", file_url: null, created_at: "2023-01-01T10:00:00Z", clients: { contact_name: "ישראל ישראלי", company_name: "טק סולושנס" } },
  { id: "c8", title: "קמפיין השקה", description: "לאנץ׳ דיגיטלי + PR", client_id: "9", amount: 8500, currency: "ILS", status: "cancelled", start_date: "2024-06-01", end_date: "2024-07-31", file_url: null, created_at: "2024-05-20T13:00:00Z", clients: { contact_name: "מרים חסן", company_name: "חסן אגרו" } },
];

const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: "a1", action: "שינה סטטוס ל-active", user: "אדמין", timestamp: "לפני 3 ימים" },
  { id: "a2", action: "עדכן סכום", user: "אדמין", timestamp: "לפני שבועיים", detail: "18,000 → 24,000 ₪" },
  { id: "a3", action: "יצר חוזה", user: "מערכת", timestamp: "1 ינואר 2024" },
];

/* ─────────── columns ─────────── */

const COLUMNS: ColDef<Contract>[] = [
  {
    key: "title",
    title: "חוזה",
    sortable: true,
    render: (_, row) => (
      <div>
        <p className="text-sm font-medium text-slate-800">{row.title}</p>
        {row.description && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{row.description}</p>}
      </div>
    ),
  },
  {
    key: "clients",
    title: "לקוח",
    sortable: false,
    render: (_, row) => {
      const c = row.clients;
      return c ? (
        <div>
          <p className="text-sm text-slate-700">{c.contact_name}</p>
          {c.company_name && <p className="text-xs text-muted-foreground">{c.company_name}</p>}
        </div>
      ) : <span className="text-xs text-muted-foreground">—</span>;
    },
  },
  {
    key: "amount",
    title: "סכום",
    sortable: true,
    render: (value, row) => (
      <span className="text-sm font-semibold text-slate-800 tabular-nums">
        {formatCurrency(Number(value), row.currency)}
      </span>
    ),
  },
  {
    key: "start_date",
    title: "תקופה",
    sortable: true,
    render: (_, row) => (
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        <div>{formatDate(row.start_date)}</div>
        {row.end_date && <div className="text-slate-400">← {formatDate(row.end_date)}</div>}
      </div>
    ),
  },
  {
    key: "status",
    title: "סטטוס",
    sortable: true,
    render: (value) => <StatusBadge status={String(value)} />,
  },
  {
    key: "file_url",
    title: "קובץ",
    render: (value) => value ? (
      <a
        href={String(value)}
        download
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
      >
        <Download className="h-3 w-3" />
        הורד
      </a>
    ) : <span className="text-xs text-muted-foreground">—</span>,
  },
];

/* ─────────── panel fields ─────────── */

const PANEL_FIELDS: FieldDef[] = [
  { key: "title",       label: "כותרת",   type: "text",     icon: <FileText className="h-3.5 w-3.5" />,   section: "פרטי חוזה" },
  { key: "description", label: "תיאור",   type: "textarea", icon: <AlignLeft className="h-3.5 w-3.5" />, section: "פרטי חוזה" },
  { key: "amount",      label: "סכום ₪",  type: "number",   icon: <DollarSign className="h-3.5 w-3.5" />, section: "פיננסי" },
  {
    key: "status",
    label: "סטטוס",
    type: "badge",
    section: "פיננסי",
    options: [
      { value: "active",    label: "פעיל",     color: "bg-green-600 text-white" },
      { value: "pending",   label: "ממתין",    color: "bg-amber-500 text-white" },
      { value: "expired",   label: "פג תוקף", color: "bg-red-600 text-white" },
      { value: "cancelled", label: "בוטל",    color: "bg-slate-500 text-white" },
    ],
  },
  { key: "start_date",  label: "תאריך התחלה", type: "date", icon: <Calendar className="h-3.5 w-3.5" />, section: "תאריכים" },
  { key: "end_date",    label: "תאריך סיום",  type: "date", icon: <Calendar className="h-3.5 w-3.5" />, section: "תאריכים" },
  { key: "file_url",    label: "קישור קובץ",  type: "url",  icon: <LinkIcon className="h-3.5 w-3.5" />,  section: "תאריכים", copyable: true },
  { key: "id",          label: "מזהה",        type: "readonly", icon: <Hash className="h-3.5 w-3.5" />, section: "מטא-דאטה", readonly: true, copyable: true },
];

/* ─────────── component ─────────── */

export function ContractsCollection({ initialData }: { initialData: Contract[] }) {
  const data = initialData.length > 0 ? initialData : MOCK;
  const [contracts, setContracts] = React.useState<Contract[]>(data);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Contract | null>(null);
  const { success, error: toastError } = useToast();

  const stats = React.useMemo(() => {
    const total = contracts.reduce((s, c) => s + c.amount, 0);
    const active = contracts.filter((c) => c.status === "active").reduce((s, c) => s + c.amount, 0);
    return { total, active, count: contracts.length, activeCount: contracts.filter((c) => c.status === "active").length };
  }, [contracts]);

  async function handleSave(updated: Record<string, unknown>) {
    setContracts((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...(updated as Partial<Contract>) } : c))
    );
    success("נשמר בהצלחה", "פרטי החוזה עודכנו");
    setPanelOpen(false);
    setSelected(null);
  }

  const bulkActions: BulkAction[] = [
    {
      label: "מחק",
      variant: "destructive",
      onClick: (ids) => {
        setContracts((prev) => prev.filter((c) => !ids.includes(c.id)));
        success(`נמחקו ${ids.length} חוזים`);
      },
    },
  ];

  return (
    <>
      {/* Revenue summary */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {[
          { label: "סה״כ חוזים", value: formatCurrency(stats.total), sub: `${stats.count} חוזים`, color: "text-slate-800" },
          { label: "פעילים כרגע", value: formatCurrency(stats.active), sub: `${stats.activeCount} חוזים`, color: "text-green-700" },
          { label: "ממתינים לחתימה", value: String(contracts.filter((c) => c.status === "pending").length), sub: "חוזים", color: "text-amber-700" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col rounded-lg border bg-white px-4 py-3 shadow-sm min-w-[160px]">
            <span className="text-xs text-muted-foreground mb-0.5">{s.label}</span>
            <span className={`text-lg font-bold ${s.color} tabular-nums`}>{s.value}</span>
            <span className="text-xs text-muted-foreground">{s.sub}</span>
          </div>
        ))}
      </div>

      <CollectionView
        title="חוזים"
        subtitle={`${contracts.length} חוזים במסד הנתונים`}
        data={contracts as unknown as Record<string, unknown>[]}
        columns={COLUMNS as unknown as ColDef<Record<string, unknown>>[]}
        keyField="id"
        onRowClick={(row) => { setSelected(row as unknown as Contract); setPanelOpen(true); }}
        onNew={() => {
          setSelected({
            id: crypto.randomUUID(),
            title: "",
            description: "",
            client_id: null,
            amount: 0,
            currency: "ILS",
            status: "pending",
            start_date: new Date().toISOString().slice(0, 10),
            end_date: null,
            file_url: null,
            created_at: new Date().toISOString(),
          });
          setPanelOpen(true);
        }}
        newLabel="חוזה חדש"
        bulkActions={bulkActions}
        filterFields={[
          { key: "title",  label: "כותרת" },
          { key: "status", label: "סטטוס" },
          { key: "amount", label: "סכום" },
        ]}
        pageSize={10}
        emptyIcon={<FileText className="h-10 w-10 opacity-20" />}
        emptyText="לא נמצאו חוזים"
      />

      <RecordPanel
        open={panelOpen}
        onClose={() => { setPanelOpen(false); setSelected(null); }}
        title={selected?.title || "חוזה חדש"}
        subtitle={selected?.clients?.company_name ?? selected?.clients?.contact_name ?? undefined}
        record={selected as unknown as Record<string, unknown>}
        fields={PANEL_FIELDS}
        onSave={handleSave}
        onDelete={() => {
          if (selected) {
            setContracts((prev) => prev.filter((c) => c.id !== selected.id));
            success("החוזה נמחק");
            setPanelOpen(false);
          }
        }}
        activityLog={selected ? MOCK_ACTIVITY : []}
      />
    </>
  );
}
