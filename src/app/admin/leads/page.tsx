"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target, Plus, TrendingUp, Brain, Mail, MessageSquare,
  Phone, Star, ArrowRight, Filter, Download, Zap, ChevronDown
} from "lucide-react";

type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";

interface Lead {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  source: string;
  status: LeadStatus;
  score: number;
  value: number;
  notes?: string;
  tags: string[];
  createdAt: string;
  aiInsight?: string;
}

const mockLeads: Lead[] = [
  {
    id: "l1", name: "אבי גולדברג", company: "TechStartup IL", email: "avi@techstartup.co.il",
    phone: "+972501234567", source: "WhatsApp", status: "qualified", score: 92,
    value: 15000, tags: ["B2B", "טכנולוגיה"], createdAt: "לפני יום",
    aiInsight: "סיכוי גבוה מאוד לסגירה - הראה עניין ספציפי ב-ecommerce"
  },
  {
    id: "l2", name: "מיכל לב", company: "Fashion Brand", email: "michal@fashionbrand.co.il",
    phone: "+972521234567", source: "טופס אתר", status: "new", score: 78,
    value: 8000, tags: ["B2C", "אופנה"], createdAt: "לפני 2 שעות",
    aiInsight: "מחפשת אתר עם חנות אונליין - נישה עם תחרות נמוכה"
  },
  {
    id: "l3", name: "יוסי מזרחי", company: "Law Firm", email: "yossi@lawfirm.co.il",
    source: "LinkedIn", status: "proposal", score: 85,
    value: 25000, tags: ["B2B", "משפטים"], createdAt: "לפני 3 ימים",
    aiInsight: "שלחנו הצעה - מחכה לאישור שותפים"
  },
  {
    id: "l4", name: "שירה אברהם", email: "shira@gmail.com",
    source: "Instagram", status: "contacted", score: 55,
    value: 4000, tags: ["B2C"], createdAt: "לפני שבוע",
    aiInsight: "לא ענתה לאחרונה - שלח follow-up"
  },
  {
    id: "l5", name: "דן שפירא", company: "Restaurant Chain", email: "dan@food.co.il",
    phone: "+972531234567", source: "הפניה", status: "won", score: 98,
    value: 18000, tags: ["B2B", "מסעדנות"], createdAt: "לפני שבועיים",
    aiInsight: "לקוח סגור! שקול לבקש הפניות"
  },
  {
    id: "l6", name: "נעמה כץ", email: "naama@ngo.org",
    source: "Facebook", status: "lost", score: 30,
    value: 6000, tags: ["עמות"], createdAt: "לפני חודש",
    aiInsight: "תקציב קטן מדי - עדכן template לעמותות"
  },
];

const columns: { status: LeadStatus; label: string; color: string; bg: string }[] = [
  { status: "new", label: "חדש", color: "text-blue-600", bg: "bg-blue-50" },
  { status: "contacted", label: "פנינו אליו", color: "text-purple-600", bg: "bg-purple-50" },
  { status: "qualified", label: "מוכשר", color: "text-orange-600", bg: "bg-orange-50" },
  { status: "proposal", label: "הצעה", color: "text-yellow-600", bg: "bg-yellow-50" },
  { status: "won", label: "נסגר ✓", color: "text-green-600", bg: "bg-green-50" },
  { status: "lost", label: "ירד", color: "text-red-600", bg: "bg-red-50" },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-1">
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-xs font-medium">{score}</span>
    </div>
  );
}

