"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus, Mail, Users, Play, Pause, Trash2, ChevronRight,
  Loader2, RefreshCw, Send, Clock, CheckCircle2, X, GripVertical,
  Sparkles, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── types ─── */
type Sequence = {
  id: string;
  name: string;
  description: string | null;
  trigger: string;
  is_active: boolean;
  created_at: string;
  email_sequence_steps: { count: number }[];
  stats?: { total: number; active: number; completed: number };
};
type Step = {
  id?: string;
  step_number: number;
  delay_days: number;
  subject: string;
  body_html: string;
  from_name: string | null;
  from_email: string | null;
};

const TRIGGER_LABELS: Record<string, string> = {
  manual: "ידני",
  new_lead: "ליד חדש",
  tag_added: "תג נוסף",
  form_submit: "טופס נשלח",
  site_visit: "ביקור באתר",
};

/* ─── step editor ─── */
function StepEditor({
  step,
  index,
  onChange,
  onDelete,
  onGenerateAI,
  generating,
}: {
  step: Step;
  index: number;
  onChange: (s: Step) => void;
  onDelete: () => void;
  onGenerateAI: (stepIndex: number) => void;
  generating: boolean;
}) {
  return (
    <div className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <GripVertical className="h-4 w-4 text-slate-300" />
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
          {index + 1}
        </div>
        <div className="flex-1 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-sm text-slate-500">שליחה אחרי</span>
          <input
            type="number"
            min={0}
            value={step.delay_days}
            onChange={e => onChange({ ...step, delay_days: parseInt(e.target.value) || 0 })}
            className="w-14 border border-slate-200 rounded px-2 py-1 text-sm text-center"
          />
          <span className="text-sm text-slate-500">ימים</span>
        </div>
        <button
          onClick={() => onGenerateAI(index)}
          disabled={generating}
          className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 border border-purple-200 rounded px-2 py-1 hover:bg-purple-50 transition-colors"
        >
          {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          AI
        </button>
        <button onClick={onDelete} className="text-red-400 hover:text-red-600 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 mr-10">
        <input
          value={step.subject}
          onChange={e => onChange({ ...step, subject: e.target.value })}
          placeholder="נושא האימייל..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <textarea
          value={step.body_html}
          onChange={e => onChange({ ...step, body_html: e.target.value })}
          placeholder="תוכן האימייל (HTML נתמך)... שימוש ב-{{name}} לשם הנמען"
          rows={4}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y"
        />
        <div className="flex gap-2">
          <input
            value={step.from_name ?? ""}
            onChange={e => onChange({ ...step, from_name: e.target.value || null })}
            placeholder="שם השולח (אופציונלי)"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <input
            value={step.from_email ?? ""}
            onChange={e => onChange({ ...step, from_email: e.target.value || null })}
            placeholder="אימייל שולח (אופציונלי)"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ltr"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── create/edit sequence modal ─── */
function SequenceModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Sequence | null;
  onSave: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [trigger, setTrigger] = useState(initial?.trigger ?? "manual");
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState<number | null>(null);
  const [aiContext, setAiContext] = useState("");

  useEffect(() => {
    if (initial?.id) {
      setLoading(true);
      fetch(`/api/admin/email-sequences/${initial.id}/steps`)
        .then(r => r.json())
        .then(data => setSteps(data))
        .finally(() => setLoading(false));
    }
  }, [initial]);

  const addStep = () => {
    const next = steps.length + 1;
    setSteps(prev => [
      ...prev,
      { step_number: next, delay_days: next === 1 ? 0 : 1, subject: "", body_html: "", from_name: null, from_email: null },
    ]);
  };

  const generateStepAI = async (idx: number) => {
    if (!aiContext.trim()) {
      alert("הזן תיאור עסקי כדי לייצר תוכן עם AI");
      return;
    }
    setGenerating(idx);
    try {
      const res = await fetch("/api/admin/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "email_step", context: aiContext, step_number: idx + 1 }),
      });
      const data = await res.json() as { content?: { subject: string; body_html: string } };
      if (data.content?.subject) {
        setSteps(prev =>
          prev.map((s, i) =>
            i === idx
              ? { ...s, subject: data.content!.subject, body_html: data.content!.body_html }
              : s
          )
        );
      }
    } catch { /* ignore */ } finally {
      setGenerating(null);
    }
  };

  const save = async () => {
    if (!name.trim()) { alert("שם הסדרה חובה"); return; }
    setSaving(true);
    try {
      let seqId = initial?.id;

      if (seqId) {
        await fetch(`/api/admin/email-sequences/${seqId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, trigger }),
        });
      } else {
        const res = await fetch("/api/admin/email-sequences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, trigger }),
        });
        const data = await res.json() as { id: string };
        seqId = data.id;
      }

      // Save steps
      await fetch(`/api/admin/email-sequences/${seqId}/steps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(steps.map((s, i) => ({ ...s, step_number: i + 1 }))),
      });

      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-slate-50 shadow-2xl my-8"
        dir="rtl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white rounded-t-2xl">
          <h2 className="font-bold text-slate-800 text-lg">
            {initial ? "עריכת סדרת אימיילים" : "סדרת אימיילים חדשה"}
          </h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Basic info */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="שם הסדרה (למשל: ניורטורינג ליידים חדשים)"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="תיאור קצר (אופציונלי)"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <div className="flex gap-2 flex-wrap">
              {Object.entries(TRIGGER_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setTrigger(val)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    trigger === val
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Context */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">יצירת תוכן עם AI</span>
            </div>
            <textarea
              value={aiContext}
              onChange={e => setAiContext(e.target.value)}
              placeholder="תאר את העסק בקצרה... (לדוגמה: 'עורך דין משפחה בתל אביב, מתמחה בגירושין')"
              rows={2}
              className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700 text-sm">שלבי הסדרה ({steps.length})</h3>
              <Button size="sm" variant="outline" onClick={addStep} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> הוסף שלב
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-400 mx-auto" /></div>
            ) : steps.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                לחץ "הוסף שלב" כדי לבנות את הסדרה
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="flex-1">
                      <StepEditor
                        step={step}
                        index={i}
                        onChange={s => setSteps(prev => prev.map((x, xi) => xi === i ? s : x))}
                        onDelete={() => setSteps(prev => prev.filter((_, xi) => xi !== i))}
                        onGenerateAI={generateStepAI}
                        generating={generating === i}
                      />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="flex flex-col items-center mt-6">
                        <ArrowRight className="h-4 w-4 text-slate-300 rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-slate-200 bg-white rounded-b-2xl">
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={save} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            שמור סדרה
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── main dashboard ─── */
export default function EmailSequencesDashboard() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Sequence | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-sequences");
      const data = await res.json() as Sequence[];
      setSequences(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (seq: Sequence) => {
    await fetch(`/api/admin/email-sequences/${seq.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !seq.is_active }),
    });
    load();
  };

  const deleteSequence = async (id: string) => {
    if (!confirm("למחוק את הסדרה? לא ניתן לשחזר.")) return;
    await fetch(`/api/admin/email-sequences/${id}`, { method: "DELETE" });
    load();
  };

  const runProcessor = async () => {
    setProcessing(true);
    setProcessResult(null);
    try {
      const res = await fetch("/api/admin/email-sequences/processor", { method: "POST" });
      const data = await res.json() as { sent?: number; processed?: number; message?: string };
      setProcessResult(`נשלחו ${data.sent ?? 0} אימיילים מתוך ${data.processed ?? 0} ממתינים`);
    } catch {
      setProcessResult("שגיאה בעיבוד");
    } finally {
      setProcessing(false);
    }
  };

  const totalEnrolled = sequences.reduce((a, s) => a + (s.stats?.active ?? 0), 0);
  const totalCompleted = sequences.reduce((a, s) => a + (s.stats?.completed ?? 0), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">סדרות אימיילים</h1>
          <p className="text-slate-500 text-sm mt-1">Drip campaigns אוטומטיים לליידים</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={runProcessor}
            disabled={processing}
            className="gap-1"
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            הפעל שליחה
          </Button>
          <Button
            size="sm"
            className="gap-1 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setEditing(null); setShowModal(true); }}
          >
            <Plus className="h-4 w-4" /> סדרה חדשה
          </Button>
        </div>
      </div>

      {/* Process result */}
      {processResult && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {processResult}
          <button onClick={() => setProcessResult(null)} className="mr-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "סדרות פעילות", value: sequences.filter(s => s.is_active).length, icon: <Mail className="h-5 w-5 text-indigo-500" /> },
          { label: "נרשמים פעילים", value: totalEnrolled, icon: <Users className="h-5 w-5 text-blue-500" /> },
          { label: "השלימו סדרה", value: totalCompleted, icon: <CheckCircle2 className="h-5 w-5 text-green-500" /> },
        ].map(stat => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sequences list */}
      {loading ? (
        <div className="text-center py-16"><Loader2 className="h-8 w-8 animate-spin text-indigo-400 mx-auto" /></div>
      ) : sequences.length === 0 ? (
        <div className="text-center py-16">
          <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400">אין סדרות אימיילים עדיין</p>
          <Button
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 gap-1"
            onClick={() => { setEditing(null); setShowModal(true); }}
          >
            <Plus className="h-4 w-4" /> צור סדרה ראשונה
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sequences.map(seq => {
            const stepCount = seq.email_sequence_steps?.[0]?.count ?? 0;
            return (
              <Card key={seq.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Toggle */}
                    <button
                      onClick={() => toggleActive(seq)}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        seq.is_active
                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      )}
                    >
                      {seq.is_active ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-800 truncate">{seq.name}</h3>
                        <Badge variant={seq.is_active ? "default" : "secondary"} className="text-xs">
                          {seq.is_active ? "פעיל" : "מושהה"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {TRIGGER_LABELS[seq.trigger] ?? seq.trigger}
                        </Badge>
                      </div>
                      {seq.description && (
                        <p className="text-sm text-slate-500 mt-0.5 truncate">{seq.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {stepCount} שלבים</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {seq.stats?.active ?? 0} פעילים</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {seq.stats?.completed ?? 0} סיימו</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditing(seq); setShowModal(true); }}
                        className="gap-1 text-xs"
                      >
                        עריכה <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                      <button
                        onClick={() => deleteSequence(seq.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <SequenceModal
          initial={editing}
          onSave={() => { setShowModal(false); load(); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
