"use client";

import * as React from "react";
import {
  CreditCard, CheckCircle2, Clock, AlertCircle,
  TrendingUp, TrendingDown, Hash, AlignLeft, DollarSign, Calendar,
} from "lucide-react";
import { CollectionView, ColDef, BulkAction } from "@/components/admin/collection-view";
import { RecordPanel, FieldDef, ActivityEntry } from "@/components/admin/record-panel";
import { useToast } from "@/components/admin/toast";

/* ─────────── types ─────────── */

export interface Payment {
  id: string;
  client_id: string | null;
  contract_id: string | null;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue" | "cancelled";
  due_date: string;
  paid_date: string | null;
  description: string | null;
  invoice_url: string | null;
  created_at: string;
  updated_at?: string;
  clients?: { contact_name: string; company_name: string | null } | null;
}

/* ─────────── helpers ─────────── */

function fmt(n: number, cur = "ILS") {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
}
function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" });
}
function daysUntil(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
}

/* ─────────── status config ─────────── */

const STATUS_CFG = {
  paid:      { label: "שולם",  dot: "bg-green-500",  text: "text-green-700",  bg: "bg-green-50 border-green-200",  icon: CheckCircle2 },
  pending:   { label: "ממתין", dot: "bg-amber-500",  text: "text-amber-700",  bg: "bg-amber-50 border-amber-200",  icon: Clock },
  overdue:   { label: "איחור", dot: "bg-red-500",    text: "text-red-700",    bg: "bg-red-50 border-red-200",      icon: AlertCircle },
  cancelled: { label: "בוטל", dot: "bg-slate-400",  text: "text-slate-500",  bg: "bg-slate-50 border-slate-200",  icon: AlertCircle },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

/* ─────────── mock data ─────────── */

const MOCK: Payment[] = [
  { id: "p1",  client_id: "1", contract_id: "c1", amount: 6000,  currency: "ILS", status: "paid",    due_date: "2024-01-31", paid_date: "2024-01-28", description: "תשלום ראשון — פיתוח אתר",     invoice_url: null, created_at: "2024-01-01T10:00:00Z", clients: { contact_name: "ישראל ישראלי", company_name: "טק סולושנס" } },
  { id: "p2",  client_id: "1", contract_id: "c1", amount: 6000,  currency: "ILS", status: "paid",    due_date: "2024-04-30", paid_date: "2024-04-29", description: "תשלום שני — פיתוח אתר",      invoice_url: null, created_at: "2024-01-01T10:00:00Z", clients: { contact_name: "ישראל ישראלי", company_name: "טק סולושנס" } },
  { id: "p3",  client_id: "1", contract_id: "c1", amount: 6000,  currency: "ILS", status: "pending", due_date: "2025-04-30", paid_date: null,         description: "תשלום שלישי — פיתוח אתר",     invoice_url: null, created_at: "2024-01-01T10:00:00Z", clients: { contact_name: "ישראל ישראלי", company_name: "טק סולושנס" } },
  { id: "p4",  client_id: "2", contract_id: "c2", amount: 2000,  currency: "ILS", status: "paid",    due_date: "2024-03-31", paid_date: "2024-03-30", description: "חודש ניהול SEO — מרץ",        invoice_url: null, created_at: "2024-03-01T09:00:00Z", clients: { contact_name: "שרה כהן",    company_name: "כהן מרקטינג" } },
  { id: "p5",  client_id: "2", contract_id: "c2", amount: 2000,  currency: "ILS", status: "overdue", due_date: "2025-01-31", paid_date: null,         description: "חודש ניהול SEO — ינואר",     invoice_url: null, created_at: "2025-01-01T09:00:00Z", clients: { contact_name: "שרה כהן",    company_name: "כהן מרקטינג" } },
  { id: "p6",  client_id: "3", contract_id: "c3", amount: 15000, currency: "ILS", status: "pending", due_date: "2025-06-30", paid_date: null,         description: "מקדמה — חנות אינטרנטית",    invoice_url: null, created_at: "2024-12-15T11:00:00Z", clients: { contact_name: "דוד לוי",    company_name: "לוי נדל״ן" } },
  { id: "p7",  client_id: "5", contract_id: "c4", amount: 4000,  currency: "ILS", status: "paid",    due_date: "2025-01-15", paid_date: "2025-01-14", description: "תשלום ליווי שיווקי Q1",      invoice_url: null, created_at: "2024-12-20T14:00:00Z", clients: { contact_name: "יוסי מנחם", company_name: "מנחם פינטק" } },
  { id: "p8",  client_id: "7", contract_id: "c6", amount: 25000, currency: "ILS", status: "paid",    due_date: "2023-09-30", paid_date: "2023-09-28", description: "תשלום ראשון — אפליקציה",     invoice_url: null, created_at: "2023-09-01T08:00:00Z", clients: { contact_name: "אבי שפירא", company_name: "שפירא לוגיסטיקס" } },
  { id: "p9",  client_id: "7", contract_id: "c6", amount: 25000, currency: "ILS", status: "paid",    due_date: "2024-03-31", paid_date: "2024-03-25", description: "תשלום שני — אפליקציה",      invoice_url: null, created_at: "2023-09-01T08:00:00Z", clients: { contact_name: "אבי שפירא", company_name: "שפירא לוגיסטיקס" } },
  { id: "p10", client_id: "7", contract_id: "c6", amount: 25000, currency: "ILS", status: "overdue", due_date: "2025-02-28", paid_date: null,         description: "תשלום שלישי — אפליקציה",    invoice_url: null, created_at: "2023-09-01T08:00:00Z", clients: { contact_name: "אבי שפירא", company_name: "שפירא לוגיסטיקס" } },
  { id: "p11", client_id: "10", contract_id: "c5", amount: 10000, currency: "ILS", status: "pending", due_date: "2025-05-01", paid_date: null,        description: "מקדמה — עיצוב מחדש",        invoice_url: null, created_at: "2025-02-10T10:00:00Z", clients: { contact_name: "גיל אורן", company_name: "אורן טכנולוגיות" } },
  { id: "p12", client_id: "11", contract_id: null, amount: 1800, currency: "ILS", status: "cancelled", due_date: "2024-11-30", paid_date: null,       description: "תחזוקה חודשית — בוטל",      invoice_url: null, created_at: "2024-11-01T10:00:00Z", clients: { contact_name: "שלי נגר", company_name: "נגר בוטיק" } },
];

const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: "a1", action: "עדכן סטטוס ל-שולם", user: "אדמין", timestamp: "לפני יומיים" },
  { id: "a2", action: "יצר חשבונית",        user: "מערכת",  timestamp: "לפני 3 ימים" },
  { id: "a3", action: "יצר רשומה",          user: "מערכת",  timestamp: "1 ינואר 2024" },
];

