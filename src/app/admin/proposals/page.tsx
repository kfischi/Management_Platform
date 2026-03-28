"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText, Sparkles, Plus, Trash2, Download, Send,
  CheckCircle2, ChevronDown, ChevronUp, Loader2, Eye
} from "lucide-react";

interface ServiceLine {
  id: string;
  name: string;
  description: string;
  price: number;
  qty: number;
}

interface ProposalData {
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  projectName: string;
  projectType: string;
  services: ServiceLine[];
  validDays: number;
  notes: string;
  aiGenerated: boolean;
}

const projectTypes = [
  "אתר תדמית", "חנות אונליין (eCommerce)", "לנדינג פייג׳", "אתר תיק עבודות",
  "אפליקציה web", "מערכת ניהול", "בלוג מקצועי", "אתר נדל״ן"
];

const serviceTemplates: Record<string, ServiceLine[]> = {
  "אתר תדמית": [
    { id: "1", name: "עיצוב UI/UX", description: "עיצוב מסכים וחוויית משתמש", price: 3500, qty: 1 },
    { id: "2", name: "פיתוח Frontend", description: "Next.js + Tailwind CSS", price: 5000, qty: 1 },
    { id: "3", name: "אחסון ו-Deployment", description: "Netlify + Coolify, שנה ראשונה", price: 800, qty: 1 },
    { id: "4", name: "SEO בסיסי", description: "כלים, meta tags, sitemap", price: 1200, qty: 1 },
  ],
  "חנות אונליין (eCommerce)": [
    { id: "1", name: "עיצוב UI/UX", description: "עיצוב מסכים + mobile", price: 5000, qty: 1 },
    { id: "2", name: "פיתוח Frontend + Backend", description: "Next.js + Supabase", price: 12000, qty: 1 },
    { id: "3", name: "אינטגרציית Stripe/Cardcom", description: "סליקה מאובטחת", price: 2500, qty: 1 },
    { id: "4", name: "ניהול מוצרים", description: "CMS מותאם", price: 1500, qty: 1 },
    { id: "5", name: "אחסון + SSL", description: "שנה ראשונה", price: 1200, qty: 1 },
  ],
};

const aiInsights = [
  "על בסיס פרויקטים דומים - אחוז הסגירה בטווח מחיר זה הוא 78%",
  "הוסף 'תמיכה שנתית' כ-upsell - עולה ₪3,600 ומגדיל ערך ב-20%",
  "לקוחות בתחום זה מגיבים טוב להדגשת ROI - שקול להוסיף",
  "הצע תשלום בשלושה חלקים - מגדיל סגירה ב-34%",
];

interface SavedProposal { id: string; client_name: string; total_amount: number; status: string; created_at: string }

