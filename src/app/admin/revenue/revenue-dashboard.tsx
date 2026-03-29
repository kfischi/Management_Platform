"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type RevData = {
  summary: {
    total_revenue: number;
    avg_deal: number;
    pipeline_value: number;
    deals_won: number;
    growth_pct: number;
  };
  by_month: { month: string; revenue: number }[];
  top_clients: { name: string; revenue: number }[];
  pipeline: Record<string, { count: number; value: number }>;
  recent_wins: { name: string; value: number; date: string }[];
};

const PIPELINE_LABELS: Record<string, string> = {
  new: "חדש", contacted: "פנינו", qualified: "מוכשר",
  proposal: "הצעה", won: "נסגר", lost: "ירד",
};
const PIE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"];

function fmt(n: number) {
  return n >= 1000 ? `₪${(n / 1000).toFixed(1)}k` : `₪${n.toLocaleString()}`;
}

function MonthLabel({ value }: { value: string }) {
  const [, m] = value.split("-");
  const months = ["ינו", "פבר", "מרץ", "אפר", "מאי", "יוני", "יולי", "אוג", "ספט", "אוק", "נוב", "דצמ"];
  return <>{months[parseInt(m) - 1] ?? value}</>;
}

export default function RevenueDashboard() {
  const [data, setData] = useState<RevData | null>(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(12);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/revenue?months=${months}`);
      setData(await res.json() as RevData);
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => { load(); }, [load]);

  const pipelineForPie = data
    ? Object.entries(data.pipeline)
        .filter(([, v]) => v.value > 0)
        .map(([status, v], i) => ({
          name: PIPELINE_LABELS[status] ?? status,
          value: v.value,
          color: PIE_COLORS[i % PIE_COLORS.length],
        }))
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Revenue Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">הכנסות, לקוחות ופייפליין</p>
        </div>
        <div className="flex gap-2 items-center">
          {[3, 6, 12].map(m => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-full border transition-colors",
                months === m ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
              )}
            >
              {m} חודשים
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : data && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "סה״כ הכנסות",
                value: fmt(data.summary.total_revenue),
                sub: `${data.summary.deals_won} עסקאות`,
                icon: <DollarSign className="h-5 w-5 text-green-500" />,
                bg: "bg-green-50",
                trend: data.summary.growth_pct,
              },
              {
                label: "ממוצע עסקה",
                value: fmt(data.summary.avg_deal),
                sub: "לעסקה",
                icon: <TrendingUp className="h-5 w-5 text-indigo-500" />,
                bg: "bg-indigo-50",
              },
              {
                label: "פייפליין פתוח",
                value: fmt(data.summary.pipeline_value),
                sub: "ב-pipeline",
                icon: <Target className="h-5 w-5 text-orange-500" />,
                bg: "bg-orange-50",
              },
              {
                label: "צמיחה",
                value: `${data.summary.growth_pct > 0 ? "+" : ""}${data.summary.growth_pct}%`,
                sub: "לעומת חודש קודם",
                icon: data.summary.growth_pct >= 0
                  ? <TrendingUp className="h-5 w-5 text-green-500" />
                  : <TrendingDown className="h-5 w-5 text-red-500" />,
                bg: data.summary.growth_pct >= 0 ? "bg-green-50" : "bg-red-50",
              },
            ].map(kpi => (
              <Card key={kpi.label} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("p-2 rounded-xl", kpi.bg)}>{kpi.icon}</div>
                    <span className="text-xs text-slate-500">{kpi.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{kpi.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue over time */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">הכנסות לאורך זמן</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.by_month} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickFormatter={v => { const [, m] = v.split("-"); return ["ינו","פבר","מרץ","אפר","מאי","יוני","יולי","אוג","ספט","אוק","נוב","דצמ"][parseInt(m)-1] ?? v; }}
                  />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₪${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value) => [`₪${Number(value).toLocaleString()}`, "הכנסות"]}
                    labelFormatter={label => { const [, m] = String(label).split("-"); return ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"][parseInt(m)-1] ?? label; }}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Top clients */}
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-500" /> לקוחות מובילים
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.top_clients.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">אין נתונים</p>
                ) : (
                  <div className="space-y-3">
                    {data.top_clients.slice(0, 8).map((c, i) => (
                      <div key={c.name} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 w-5 text-left">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700 truncate">{c.name}</span>
                            <span className="text-sm font-bold text-indigo-600 mr-2">{fmt(c.revenue)}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-400 rounded-full"
                              style={{ width: `${(c.revenue / (data.top_clients[0]?.revenue || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pipeline pie */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">פייפליין לפי שלב</CardTitle>
              </CardHeader>
              <CardContent>
                {pipelineForPie.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">אין נתונים</p>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={pipelineForPie}
                        cx="50%" cy="50%"
                        innerRadius={45} outerRadius={70}
                        dataKey="value"
                      >
                        {pipelineForPie.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => fmt(Number(v))} />
                      <Legend
                        iconSize={8}
                        formatter={v => <span style={{ fontSize: 11 }}>{v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent wins */}
          {data.recent_wins.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">עסקאות אחרונות שנסגרו ✓</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-slate-100">
                  {data.recent_wins.map((w, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">
                          ✓
                        </div>
                        <span className="text-sm font-medium text-slate-700">{w.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400">{w.date}</span>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 font-bold">
                          {fmt(w.value)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
