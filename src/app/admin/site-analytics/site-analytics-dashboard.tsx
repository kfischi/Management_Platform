"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart2, Eye, Users, Globe, TrendingUp, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type Site = { id: string; name: string; domain: string | null; status: string };
type Analytics = {
  total_views: number;
  unique_visitors: number;
  by_page: { slug: string; views: number }[];
  by_day: { date: string; views: number }[];
  top_referrers: { host: string; count: number }[];
};

export default function SiteAnalyticsDashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [sitesLoading, setSitesLoading] = useState(true);

  // Load sites
  useEffect(() => {
    fetch("/api/sites")
      .then(r => r.json())
      .then((data: Site[]) => {
        setSites(data);
        if (data.length > 0) setSelectedSite(data[0].id);
      })
      .finally(() => setSitesLoading(false));
  }, []);

  const loadAnalytics = useCallback(async () => {
    if (!selectedSite) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/${selectedSite}?days=${days}`);
      const data = await res.json() as Analytics;
      setAnalytics(data);
    } finally {
      setLoading(false);
    }
  }, [selectedSite, days]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const maxDayViews = Math.max(...(analytics?.by_day.map(d => d.views) ?? [1]));

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">אנליטיקס אתרים</h1>
          <p className="text-slate-500 text-sm mt-1">צפיות, מבקרים ומקורות תנועה</p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Days filter */}
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-full border transition-colors",
                days === d
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
              )}
            >
              {d} ימים
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Site selector */}
        <div className="w-56 shrink-0">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">אתרים</h3>
          {sitesLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
          ) : (
            <div className="space-y-1">
              {sites.map(site => (
                <button
                  key={site.id}
                  onClick={() => setSelectedSite(site.id)}
                  className={cn(
                    "w-full text-right px-3 py-2.5 rounded-xl text-sm transition-colors",
                    selectedSite === site.id
                      ? "bg-indigo-600 text-white font-medium"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <div className="font-medium truncate">{site.name}</div>
                  {site.domain && (
                    <div className={cn("text-xs truncate mt-0.5", selectedSite === site.id ? "text-indigo-200" : "text-slate-400")}>
                      {site.domain}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Analytics content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : !analytics ? (
            <div className="text-center py-16 text-slate-400">בחר אתר לצפייה בנתונים</div>
          ) : (
            <div className="space-y-5">
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "סך צפיות", value: analytics.total_views, icon: <Eye className="h-5 w-5 text-indigo-500" />, color: "bg-indigo-50" },
                  { label: "מבקרים ייחודיים", value: analytics.unique_visitors, icon: <Users className="h-5 w-5 text-blue-500" />, color: "bg-blue-50" },
                ].map(kpi => (
                  <Card key={kpi.label} className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-xl", kpi.color)}>{kpi.icon}</div>
                      <div>
                        <p className="text-2xl font-bold text-slate-800">{kpi.value.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{kpi.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Views over time chart */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                    צפיות לאורך זמן
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.by_day.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">אין נתונים לתקופה זו</p>
                  ) : (
                    <div className="flex items-end gap-1 h-32">
                      {analytics.by_day.map(d => (
                        <div
                          key={d.date}
                          className="flex-1 flex flex-col items-center gap-1 group relative"
                        >
                          <div
                            className="w-full bg-indigo-200 hover:bg-indigo-400 rounded-t transition-colors"
                            style={{ height: `${Math.max(4, (d.views / maxDayViews) * 112)}px` }}
                          />
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            {d.date}: {d.views} צפיות
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                {/* Pages */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-500" />
                      עמודים פופולריים
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.by_page.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-2">אין נתונים</p>
                    ) : (
                      <div className="space-y-2">
                        {analytics.by_page.slice(0, 6).map(p => (
                          <div key={p.slug} className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 font-mono text-xs truncate flex-1">
                              /{p.slug === "home" ? "" : p.slug}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-100 rounded-full h-1.5">
                                <div
                                  className="bg-green-400 h-1.5 rounded-full"
                                  style={{ width: `${(p.views / (analytics.by_page[0]?.views || 1)) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500 w-8 text-left">{p.views}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Referrers */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-orange-500" />
                      מקורות תנועה
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.top_referrers.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-2">אין referrers</p>
                    ) : (
                      <div className="space-y-2">
                        {analytics.top_referrers.slice(0, 6).map(r => (
                          <div key={r.host} className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 text-xs truncate flex-1 font-mono ltr" dir="ltr">{r.host}</span>
                            <Badge variant="secondary" className="text-xs">{r.count}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Link to site */}
              {selectedSite && (
                <a
                  href={`/sites/${selectedSite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  פתח אתר בטאב חדש
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
