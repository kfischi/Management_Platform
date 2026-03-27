"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart, TrendingUp, TrendingDown, AlertTriangle,
  MessageSquare, Mail, Phone, Sparkles, Activity,
  DollarSign, Clock, Star, Zap, Loader2, RefreshCw
} from "lucide-react";

interface ClientHealth {
  id: string;
  name: string;
  company: string;
  score: number;
  trend: "up" | "down" | "stable";
  riskLevel: "low" | "medium" | "high" | "critical";
  lastContact: string;
  mrr: number;
  openTickets: number;
  deploymentsThisMonth: number;
  paymentStatus: "on-time" | "late" | "overdue";
  contractEnd: string | null;
  aiReason: string;
  aiAction: string;
  signals: { label: string; positive: boolean }[];
}

const MOCK_CLIENTS: ClientHealth[] = [
  {
    id: "c1", name: "אבי גולדברג", company: "TechStartup IL",
    score: 94, trend: "up", riskLevel: "low",
    lastContact: "לפני 2 ימים", mrr: 2400, openTickets: 0,
    deploymentsThisMonth: 8, paymentStatus: "on-time", contractEnd: "2027-01",
    aiReason: "לקוח מרוצה מאוד - תשלום בזמן, deploy תדיר, אפס פניות תמיכה",
    aiAction: "שקול upsell - מתאים לחבילת AI Pro",
    signals: [
      { label: "תשלום בזמן", positive: true },
      { label: "8 deploys החודש", positive: true },
      { label: "0 תקלות", positive: true },
      { label: "פעיל 18 חודשים", positive: true },
    ]
  },
  {
    id: "c2", name: "שרה כהן", company: "Fashion Brand",
    score: 61, trend: "down", riskLevel: "medium",
    lastContact: "לפני שבועיים", mrr: 1200, openTickets: 2,
    deploymentsThisMonth: 1, paymentStatus: "late", contractEnd: "2026-06",
    aiReason: "ירידה במעורבות, 2 פניות תמיכה פתוחות, תשלום באיחור",
    aiAction: "צור קשר עכשיו - שלח WhatsApp אישי + הצע שיחת review",
    signals: [
      { label: "תשלום באיחור 5 ימים", positive: false },
      { label: "2 פניות פתוחות", positive: false },
      { label: "deploy אחד בלבד", positive: false },
      { label: "חוזה עד יוני", positive: false },
    ]
  },
  {
    id: "c3", name: "דוד מזרחי", company: "Restaurant Chain",
    score: 78, trend: "stable", riskLevel: "low",
    lastContact: "לפני 3 ימים", mrr: 3200, openTickets: 1,
    deploymentsThisMonth: 4, paymentStatus: "on-time", contractEnd: "2026-12",
    aiReason: "לקוח יציב - פניה אחת פתוחה שדורשת מענה",
    aiAction: "סגור את הפנייה הפתוחה תוך 24 שעות",
    signals: [
      { label: "תשלום מיידי תמיד", positive: true },
      { label: "4 deploys", positive: true },
      { label: "פנייה אחת פתוחה", positive: false },
      { label: "LTV גבוה", positive: true },
    ]
  },
  {
    id: "c4", name: "מיכל לב", company: "Law Firm",
    score: 31, trend: "down", riskLevel: "critical",
    lastContact: "לפני חודש", mrr: 1800, openTickets: 4,
    deploymentsThisMonth: 0, paymentStatus: "overdue", contractEnd: "2026-04",
    aiReason: "⚠️ בסכנת נטישה! תשלום באיחור חריג, אפס פעילות, 4 פניות ללא מענה",
    aiAction: "התקשר עכשיו! לאחר מכן שלח הצעה לחידוש עם הנחה",
    signals: [
      { label: "תשלום באיחור 21 יום", positive: false },
      { label: "0 deploys החודש", positive: false },
      { label: "4 פניות ללא מענה", positive: false },
      { label: "חוזה פג בחודשיים!", positive: false },
    ]
  },
  {
    id: "c5", name: "יוסי שפירא", company: "Real Estate",
    score: 87, trend: "up", riskLevel: "low",
    lastContact: "אתמול", mrr: 2800, openTickets: 0,
    deploymentsThisMonth: 6, paymentStatus: "on-time", contractEnd: "2027-03",
    aiReason: "לקוח מצוין - שיפור מתמיד בכל המדדים",
    aiAction: "בקש ממנו ביקורת + הפניה לחברים",
    signals: [
      { label: "שיפור בביצועים", positive: true },
      { label: "6 deploys", positive: true },
      { label: "תשלום מראש", positive: true },
      { label: "NPS גבוה", positive: true },
    ]
  },
];

