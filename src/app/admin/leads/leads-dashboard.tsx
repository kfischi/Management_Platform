"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target, Plus, TrendingUp, Brain, Mail, MessageSquare,
  Phone, Star, ArrowRight, X, Loader2,
} from "lucide-react";

/* ─── types ─── */

type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";

interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  source: string;
  status: LeadStatus;
  score: number;
  value: number;
  notes: string | null;
  tags: string[];
  ai_insight: string | null;
  created_at: string;
}

/* ─── constants ─── */

const COLUMNS: { status: LeadStatus; label: string; color: string; bg: string; border: string }[] = [
  { status: "new",       label: "חדש",       color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200"   },
  { status: "contacted", label: "פנינו",     color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  { status: "qualified", label: "מוכשר",     color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  { status: "proposal",  label: "הצעה",      color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
  { status: "won",       label: "נסגר ✓",   color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200"  },
  { status: "lost",      label: "ירד",       color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200"    },
];

const SOURCES = ["manual", "WhatsApp", "טופס אתר", "LinkedIn", "Facebook", "Instagram", "הפניה", "eMail"];

/* ─── helpers ─── */

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-1">
      <div className={`h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="text-xs font-medium tabular-nums">{score}</span>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}

/* ─── new-lead modal ─── */

interface NewLeadModalProps {
  defaultStatus: LeadStatus;
  onClose: () => void;
  onSave: (lead: Lead) => void;
}

function NewLeadModal({ defaultStatus, onClose, onSave }: NewLeadModalProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [source, setSource] = React.useState("manual");
  const [status, setStatus] = React.useState<LeadStatus>(defaultStatus);
  const [value, setValue] = React.useState("");
  const [score, setScore] = React.useState("50");
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setErr("שם ואימייל הם שדות חובה"); return; }
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company: company || null, phone: phone || null, source, status, value: Number(value) || 0, score: Number(score) || 50 }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "שגיאה"); }
      const created = await res.json();
      onSave(created);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "שגיאה");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold">ליד חדש</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {err && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{err}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">שם *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="שם מלא" required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">אימייל *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="email@example.com" required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">חברה</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="שם החברה" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">טלפון</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="05X-XXXXXXX" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">מקור</label>
              <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">סטטוס</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                {COLUMNS.map((c) => <option key={c.status} value={c.status}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">ערך עסקה (₪)</label>
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" min="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">ציון (0–100)</label>
              <input type="number" value={score} onChange={(e) => setScore(e.target.value)} className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" min="0" max="100" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1 gap-2">
              {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> שומר...</> : "צור ליד"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>ביטול</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── main component ─── */

export function LeadsDashboard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = React.useState<Lead[]>(initialLeads);
  const [view, setView] = React.useState<"kanban" | "list">("kanban");
  const [newModal, setNewModal] = React.useState<LeadStatus | null>(null);
  const [movingId, setMovingId] = React.useState<string | null>(null);

  const totalValue = leads.filter(l => l.status === "won").reduce((s, l) => s + l.value, 0);
  const pipelineValue = leads.filter(l => !["won","lost"].includes(l.status)).reduce((s, l) => s + l.value, 0);
  const closeRate = leads.length > 0 ? Math.round((leads.filter(l => l.status === "won").length / leads.length) * 100) : 0;

  async function moveStatus(lead: Lead, newStatus: LeadStatus) {
    if (lead.status === newStatus) return;
    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: newStatus } : l));
    setMovingId(lead.id);
    await fetch(`/api/admin/leads/${lead.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    setMovingId(null);
  }

  async function deleteLead(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
  }

  const hotLead = leads.filter(l => !["won","lost"].includes(l.status)).sort((a,b) => b.score - a.score)[0];

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            ניהול לידים
          </h2>
          <p className="text-muted-foreground text-sm">
            {leads.length} לידים · Pipeline: ₪{pipelineValue.toLocaleString()} · נסגר: ₪{totalValue.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            <button
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "kanban" ? "bg-primary text-primary-foreground" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              onClick={() => setView("kanban")}
            >📋 Kanban</button>
            <button
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              onClick={() => setView("list")}
            >📄 רשימה</button>
          </div>
          <Button className="gap-2" onClick={() => setNewModal("new")}>
            <Plus className="h-4 w-4" />
            ליד חדש
          </Button>
        </div>
      </div>

      {/* AI insight banner */}
      {hotLead && (
        <div className="flex items-start gap-3 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 shrink-0">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-purple-900">AI Lead Intelligence</p>
            <p className="text-xs text-purple-700 mt-0.5">
              {hotLead.name} ({hotLead.score}%) הוא הליד החם ביותר ·{" "}
              הכנסות צפויות: ₪{(pipelineValue * (closeRate / 100)).toLocaleString()} ({closeRate}% win rate)
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "סה״כ לידים", value: leads.length, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "בפייפליין",  value: leads.filter(l => !["won","lost"].includes(l.status)).length, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "נסגרו",      value: leads.filter(l => l.status === "won").length, icon: Star, color: "text-green-600", bg: "bg-green-50" },
          { label: "אחוז סגירה", value: `${closeRate}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className={`inline-flex items-center justify-center rounded-lg p-2 ${s.bg} mb-2`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban */}
      {view === "kanban" && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colLeads = leads.filter(l => l.status === col.status);
            return (
              <div key={col.status} className="shrink-0 w-60">
                <div className={`flex items-center justify-between mb-2 px-3 py-2 rounded-xl border ${col.bg} ${col.border}`}>
                  <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                  <Badge variant="secondary" className="text-xs h-5 tabular-nums">{colLeads.length}</Badge>
                </div>
                <div className="space-y-2">
                  {colLeads.map((lead) => (
                    <Card key={lead.id} className={`transition-all ${movingId === lead.id ? "opacity-50" : "hover:shadow-md"}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-sm leading-tight">{lead.name}</p>
                          <ScoreBadge score={lead.score} />
                        </div>
                        {lead.company && <p className="text-xs text-muted-foreground mb-1">{lead.company}</p>}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-green-600">₪{lead.value.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">{lead.source}</span>
                        </div>
                        {lead.ai_insight && (
                          <div className="p-1.5 rounded-lg bg-purple-50 border border-purple-100 mb-2">
                            <p className="text-xs text-purple-700">🤖 {lead.ai_insight}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-1 border-t pt-2">
                          <a href={`mailto:${lead.email}`} className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent transition-colors" title="Email">
                            <Mail className="h-3 w-3 text-slate-500" />
                          </a>
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent transition-colors" title="שיחה">
                              <Phone className="h-3 w-3 text-slate-500" />
                            </a>
                          )}
                          <a href={`https://wa.me/${lead.phone?.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent transition-colors" title="WhatsApp">
                            <MessageSquare className="h-3 w-3 text-slate-500" />
                          </a>
                          {/* Advance status */}
                          {col.status !== "won" && col.status !== "lost" && (
                            <button
                              className="mr-auto flex h-6 items-center gap-0.5 rounded px-1.5 text-xs text-slate-500 hover:bg-accent hover:text-slate-800 transition-colors"
                              onClick={() => {
                                const next = COLUMNS[COLUMNS.findIndex(c => c.status === col.status) + 1];
                                if (next) moveStatus(lead, next.status);
                              }}
                              title="קדם שלב"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <button
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-muted-foreground/20 py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                    onClick={() => setNewModal(col.status)}
                  >
                    <Plus className="h-3 w-3" />
                    הוסף ליד
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {leads.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  לא נמצאו לידים
                </div>
              )}
              {leads.map((lead) => {
                const col = COLUMNS.find(c => c.status === lead.status)!;
                return (
                  <div key={lead.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{lead.name}</p>
                        {lead.company && <span className="text-xs text-muted-foreground">· {lead.company}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                    </div>
                    <ScoreBadge score={lead.score} />
                    <span className="text-sm font-semibold tabular-nums w-20 text-right">₪{lead.value.toLocaleString()}</span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${col.bg} ${col.border} ${col.color}`}>{col.label}</span>
                    <span className="text-xs text-muted-foreground w-16 text-right">{fmtDate(lead.created_at)}</span>
                    <div className="flex gap-1">
                      {lead.status !== "won" && lead.status !== "lost" && (
                        <button
                          className="flex h-7 items-center gap-1 rounded-lg border px-2 text-xs text-slate-600 hover:bg-accent transition-colors"
                          onClick={() => {
                            const next = COLUMNS[COLUMNS.findIndex(c => c.status === lead.status) + 1];
                            if (next) moveStatus(lead, next.status);
                          }}
                        >
                          קדם <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded-lg border text-xs text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => deleteLead(lead.id)}
                        title="מחק"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New lead modal */}
      {newModal && (
        <NewLeadModal
          defaultStatus={newModal}
          onClose={() => setNewModal(null)}
          onSave={(lead) => setLeads((prev) => [lead, ...prev])}
        />
      )}
    </div>
  );
}