export default function LeadsPage() {
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const totalValue = mockLeads.filter(l => l.status === "won").reduce((sum, l) => sum + l.value, 0);
  const pipelineValue = mockLeads.filter(l => !["won", "lost"].includes(l.status)).reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            ניהול לידים
          </h2>
          <p className="text-muted-foreground">
            {mockLeads.length} לידים · Pipeline: ₪{pipelineValue.toLocaleString()} · נסגר: ₪{totalValue.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            סנן
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            ייצא
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            ליד חדש
          </Button>
        </div>
      </div>

      {/* AI Summary */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 shrink-0">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-purple-900">AI Lead Intelligence</p>
            <p className="text-xs text-purple-700 mt-0.5">
              3 לידים בסיכון גבוה · אבי גולדברג (92%) הכי חם ברגע זה ·
              הכנסות צפויות החודש: ₪{(pipelineValue * 0.65).toLocaleString()} (65% win rate)
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs gap-1 border-purple-300 text-purple-700 hover:bg-purple-100">
              <Zap className="h-3 w-3" />
              פעל על הלידים החמים
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "סה״כ לידים", value: mockLeads.length, icon: Target, color: "text-blue-600" },
          { label: "בפייפליין", value: mockLeads.filter(l => !["won","lost"].includes(l.status)).length, icon: TrendingUp, color: "text-orange-600" },
          { label: "נסגרו החודש", value: mockLeads.filter(l => l.status === "won").length, icon: Star, color: "text-green-600" },
          { label: "אחוז סגירה", value: `${Math.round((mockLeads.filter(l => l.status === "won").length / mockLeads.length) * 100)}%`, icon: TrendingUp, color: "text-purple-600" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${s.color}`} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={view === "kanban" ? "default" : "outline"}
          onClick={() => setView("kanban")}
        >
          📋 Kanban
        </Button>
        <Button
          size="sm"
          variant={view === "list" ? "default" : "outline"}
          onClick={() => setView("list")}
        >
          📄 רשימה
        </Button>
      </div>

      {/* Kanban Board */}
      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colLeads = mockLeads.filter(l => l.status === col.status);
            return (
              <div key={col.status} className="shrink-0 w-64">
                <div className={`flex items-center justify-between mb-2 px-2 py-1.5 rounded-lg ${col.bg}`}>
                  <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                  <Badge variant="secondary" className="text-xs h-5">{colLeads.length}</Badge>
                </div>
                <div className="space-y-2">
                  {colLeads.map((lead) => (
                    <Card key={lead.id} className="cursor-grab hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-sm">{lead.name}</p>
                          <ScoreBadge score={lead.score} />
                        </div>
                        {lead.company && (
                          <p className="text-xs text-muted-foreground">{lead.company}</p>
                        )}
                        <div className="flex flex-wrap gap-1 my-2">
                          {lead.tags.map(tag => (
                            <span key={tag} className="text-xs bg-accent rounded px-1.5 py-0.5">{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-600 font-semibold">₪{lead.value.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">{lead.source}</span>
                        </div>
                        {lead.aiInsight && (
                          <div className="mt-2 p-1.5 rounded bg-purple-50 border border-purple-100">
                            <p className="text-xs text-purple-700">🤖 {lead.aiInsight}</p>
                          </div>
                        )}
                        <div className="flex gap-1 mt-2 border-t pt-2">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="WhatsApp">
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="Email">
                            <Mail className="h-3 w-3" />
                          </Button>
                          {lead.phone && (
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="שיחה">
                              <Phone className="h-3 w-3" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-6 mr-auto gap-0.5 text-xs px-1" title="קדם">
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <button className="w-full flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-muted-foreground/20 py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                    <Plus className="h-3 w-3" />
                    הוסף ליד
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {mockLeads.map((lead) => {
                const col = columns.find(c => c.status === lead.status)!;
                return (
                  <div key={lead.id} className="flex items-center gap-4 px-4 py-3 hover:bg-accent/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{lead.name}</p>
                        {lead.company && <span className="text-xs text-muted-foreground">· {lead.company}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </div>
                    <ScoreBadge score={lead.score} />
                    <span className="text-sm font-semibold">₪{lead.value.toLocaleString()}</span>
                    <Badge variant="secondary" className={`text-xs ${col.color}`}>{col.label}</Badge>
                    <span className="text-xs text-muted-foreground">{lead.source}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <Mail className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