/* ─────────── columns ─────────── */

const COLUMNS: ColDef<Payment>[] = [
  {
    key: "clients",
    title: "לקוח",
    sortable: false,
    render: (_, row) => {
      const c = row.clients;
      return c ? (
        <div>
          <p className="text-sm font-medium text-slate-800">{c.contact_name}</p>
          {c.company_name && <p className="text-xs text-muted-foreground">{c.company_name}</p>}
        </div>
      ) : <span className="text-xs text-muted-foreground">—</span>;
    },
  },
  {
    key: "description",
    title: "תיאור",
    sortable: false,
    render: (value) => (
      <span className="text-sm text-slate-600 truncate max-w-[200px] block">
        {String(value ?? "—")}
      </span>
    ),
  },
  {
    key: "amount",
    title: "סכום",
    sortable: true,
    render: (value, row) => (
      <span className={`text-sm font-bold tabular-nums ${row.status === "overdue" ? "text-red-600" : row.status === "paid" ? "text-green-700" : "text-slate-800"}`}>
        {fmt(Number(value), row.currency)}
      </span>
    ),
  },
  {
    key: "due_date",
    title: "תאריך יעד",
    sortable: true,
    render: (value, row) => {
      const d = daysUntil(String(value));
      const isPast = d < 0 && row.status !== "paid";
      return (
        <div>
          <span className="text-xs text-muted-foreground">{fmtDate(String(value))}</span>
          {isPast && row.status === "overdue" && (
            <p className="text-[10px] text-red-500 font-medium">באיחור של {Math.abs(d)} ימים</p>
          )}
          {!isPast && row.status === "pending" && d <= 7 && (
            <p className="text-[10px] text-amber-500 font-medium">עוד {d} ימים</p>
          )}
        </div>
      );
    },
  },
  {
    key: "status",
    title: "סטטוס",
    sortable: true,
    render: (value) => <StatusBadge status={String(value)} />,
  },
];

/* ─────────── panel fields ─────────── */

const PANEL_FIELDS: FieldDef[] = [
  { key: "description", label: "תיאור",       type: "textarea", icon: <AlignLeft className="h-3.5 w-3.5" />,   section: "פרטי תשלום" },
  { key: "amount",      label: "סכום ₪",       type: "number",   icon: <DollarSign className="h-3.5 w-3.5" />,  section: "פרטי תשלום" },
  {
    key: "status",
    label: "סטטוס",
    type: "badge",
    section: "פרטי תשלום",
    options: [
      { value: "paid",      label: "שולם",  color: "bg-green-600 text-white" },
      { value: "pending",   label: "ממתין", color: "bg-amber-500 text-white" },
      { value: "overdue",   label: "איחור", color: "bg-red-600 text-white" },
      { value: "cancelled", label: "בוטל", color: "bg-slate-500 text-white" },
    ],
  },
  { key: "due_date",  label: "תאריך יעד",   type: "date",     icon: <Calendar className="h-3.5 w-3.5" />,   section: "תאריכים" },
  { key: "paid_date", label: "תאריך תשלום", type: "date",     icon: <Calendar className="h-3.5 w-3.5" />,   section: "תאריכים" },
  { key: "id",        label: "מזהה",         type: "readonly", icon: <Hash className="h-3.5 w-3.5" />,       section: "מטא-דאטה", readonly: true, copyable: true },
];

/* ─────────── revenue bar ─────────── */

