"use client";

import { useState } from "react";
import { X, ChevronRight, ChevronLeft, Loader2, Check, Globe, User, Mail, Phone, Building2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
  onDone: () => void;
}

type Step = "client" | "project" | "confirm";

const TEMPLATES = [
  { id: "business",    label: "עסק מקומי",     emoji: "🏪", desc: "דף נחיתה לעסק מקומי" },
  { id: "portfolio",   label: "פורטפוליו",      emoji: "🎨", desc: "הצגת עבודות ופרויקטים" },
  { id: "restaurant",  label: "מסעדה / קפה",    emoji: "🍕", desc: "תפריט, שעות ואירועים" },
  { id: "professional",label: "מקצועי / רופא",  emoji: "👨‍⚕️", desc: "קביעת תורים ושירותים" },
  { id: "ecommerce",   label: "חנות אונליין",   emoji: "🛒", desc: "מוצרים ותשלומים" },
  { id: "blank",       label: "דף ריק",         emoji: "📄", desc: "התחל מאפס" },
];

export default function OnboardingWizard({ onClose, onDone }: Props) {
  const [step, setStep] = useState<Step>("client");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [value, setValue] = useState("");

  // Project details
  const [siteName, setSiteName] = useState("");
  const [template, setTemplate] = useState("business");
  const [sendInvite, setSendInvite] = useState(true);

  const canNextClient = name.trim() && email.trim();
  const canNextProject = siteName.trim();

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      // 1. Create lead
      const leadRes = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          company: company || null,
          value: parseFloat(value) || 0,
          source: "manual",
          status: "qualified",
          pipeline_stage: "approved",
        }),
      });
      if (!leadRes.ok) throw new Error("שגיאה ביצירת ליד");
      const lead = await leadRes.json() as { id: string };

      // 2. Create site
      const siteRes = await fetch("/api/admin/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: siteName,
          template,
          lead_id: lead.id,
          client_email: email,
          client_name: name,
        }),
      });
      if (!siteRes.ok) throw new Error("שגיאה ביצירת אתר");
      const site = await siteRes.json() as { id: string };

      // 3. Optionally invite client
      if (sendInvite && email) {
        await fetch("/api/admin/invite-client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, site_id: site.id }),
        }).catch(() => null);
      }

      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "שגיאה לא צפויה");
    } finally {
      setSaving(false);
    }
  }

  const steps: Step[] = ["client", "project", "confirm"];
  const stepIndex = steps.indexOf(step);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">לקוח חדש — Onboarding</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {[
              { id: "client",  label: "פרטי לקוח" },
              { id: "project", label: "פרטי פרויקט" },
              { id: "confirm", label: "אישור" },
            ].map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                {i > 0 && <div className={cn("flex-1 h-0.5 w-6", stepIndex >= i ? "bg-white" : "bg-white/30")} />}
                <div className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all",
                  stepIndex > i ? "bg-white text-indigo-600" :
                  stepIndex === i ? "bg-white/20 text-white border-2 border-white" :
                  "bg-white/10 text-white/50"
                )}>
                  {stepIndex > i ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={cn("text-xs", stepIndex >= i ? "text-white" : "text-white/50")}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === "client" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">שם מלא *</label>
                  <div className="relative">
                    <User className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      className="w-full border border-slate-200 rounded-lg py-2 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="ישראל ישראלי"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">חברה</label>
                  <div className="relative">
                    <Building2 className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      className="w-full border border-slate-200 rounded-lg py-2 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="שם העסק"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">אימייל *</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    className="w-full border border-slate-200 rounded-lg py-2 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="israel@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">טלפון</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      className="w-full border border-slate-200 rounded-lg py-2 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="05X-XXXXXXX"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">ערך עסקה (₪)</label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      className="w-full border border-slate-200 rounded-lg py-2 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="5000"
                      value={value}
                      onChange={e => setValue(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "project" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">שם האתר *</label>
                <div className="relative">
                  <Globe className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full border border-slate-200 rounded-lg py-2 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder={company || name || "שם האתר"}
                    value={siteName}
                    onChange={e => setSiteName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">תבנית</label>
                <div className="grid grid-cols-3 gap-2">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      className={cn(
                        "rounded-xl border-2 p-3 text-center transition-all",
                        template === t.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="text-2xl mb-1">{t.emoji}</div>
                      <div className="text-xs font-medium text-slate-700">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setSendInvite(!sendInvite)}
                  className={cn(
                    "w-5 h-5 rounded flex items-center justify-center border-2 transition-colors",
                    sendInvite ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                  )}
                >
                  {sendInvite && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm text-slate-700">שלח הזמנה ללקוח למייל</span>
              </label>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">לקוח</span>
                  <span className="font-medium text-slate-800">{name}</span>
                </div>
                {company && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">חברה</span>
                    <span className="font-medium text-slate-800">{company}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">אימייל</span>
                  <span className="font-medium text-slate-800">{email}</span>
                </div>
                {phone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">טלפון</span>
                    <span className="font-medium text-slate-800">{phone}</span>
                  </div>
                )}
                {value && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">ערך עסקה</span>
                    <span className="font-bold text-indigo-600">₪{parseFloat(value).toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">שם אתר</span>
                  <span className="font-medium text-slate-800">{siteName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">תבנית</span>
                  <span className="font-medium text-slate-800">{TEMPLATES.find(t => t.id === template)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">הזמנה ללקוח</span>
                  <span className={cn("font-medium", sendInvite ? "text-green-600" : "text-slate-400")}>
                    {sendInvite ? "כן — יישלח מייל" : "לא"}
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-between gap-3">
          {step !== "client" ? (
            <Button
              variant="outline"
              onClick={() => setStep(step === "confirm" ? "project" : "client")}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              חזרה
            </Button>
          ) : (
            <Button variant="ghost" onClick={onClose}>ביטול</Button>
          )}

          {step === "confirm" ? (
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 flex-1"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              צור לקוח + אתר
            </Button>
          ) : (
            <Button
              onClick={() => setStep(step === "client" ? "project" : "confirm")}
              disabled={step === "client" ? !canNextClient : !canNextProject}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            >
              המשך
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
