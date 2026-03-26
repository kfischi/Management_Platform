"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Phone, Mail, CheckCircle2, Clock, AlertCircle, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── types ─── */
interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  reply: string | null;
  replied_at: string | null;
  created_at: string;
}

/* ─── helpers ─── */
const STATUS_CFG = {
  open:        { label: "פתוח",   icon: AlertCircle,  color: "text-blue-600",  bg: "bg-blue-50 border-blue-200"   },
  in_progress: { label: "בטיפול", icon: Clock,        color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  resolved:    { label: "נפתר ✓", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200" },
  closed:      { label: "סגור",   icon: X,            color: "text-slate-500", bg: "bg-slate-50 border-slate-200" },
};

const PRIORITY_LABELS: Record<string, string> = { low: "נמוכה", normal: "רגיל", high: "גבוהה", urgent: "דחוף" };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── component ─── */
export function SupportDashboard({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = React.useState<Ticket[]>(initialTickets);
  const [showNew, setShowNew] = React.useState(false);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [priority, setPriority] = React.useState("normal");
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  async function submitTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) { setErr("נושא ותוכן הם שדות חובה"); return; }
    setSaving(true);
    setErr(null);
    const res = await fetch("/api/client/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, message, priority }) });
    if (!res.ok) { setErr((await res.json()).error ?? "שגיאה"); setSaving(false); return; }
    const created = await res.json();
    setTickets(prev => [created, ...prev]);
    setSubject(""); setMessage(""); setPriority("normal");
    setShowNew(false);
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-2xl" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">תמיכה</h2>
          <p className="text-muted-foreground text-sm">WMA Agency כאן לעזור לך</p>
        </div>
        <Button className="gap-2" onClick={() => setShowNew(v => !v)}>
          <Plus className="h-4 w-4" />
          פנייה חדשה
        </Button>
      </div>

      {/* Quick contact */}
      <div className="grid gap-3 sm:grid-cols-3">
        <a href="https://wa.me/972501234567" target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-center hover:shadow-md hover:border-green-400 transition-all">
          <span className="text-2xl">💬</span>
          <p className="font-semibold text-sm text-green-800">WhatsApp</p>
          <p className="text-xs text-green-700">מענה מהיר תוך דקות</p>
          <span className="mt-1 text-[10px] font-medium bg-green-600 text-white rounded-full px-2 py-0.5">פעיל עכשיו</span>
        </a>
        <a href="mailto:support@wma.co.il"
          className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center hover:shadow-md transition-all bg-white">
          <Mail className="h-6 w-6 text-blue-500" />
          <p className="font-semibold text-sm">אימייל</p>
          <p className="text-xs text-muted-foreground">מענה תוך 24 שעות</p>
        </a>
        <a href="tel:+972501234567"
          className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center hover:shadow-md transition-all bg-white">
          <Phone className="h-6 w-6 text-indigo-500" />
          <p className="font-semibold text-sm">טלפון</p>
          <p className="text-xs text-muted-foreground">א׳–ה׳, 09:00–18:00</p>
        </a>
      </div>

      {/* New ticket form */}
      {showNew && (
        <Card className="border-primary/30 shadow-md">
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              פנייה חדשה
            </h3>
            <form onSubmit={submitTicket} className="space-y-3">
              {err && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{err}</p>}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">נושא *</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="תאר בקצרה את הבקשה שלך" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">פרטים *</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="תאר את הבקשה בפירוט..." required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">עדיפות</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="rounded-lg border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />שולח...</> : "שלח פנייה"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowNew(false)}>ביטול</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tickets list */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">הפניות שלך ({tickets.length})</h3>
        {tickets.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground text-sm">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
            אין פניות קיימות
          </div>
        )}
        <div className="space-y-2">
          {tickets.map(ticket => {
            const cfg = STATUS_CFG[ticket.status] ?? STATUS_CFG.open;
            const StatusIcon = cfg.icon;
            const isOpen = expanded === ticket.id;
            return (
              <div key={ticket.id} className="rounded-xl border bg-white overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-accent/30 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : ticket.id)}
                >
                  <StatusIcon className={cn("h-4 w-4 shrink-0", cfg.color)} />
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-medium truncate">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(ticket.created_at)} · עדיפות: {PRIORITY_LABELS[ticket.priority]}</p>
                  </div>
                  <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0", cfg.bg, cfg.color)}>{cfg.label}</span>
                  {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t px-4 py-3 space-y-3 bg-slate-50/50">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">הפנייה שלך:</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.message}</p>
                    </div>
                    {ticket.reply && (
                      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                        <p className="text-xs font-medium text-indigo-700 mb-1">תשובת הצוות ({ticket.replied_at ? fmtDate(ticket.replied_at) : ""}):</p>
                        <p className="text-sm text-indigo-900 whitespace-pre-wrap">{ticket.reply}</p>
                      </div>
                    )}
                    {!ticket.reply && ticket.status !== "resolved" && (
                      <p className="text-xs text-muted-foreground italic">ממתין לטיפול...</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