function RevenueBar({ paid, pending, overdue }: { paid: number; pending: number; overdue: number }) {
  const total = paid + pending + overdue;
  if (total === 0) return null;
  const paidPct  = (paid / total) * 100;
  const pendPct  = (pending / total) * 100;
  const overPct  = (overdue / total) * 100;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="bg-green-500 transition-all" style={{ width: `${paidPct}%` }} />
      <div className="bg-amber-400 transition-all" style={{ width: `${pendPct}%` }} />
      <div className="bg-red-500 transition-all"   style={{ width: `${overPct}%` }} />
    </div>
  );
}

/* ─────────── component ─────────── */

export function PaymentsCollection({ initialData }: { initialData: Payment[] }) {
  const data = initialData.length > 0 ? initialData : MOCK;
  const [payments, setPayments] = React.useState<Payment[]>(data);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Payment | null>(null);
  const { success } = useToast();

  const stats = React.useMemo(() => {
    const paid    = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
    const pending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
    const overdue = payments.filter((p) => p.status === "overdue").reduce((s, p) => s + p.amount, 0);
    return { paid, pending, overdue, total: paid + pending + overdue };
  }, [payments]);

  async function handleSave(updated: Record<string, unknown>) {
    setPayments((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...(updated as Partial<Payment>) } : p))
    );
    success("נשמר בהצלחה");
    setPanelOpen(false);
    setSelected(null);
  }

  const bulkActions: BulkAction[] = [
    {
      label: "סמן כשולם",
      onClick: (ids) => {
        setPayments((prev) =>
          prev.map((p) => ids.includes(p.id) ? { ...p, status: "paid" as const, paid_date: new Date().toISOString().slice(0, 10) } : p)
        );
        success(`${ids.length} תשלומים סומנו כשולמו`);
      },
    },
    {
      label: "מחק",
      variant: "destructive",
      onClick: (ids) => {
        setPayments((prev) => prev.filter((p) => !ids.includes(p.id)));
        success(`נמחקו ${ids.length} תשלומים`);
      },
    },
  ];

  return (
    <>
      {/* Revenue summary cards */}
      <div className="grid gap-3 sm:grid-cols-3 mb-5">
        {[
          { label: "התקבל",  value: stats.paid,    icon: CheckCircle2, iconColor: "text-green-600", bg: "bg-green-50", text: "text-green-700", trend: "+12%" },
          { label: "ממתין",  value: stats.pending, icon: Clock,        iconColor: "text-amber-600", bg: "bg-amber-50", text: "text-amber-700", trend: null },
          { label: "באיחור", value: stats.overdue, icon: AlertCircle,  iconColor: "text-red-600",   bg: "bg-red-50",   text: "text-red-700",   trend: null },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className={`rounded-lg p-2 ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.iconColor}`} />
                </div>
                {s.trend && (
                  <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    {s.trend}
                  </span>
                )}
              </div>
              <p className={`text-xl font-bold tabular-nums ${s.text}`}>{fmt(s.value)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue bar */}
      <div className="rounded-xl border bg-white p-4 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">התפלגות הכנסות</p>
          <span className="text-xs text-muted-foreground">{fmt(stats.total)} סה״כ</span>
        </div>
        <RevenueBar paid={stats.paid} pending={stats.pending} overdue={stats.overdue} />
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> שולם</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> ממתין</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"   /> באיחור</span>
        </div>
      </div>

      <CollectionView
        title="תשלומים"
        subtitle={`${payments.length} תשלומים במסד הנתונים`}
        data={payments as unknown as Record<string, unknown>[]}
        columns={COLUMNS as unknown as ColDef<Record<string, unknown>>[]}
        keyField="id"
        onRowClick={(row) => { setSelected(row as unknown as Payment); setPanelOpen(true); }}
        onNew={() => {
          setSelected({
            id: crypto.randomUUID(),
            client_id: null,
            contract_id: null,
            amount: 0,
            currency: "ILS",
            status: "pending",
            due_date: new Date().toISOString().slice(0, 10),
            paid_date: null,
            description: "",
            invoice_url: null,
            created_at: new Date().toISOString(),
          });
          setPanelOpen(true);
        }}
        newLabel="תשלום חדש"
        bulkActions={bulkActions}
        filterFields={[
          { key: "status",  label: "סטטוס" },
          { key: "due_date", label: "תאריך יעד" },
        ]}
        pageSize={10}
        emptyIcon={<CreditCard className="h-10 w-10 opacity-20" />}
        emptyText="לא נמצאו תשלומים"
      />

      <RecordPanel
        open={panelOpen}
        onClose={() => { setPanelOpen(false); setSelected(null); }}
        title={selected?.description ?? "תשלום"}
        subtitle={selected?.clients?.contact_name ?? undefined}
        record={selected as unknown as Record<string, unknown>}
        fields={PANEL_FIELDS}
        onSave={handleSave}
        onDelete={() => {
          if (selected) {
            setPayments((prev) => prev.filter((p) => p.id !== selected.id));
            success("התשלום נמחק");
            setPanelOpen(false);
          }
        }}
        activityLog={selected ? MOCK_ACTIVITY : []}
      />
    </>
  );
}