export default function ProposalsPage() {
  const [step, setStep] = useState<"input" | "preview" | "sent">("input");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [savedProposals, setSavedProposals] = useState<SavedProposal[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Load recent proposals on mount
  useState(() => { fetch("/api/admin/proposals").then(r => r.json()).then(d => setSavedProposals(d.slice(0,5))).catch(() => {}); });

  const [proposal, setProposal] = useState<ProposalData>({
    clientName: "",
    clientCompany: "",
    clientEmail: "",
    projectName: "",
    projectType: "אתר תדמית",
    services: serviceTemplates["אתר תדמית"],
    validDays: 14,
    notes: "",
    aiGenerated: false,
  });

  const total = proposal.services.reduce((sum, s) => sum + s.price * s.qty, 0);
  const vat = Math.round(total * 0.17);

  const handleAIGenerate = async () => {
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 2000));

    const template = serviceTemplates[proposal.projectType] || serviceTemplates["אתר תדמית"];
    setProposal(prev => ({
      ...prev,
      services: template,
      notes: `ברצוננו להציע לך ${prev.projectType} מקצועי ומותאם אישית לצרכי ${prev.clientCompany || "העסק שלך"}.\n\nהפרויקט יכלול עיצוב מודרני, חוויית משתמש מעולה, וביצועים גבוהים.\nאנו מתחייבים לתהליך שקוף, עמידה בלוחות זמנים, ותוצאה שתגרום לך להיות גאה.`,
      aiGenerated: true,
    }));
    setShowInsights(true);
    setAiLoading(false);
  };

  const handleSend = async () => {
    if (!proposal.clientName || !proposal.clientEmail) return;
    setLoading(true);
    try {
      const res = await fetch(
        savedId ? `/api/admin/proposals/${savedId}` : "/api/admin/proposals",
        {
          method: savedId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_name: proposal.clientName,
            client_company: proposal.clientCompany,
            client_email: proposal.clientEmail,
            project_name: proposal.projectName,
            project_type: proposal.projectType,
            services: proposal.services,
            valid_days: proposal.validDays,
            notes: proposal.notes,
            status: "sent",
          }),
        }
      );
      if (res.ok) {
        const saved = await res.json();
        setSavedId(saved.id);
        setSavedProposals(prev => [saved, ...prev.filter(p => p.id !== saved.id)].slice(0,5));
      }
    } catch { /* silent */ }
    setLoading(false);
    setStep("sent");
  };

  const handleSaveDraft = async () => {
    if (!proposal.clientName) return;
    const res = await fetch(
      savedId ? `/api/admin/proposals/${savedId}` : "/api/admin/proposals",
      {
        method: savedId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: proposal.clientName, client_company: proposal.clientCompany,
          client_email: proposal.clientEmail, project_name: proposal.projectName,
          project_type: proposal.projectType, services: proposal.services,
          valid_days: proposal.validDays, notes: proposal.notes, status: "draft",
        }),
      }
    );
    if (res.ok) { const saved = await res.json(); setSavedId(saved.id); setSavedProposals(prev => [saved, ...prev.filter(p => p.id !== saved.id)].slice(0,5)); }
  };

  const updateService = (id: string, field: keyof ServiceLine, value: string | number) => {
    setProposal(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  };

  const addService = () => {
    setProposal(prev => ({
      ...prev,
      services: [...prev.services, {
        id: Date.now().toString(), name: "", description: "", price: 0, qty: 1
      }],
    }));
  };

  const removeService = (id: string) => {
    setProposal(prev => ({ ...prev, services: prev.services.filter(s => s.id !== id) }));
  };

  if (step === "sent") {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center space-y-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">ההצעה נשלחה!</h2>
        <p className="text-muted-foreground">
          הצעת המחיר נשלחה ל-{proposal.clientEmail}.<br />
          הלקוח יקבל קישור לצפייה וחתימה דיגיטלית.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep("input")}>הצעה חדשה</Button>
          {savedId && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.open(`/admin/proposals/${savedId}`, "_blank")}
            >
              <Download className="h-4 w-4" /> הורד PDF
            </Button>
          )}
          <Button asChild><a href="/admin/leads">מעבר ל-CRM</a></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            מחולל הצעות מחיר
          </h2>
          <p className="text-muted-foreground">AI יוצר הצעה מקצועית תוך שניות</p>
        </div>
        <div className="flex gap-2">
          {step === "preview" && (
            <Button variant="outline" onClick={() => setStep("input")} className="gap-2">
              ← ערוך
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setStep(step === "input" ? "preview" : "input")}
          >
            <Eye className="h-4 w-4" />
            {step === "preview" ? "ערוך" : "תצוגה מקדימה"}
          </Button>
        </div>
      </div>

      {step === "input" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main Form */}
          <div className="space-y-4">
            {/* Client Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">פרטי לקוח</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>שם איש קשר</Label>
                  <Input
                    placeholder="ישראל ישראלי"
                    value={proposal.clientName}
                    onChange={e => setProposal(p => ({ ...p, clientName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>שם החברה</Label>
                  <Input
                    placeholder="TechCo Ltd."
                    value={proposal.clientCompany}
                    onChange={e => setProposal(p => ({ ...p, clientCompany: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>אימייל</Label>
                  <Input
                    type="email"
                    placeholder="client@company.com"
                    value={proposal.clientEmail}
                    onChange={e => setProposal(p => ({ ...p, clientEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>שם הפרויקט</Label>
                  <Input
                    placeholder="אתר תדמית לחברת X"
                    value={proposal.projectName}
                    onChange={e => setProposal(p => ({ ...p, projectName: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project Type + AI */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">סוג הפרויקט</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {projectTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setProposal(p => ({
                        ...p,
                        projectType: type,
                        services: serviceTemplates[type] || serviceTemplates["אתר תדמית"]
                      }))}
                      className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                        proposal.projectType === type
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-accent border-border"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleAIGenerate}
                  disabled={aiLoading}
                  className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {aiLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> AI מחשב הצעה אופטימלית...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Generate עם AI ✨</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">שירותים ומחירים</CardTitle>
                  <Button size="sm" variant="outline" onClick={addService} className="gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    הוסף
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {proposal.services.map((service, i) => (
                  <div key={service.id} className="grid gap-2 p-3 rounded-lg border bg-muted/30">
                    <div className="grid gap-2 sm:grid-cols-[1fr_1fr_80px_80px_32px]">
                      <Input
                        placeholder="שם השירות"
                        value={service.name}
                        onChange={e => updateService(service.id, "name", e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        placeholder="תיאור"
                        value={service.description}
                        onChange={e => updateService(service.id, "description", e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="מחיר"
                        value={service.price}
                        onChange={e => updateService(service.id, "price", Number(e.target.value))}
                        className="text-sm text-center"
                      />
                      <Input
                        type="number"
                        placeholder="כמות"
                        value={service.qty}
                        onChange={e => updateService(service.id, "qty", Number(e.target.value))}
                        className="text-sm text-center"
                        min={1}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-red-500 hover:text-red-600"
                        onClick={() => removeService(service.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex justify-end text-sm font-medium">
                      ₪{(service.price * service.qty).toLocaleString()}
                    </div>
                  </div>
                ))}

                <div className="flex flex-col items-end gap-1 pt-3 border-t">
                  <div className="text-sm text-muted-foreground">סה״כ לפני מע״מ: ₪{total.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">מע״מ (17%): ₪{vat.toLocaleString()}</div>
                  <div className="text-xl font-bold text-green-700">סה״כ כולל מע״מ: ₪{(total + vat).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label>הערות ותוכן הצעה</Label>
                  <textarea
                    value={proposal.notes}
                    onChange={e => setProposal(p => ({ ...p, notes: e.target.value }))}
                    rows={4}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    placeholder="כתוב תיאור הפרויקט..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label>תוקף ההצעה (ימים):</Label>
                  <Input
                    type="number"
                    value={proposal.validDays}
                    onChange={e => setProposal(p => ({ ...p, validDays: Number(e.target.value) }))}
                    className="w-20"
                    min={1}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="gap-2" onClick={handleSaveDraft} disabled={!proposal.clientName}>
                <Download className="h-4 w-4" />
                שמור טיוטה
              </Button>
              {savedId && (
                <Button
                  variant="outline"
                  className="gap-2 border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => window.open(`/admin/proposals/${savedId}`, "_blank")}
                >
                  🖨️ PDF
                </Button>
              )}
              <Button
                className="flex-1 gap-2"
                onClick={handleSend}
                disabled={loading || !proposal.clientEmail || !proposal.clientName}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                שלח ללקוח
              </Button>
            </div>
          </div>

          {/* AI Sidebar */}
          <div className="space-y-4">
            {/* AI Insights */}
            {proposal.aiGenerated && (
              <Card className="border-purple-200 bg-gradient-to-b from-purple-50 to-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    AI Insights
                    <Badge variant="secondary" className="text-xs ml-auto">חדש</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {aiInsights.map((insight, i) => (
                    <div key={i} className="flex gap-2 text-xs text-purple-800">
                      <span className="shrink-0 mt-0.5">💡</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Live Preview Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">סיכום מהיר</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">לקוח</span>
                  <span className="font-medium">{proposal.clientName || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">פרויקט</span>
                  <span className="font-medium">{proposal.projectType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">שירותים</span>
                  <span className="font-medium">{proposal.services.length}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">סה״כ + מע״מ</span>
                  <span className="font-bold text-green-700">₪{(total + vat).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">תוקף</span>
                  <span className="text-xs">{proposal.validDays} ימים</span>
                </div>
              </CardContent>
            </Card>

            {/* Previous Proposals */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">הצעות אחרונות</CardTitle>
                  {savedId && <span className="text-[10px] text-green-600 font-medium bg-green-50 border border-green-200 rounded px-1.5 py-0.5">נשמר</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-0">
                {savedProposals.length === 0 && <p className="text-xs text-muted-foreground">אין הצעות שמורות</p>}
                {savedProposals.map((p) => {
                  const statusMap: Record<string,string> = { draft: "טיוטה", sent: "נשלח", viewed: "נצפה", accepted: "נחתם ✓", declined: "נדחה" };
                  return (
                    <div key={p.id} className="flex items-center justify-between text-xs py-1.5 border-b last:border-0">
                      <span className="font-medium truncate max-w-[100px]">{p.client_name}</span>
                      <div className="text-right">
                        <div className="font-semibold">₪{p.total_amount.toLocaleString()}</div>
                        <div className={p.status === "accepted" ? "text-green-600" : "text-muted-foreground"}>{statusMap[p.status] ?? p.status}</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === "preview" && (
        /* Proposal Preview */
        <Card className="max-w-3xl mx-auto shadow-xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8 pb-6 border-b">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-3">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <h1 className="text-2xl font-bold">WMA Agency</h1>
                <p className="text-muted-foreground text-sm">info@wma.co.il | 050-1234567</p>
              </div>
              <div className="text-right">
                <Badge className="text-sm mb-2">הצעת מחיר</Badge>
                <p className="font-bold text-2xl">#{Math.floor(Math.random() * 9000) + 1000}</p>
                <p className="text-sm text-muted-foreground">
                  תאריך: {new Date().toLocaleDateString("he-IL")}
                </p>
                <p className="text-sm text-muted-foreground">
                  תוקף: {new Date(Date.now() + proposal.validDays * 86400000).toLocaleDateString("he-IL")}
                </p>
              </div>
            </div>

            {/* Client */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-1">עבור:</p>
              <p className="font-bold text-lg">{proposal.clientName || "שם הלקוח"}</p>
              {proposal.clientCompany && <p className="text-muted-foreground">{proposal.clientCompany}</p>}
            </div>

            {/* Project */}
            <div className="mb-6 p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-1">{proposal.projectName || proposal.projectType}</p>
              {proposal.notes && <p className="text-sm text-muted-foreground whitespace-pre-line">{proposal.notes}</p>}
            </div>

            {/* Services Table */}
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-right pb-2">שירות</th>
                  <th className="text-center pb-2">כמות</th>
                  <th className="text-left pb-2">מחיר</th>
                  <th className="text-left pb-2">סה״כ</th>
                </tr>
              </thead>
              <tbody>
                {proposal.services.map(service => (
                  <tr key={service.id} className="border-b">
                    <td className="py-3">
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    </td>
                    <td className="text-center py-3 text-sm">{service.qty}</td>
                    <td className="text-left py-3 text-sm">₪{service.price.toLocaleString()}</td>
                    <td className="text-left py-3 font-semibold text-sm">
                      ₪{(service.price * service.qty).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex flex-col items-end gap-1 mb-8">
              <div className="flex gap-8 text-sm text-muted-foreground">
                <span>לפני מע״מ:</span>
                <span>₪{total.toLocaleString()}</span>
              </div>
              <div className="flex gap-8 text-sm text-muted-foreground">
                <span>מע״מ 17%:</span>
                <span>₪{vat.toLocaleString()}</span>
              </div>
              <div className="flex gap-8 text-xl font-bold text-green-700 border-t pt-2 mt-1">
                <span>סה״כ לתשלום:</span>
                <span>₪{(total + vat).toLocaleString()}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
              <p className="font-semibold mb-2">מאשר/ת את ההצעה?</p>
              <div className="flex gap-3 justify-center">
                <Button className="gap-2 bg-green-600 hover:bg-green-700">
                  ✓ אני מאשר/ת את ההצעה
                </Button>
                <Button variant="outline">שאלות? צור קשר</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
