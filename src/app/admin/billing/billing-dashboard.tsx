"use client";

import * as React from "react";
import {
  CreditCard, TrendingUp, TrendingDown, AlertCircle, CheckCircle2,
  Clock, Plus, Download, Filter, ChevronDown, X, Loader2,
  BarChart3, Calendar, Building,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";

/* ─── types ─── */
interface Payment {
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
  clients?: { contact_name: string; company_name: string | null } | null;
}
interface Client { id: string; contact_name: string; company_name: string | null; status: string }
interface Contract { id: string; title: string; client_id: string; amount: number; currency: string; status: string; start_date: string; end_date: string | null; clients?: { contact_name: string; company_name: string | null } | null }

/* ─── helpers ─── */
const fmt = (n: number, cur = "ILS") =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS_CFG = {
  paid:      { label: "שולם",  dot: "bg-green-500",  text: "text-green-700",  bg: "bg-green-50 border-green-200",   icon: CheckCircle2 },
  pending:   { label: "ממתין", dot: "bg-amber-500",  text: "text-amber-700",  bg: "bg-amber-50 border-amber-200",   icon: Clock },
  overdue:   { label: "איחור", dot: "bg-red-500",    text: "text-red-700",    bg: "bg-red-50 border-red-200",       icon: AlertCircle },
  cancelled: { label: "בוטל",  dot: "bg-slate-400",  text: "text-slate-500",  bg: "bg-slate-50 border-slate-200",   icon: X },
};

/* ─── new payment modal ─── */
interface NewPaymentModalProps { clients: Client[]; contracts: Contract[]; onClose: () => void; onSave: (p: Payment) => void }

function NewPaymentModal({ clients, contracts, onClose, onSave }: NewPaymentModalProps) {
  const [clientId, setClientId] = React.useState("");
  const [contractId, setContractId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState(new Date().toISOString().slice(0,10));
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const clientContracts = contracts.filter(c => c.client_id === clientId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !amount) { setErr("לקוח וסכום הם שדות חובה"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_id: clientId, contract_id: contractId || null, amount: Number(amount), description, due_date: dueDate }) });
    if (!res.ok) { setErr((await res.json()).error ?? "שגיאה"); setSaving(false); return; }
    onSave(await res.json());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> תשלום חדש</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-slate-400 hover:text-slate-600" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {err && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{err}</p>}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">לקוח *</label>
            <select value={clientId} onChange={e => { setClientId(e.target.value); setContractId(""); }} className="w-full rounded-lg border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" required>
              <option value="">בחר לקוח...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.contact_name}{c.company_name ? ` — ${c.company_name}` : ""}</option>)}
            </select>
          </div>
          {clientContracts.length > 0 && (
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">חוזה (אופציונלי)</label>
              <select value={contractId} onChange={e => { setContractId(e.target.value); if (e.target.value) setAmount(String(contracts.find(c=>c.id===e.target.value)?.amount ?? "")); }} className="w-full rounded-lg border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">ללא חוזה</option>
                {clientContracts.map(c => <option key={c.id} value={c.id}>{c.title} — {fmt(c.amount)}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">סכום (₪) *</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" min="0" required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">תאריך פירעון</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">תיאור</label>
            <input value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="תיאור קצר..." />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1 gap-2">
              {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />שומר...</> : "צור תשלום"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>ביטול</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── main component ─── */
interface Props { initialPayments: Payment[]; clients: Client[]; contracts: Contract[] }

export function BillingDashboard({ initialPayments, clients, contracts }: Props) {
  const [payments, setPayments] = React.useState<Payment[]>(initialPayments);
  const [filter, setFilter] = React.useState<"all" | "paid" | "pending" | "overdue">("all");
  const [showNew, setShowNew] = React.useState(false);
  const [markingId, setMarkingId] = React.useState<string | null>(null);
  const { success } = useToast();

  /* revenue stats */
  const totalPaid    = payments.filter(p => p.status === "paid").reduce((s,p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((s,p) => s + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === "overdue").reduce((s,p) => s + p.amount, 0);

  /* monthly breakdown — last 6 months */
  const monthlyData = React.useMemo(() => {
    const map: Record<string, number> = {};
    payments.filter(p => p.status === "paid" && p.paid_date).forEach(p => {
      const m = p.paid_date!.slice(0, 7);
      map[m] = (map[m] ?? 0) + p.amount;
    });
    const months: { label: string; key: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      months.push({ key, label: d.toLocaleDateString("he-IL", { month: "short", year: "2-digit" }), amount: map[key] ?? 0 });
    }
    return months;
  }, [payments]);

  const maxMonth = Math.max(...monthlyData.map(m => m.amount), 1);

  const filtered = filter === "all" ? payments : payments.filter(p => p.status === filter);

  async function markPaid(payment: Payment) {
    const paidDate = new Date().toISOString().slice(0, 10);
    setMarkingId(payment.id);
    setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: "paid", paid_date: paidDate } : p));
    await fetch(`/api/admin/payments/${payment.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "paid", paid_date: paidDate }) });
    setMarkingId(null);
    success("תשלום סומן כשולם");
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            חיוב והכנסות
          </h2>
          <p className="text-sm text-muted-foreground">ניהול תשלומים, חשבוניות וסטטוס פיננסי</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            ייצא CSV
          </Button>
          <Button className="gap-2" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" />
            תשלום חדש
          </Button>
        </div>
      </div>

      {/* Revenue cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "הכנסות שהתקבלו", value: totalPaid,    icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", trend: null },
          { label: "ממתין לתשלום",   value: totalPending, icon: Clock,         color: "text-amber-600", bg: "bg-amber-50",  trend: null },
          { label: "פגות תוקף",      value: totalOverdue, icon: AlertCircle,  color: "text-red-600",   bg: "bg-red-50",    trend: "urgent" },
        ].map(({ label, value, icon: Icon, color, bg, trend }) => (
          <Card key={label} className={cn(trend === "urgent" && value > 0 && "border-red-300 shadow-red-100 shadow-md")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("rounded-xl p-2.5", bg)}>
                  <Icon className={cn("h-5 w-5", color)} />
                </div>
                {trend === "urgent" && value > 0 && (
                  <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">דחוף</span>
                )}
              </div>
              <p className={cn("text-2xl font-bold tabular-nums", color)}>{fmt(value)}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly chart */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">הכנסות חודשיות</h3>
          </div>
          <div className="flex items-end gap-3 h-28">
            {monthlyData.map((m) => (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground tabular-nums">{m.amount > 0 ? fmt(m.amount) : ""}</span>
                <div
                  className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors"
                  style={{ height: `${Math.max((m.amount / maxMonth) * 80, m.amount > 0 ? 4 : 0)}px` }}
                />
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payments list */}
      <Card>
        <CardContent className="p-0">
          {/* Filter bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {(["all","paid","pending","overdue"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-3 py-0.5 text-xs font-medium transition-colors",
                  filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-white text-slate-600 hover:bg-accent"
                )}
              >
                {{ all: "הכל", paid: "שולמו", pending: "ממתינים", overdue: "באיחור" }[f]}
                {" "}
                <span className="opacity-70">({(f === "all" ? payments : payments.filter(p => p.status === f)).length})</span>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-14 text-center text-sm text-muted-foreground">
              <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-20" />
              לא נמצאו תשלומים
            </div>
          )}

          <div className="divide-y">
            {filtered.map((payment) => {
              const cfg = STATUS_CFG[payment.status] ?? STATUS_CFG.pending;
              const StatusIcon = cfg.icon;
              const isLate = payment.status === "overdue";
              return (
                <div key={payment.id} className={cn("flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors", isLate && "bg-red-50/40")}>
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", cfg.bg.split(" ")[0])}>
                    <StatusIcon className={cn("h-4 w-4", cfg.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {payment.description ?? "תשלום"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {payment.clients && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building className="h-2.5 w-2.5" />
                          {payment.clients.contact_name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        {fmtDate(payment.due_date)}
                      </span>
                    </div>
                  </div>
                  <span className={cn("text-sm font-bold tabular-nums", cfg.text)}>{fmt(payment.amount, payment.currency)}</span>
                  <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", cfg.bg, cfg.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                    {cfg.label}
                  </span>
                  {(payment.status === "pending" || payment.status === "overdue") && (
                    <button
                      onClick={() => markPaid(payment)}
                      disabled={markingId === payment.id}
                      className="flex items-center gap-1 rounded-lg border border-green-300 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      {markingId === payment.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                      שולם
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active contracts summary */}
      {contracts.filter(c => c.status === "active").length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">חוזים פעילים</h3>
            </div>
            <div className="divide-y">
              {contracts.filter(c => c.status === "active").map(contract => (
                <div key={contract.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{contract.title}</p>
                    <p className="text-xs text-muted-foreground">{contract.clients?.contact_name} · עד {fmtDate(contract.end_date)}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-700 tabular-nums">{fmt(contract.amount, contract.currency)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showNew && (
        <NewPaymentModal
          clients={clients}
          contracts={contracts}
          onClose={() => setShowNew(false)}
          onSave={(p) => { setPayments(prev => [p, ...prev]); success("תשלום חדש נוסף"); }}
        />
      )}
    </div>
  );
}