const riskConfig = {
  low: { label: "תקין", color: "text-green-700", bg: "bg-green-50", border: "border-green-200", dot: "bg-green-500" },
  medium: { label: "בינוני", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-500" },
  high: { label: "סיכון", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  critical: { label: "קריטי", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
};

function HealthBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : score >= 40 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-bold w-8 text-right">{score}</span>
    </div>
  );
}

export default function ClientsHealthPage() {
  const [sortBy, setSortBy] = useState<"score" | "risk" | "mrr">("score");
  const [clients, setClients] = useState<ClientHealth[]>(MOCK_CLIENTS);
  const [selectedClient, setSelectedClient] = useState<ClientHealth | null>(MOCK_CLIENTS[3]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clients/health");
      if (res.ok) {
        const data: ClientHealth[] = await res.json();
        if (data.length > 0) {
          setClients(data);
          setSelectedClient(data.find(c => c.riskLevel === "critical") ?? data[0] ?? null);
        }
      }
    } catch { /* keep mock data */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const criticalCount = clients.filter(c => c.riskLevel === "critical").length;
  const atRiskCount = clients.filter(c => c.riskLevel === "medium" || c.riskLevel === "high").length;
  const avgScore = clients.length ? Math.round(clients.reduce((s, c) => s + c.score, 0) / clients.length) : 0;
  const totalMRR = clients.reduce((s, c) => s + c.mrr, 0);

  const sorted = [...clients].sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "mrr") return b.mrr - a.mrr;
    const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Client Health Score
          </h2>
          <p className="text-muted-foreground">AI מנתח כל לקוח ומנבא סיכון נטישה</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            רענן
          </Button>
          <Button size="sm" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            פעל על קריטיים
          </Button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "ממוצע Health", value: avgScore, icon: Heart, color: "text-green-600", bg: "bg-green-50", suffix: "/100" },
          { label: "קריטיים", value: criticalCount, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", suffix: "" },
          { label: "בסיכון", value: atRiskCount, icon: TrendingDown, color: "text-orange-600", bg: "bg-orange-50", suffix: "" },
          { label: "MRR כולל", value: `₪${totalMRR.toLocaleString()}`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50", suffix: "" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`rounded-lg p-2 ${s.bg}`}>
                    <Icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{s.value}{s.suffix}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alert Banner for Critical */}
      {criticalCount > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-800 text-sm">
                {criticalCount} לקוח{criticalCount > 1 ? "ות" : ""} בסיכון קריטי לנטישה!
              </p>
              <p className="text-xs text-red-600">
                {clients.filter(c => c.riskLevel === "critical").map(c => c.company || c.name).join(", ")} — פעל עכשיו!
              </p>
            </div>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 shrink-0 gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              שלח WhatsApp לכולם
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Client List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">כל הלקוחות</CardTitle>
              <div className="flex gap-1">
                {(["score", "risk", "mrr"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      sortBy === s ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                  >
                    {s === "score" ? "Score" : s === "risk" ? "סיכון" : "MRR"}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {sorted.map(client => {
              const risk = riskConfig[client.riskLevel];
              const isSelected = selectedClient?.id === client.id;

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`rounded-lg border p-3 cursor-pointer transition-all ${
                    isSelected
                      ? `${risk.bg} ${risk.border} border-2`
                      : "hover:bg-accent/40 border-transparent hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{client.name}</span>
                        <span className="text-xs text-muted-foreground">· {client.company}</span>
                        {client.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                        {client.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>₪{client.mrr.toLocaleString()}/חודש</span>
                        <span>·</span>
                        <span>{client.lastContact}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${risk.dot}`} />
                      <Badge className={`text-xs ${risk.bg} ${risk.color} border-0`}>
                        {risk.label}
                      </Badge>
                    </div>
                  </div>
                  <HealthBar score={client.score} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Client Detail */}
        {selectedClient && (
          <div className="space-y-4">
            <Card className={`border-2 ${riskConfig[selectedClient.riskLevel].border}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold">{selectedClient.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedClient.company}</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      selectedClient.score >= 80 ? "text-green-600" :
                      selectedClient.score >= 60 ? "text-yellow-600" :
                      selectedClient.score >= 40 ? "text-orange-600" : "text-red-600"
                    }`}>
                      {selectedClient.score}
                    </div>
                    <div className="text-xs text-muted-foreground">Health Score</div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: "MRR", value: `₪${selectedClient.mrr.toLocaleString()}`, icon: DollarSign },
                    { label: "Deploys החודש", value: selectedClient.deploymentsThisMonth, icon: Activity },
                    { label: "פניות פתוחות", value: selectedClient.openTickets, icon: MessageSquare },
                    { label: "חוזה עד", value: selectedClient.contractEnd, icon: Clock },
                  ].map(m => {
                    const Icon = m.icon;
                    return (
                      <div key={m.label} className="rounded-md bg-muted/50 p-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Icon className="h-3 w-3" />
                          {m.label}
                        </div>
                        <div className="font-semibold text-sm">{m.value}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Signals */}
                <div className="space-y-1 mb-3">
                  {selectedClient.signals.map((sig, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span>{sig.positive ? "✅" : "❌"}</span>
                      <span className={sig.positive ? "text-green-700" : "text-red-700"}>{sig.label}</span>
                    </div>
                  ))}
                </div>

                {/* AI Analysis */}
                <div className="rounded-lg bg-purple-50 border border-purple-100 p-3 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Analysis
                  </div>
                  <p className="text-xs text-purple-800">{selectedClient.aiReason}</p>
                </div>

                {/* AI Recommended Action */}
                <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 mb-4">
                  <p className="text-xs font-semibold text-orange-700 mb-0.5">🎯 פעולה מומלצת:</p>
                  <p className="text-xs text-orange-800">{selectedClient.aiAction}</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Button size="sm" className="gap-1 text-xs bg-green-600 hover:bg-green-700">
                    <MessageSquare className="h-3 w-3" />
                    WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs">
                    <Mail className="h-3 w-3" />
                    אימייל
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs">
                    <Phone className="h-3 w-3" />
                    שיחה
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Auto Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">אוטומציות חכמות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "שלח חידוש חוזה", icon: "📄", when: `כשנותרו 60 יום` },
                  { label: "תזכורת תשלום", icon: "💰", when: "ביום האיחור" },
                  { label: "בדיקת שביעות רצון", icon: "⭐", when: "כל 3 חודשים" },
                ].map(a => (
                  <div key={a.label} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/30 cursor-pointer">
                    <span className="text-lg">{a.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{a.label}</p>
                      <p className="text-xs text-muted-foreground">{a.when}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 text-xs">הפעל</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
