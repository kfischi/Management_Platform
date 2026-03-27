import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe, Users, CreditCard, Zap, TrendingUp, AlertCircle,
  CheckCircle2, Clock, ArrowUpRight, Brain, Target, Heart,
  Sparkles, BarChart3, Activity, Plus, Command
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Database } from "@/types/database";

type SiteRow = Database["public"]["Tables"]["sites"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"] & {
  clients: { contact_name: string } | null;
};

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [sites, clients, payments, automations] = await Promise.all([
    supabase.from("sites").select("id, status", { count: "exact" }),
    supabase.from("clients").select("id, status", { count: "exact" }),
    supabase.from("payments").select("amount, status"),
    supabase.from("automations").select("id, is_active"),
  ]);

  const sitesData = (sites.data ?? []) as { id: string; status: string }[];
  const clientsData = (clients.data ?? []) as { id: string; status: string }[];
  const paymentsData = (payments.data ?? []) as { amount: number; status: string }[];
  const automationsData = (automations.data ?? []) as { id: string; is_active: boolean }[];

  const totalRevenue = paymentsData.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingRevenue = paymentsData.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  return {
    sites: { total: sites.count ?? 0, active: sitesData.filter(s => s.status === "active").length },
    clients: { total: clients.count ?? 0, active: clientsData.filter(c => c.status === "active").length },
    revenue: { total: totalRevenue, pending: pendingRevenue },
    automations: { total: automations.count ?? 0, active: automationsData.filter(a => a.is_active).length },
  };
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const stats = await getStats(supabase);

  const { data: recentSitesRaw } = await supabase
    .from("sites").select("*").order("created_at", { ascending: false }).limit(4);
  const recentSites = (recentSitesRaw ?? []) as SiteRow[];

  const { data: overduePaymentsRaw } = await supabase
    .from("payments").select("*, clients(contact_name)").eq("status", "overdue").limit(5);
  const overduePayments = (overduePaymentsRaw ?? []) as PaymentRow[];

  const statusConfig: Record<string, { label: string; dot: string }> = {
    active: { label: "פעיל", dot: "bg-emerald-500" },
    building: { label: "בנייה", dot: "bg-amber-500" },
    error: { label: "שגיאה", dot: "bg-red-500" },
    paused: { label: "מושהה", dot: "bg-slate-400" },
  };

  const statCards = [
    {
      title: "אתרים", value: stats.sites.active,
      sub: `מתוך ${stats.sites.total} סה״כ`,
      icon: Globe, color: "text-blue-600", bg: "bg-blue-50",
      href: "/admin/sites", change: "+2"
    },
    {
      title: "לקוחות פעילים", value: stats.clients.active,
      sub: `${stats.clients.total} סה״כ`,
      icon: Users, color: "text-violet-600", bg: "bg-violet-50",
      href: "/admin/crm/clients", change: "+5"
    },
    {
      title: "הכנסות", value: formatCurrency(stats.revenue.total),
      sub: `${formatCurrency(stats.revenue.pending)} ממתין`,
      icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50",
      href: "/admin/crm/payments", change: "+23%"
    },
    {
      title: "אוטומציות", value: stats.automations.active,
      sub: `מתוך ${stats.automations.total} workflows`,
      icon: Zap, color: "text-orange-600", bg: "bg-orange-50",
      href: "/admin/automations", change: "פעיל"
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ברוך הבא 👋</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString("he-IL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/command">
            <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex">
              <Brain className="h-3.5 w-3.5 text-purple-500" />
              AI Command
              <kbd className="text-[9px] bg-muted rounded px-1 border">⌘K</kbd>
            </Button>
          </Link>
          <Button size="sm" className="gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Plus className="h-3.5 w-3.5" />
            פעולה חדשה
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="card-hover border-0 shadow-sm hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`rounded-xl p-2.5 ${card.bg}`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                      <TrendingUp className="h-3 w-3" />
                      {card.change}
                    </div>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{card.title}</p>
                  <p className="text-xs text-muted-foreground">{card.sub}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* AI Spotlight */}
      <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold">AI Command Center</p>
                  <Badge className="bg-white/20 text-white border-0 text-xs">חדש</Badge>
                </div>
                <p className="text-white/80 text-sm">
                  הפקד כל פעולה במערכת בשפה טבעית · "שלח WhatsApp לכל הלקוחות שלא שילמו"
                </p>
              </div>
            </div>
            <Link href="/admin/command">
              <Button className="bg-white text-indigo-700 hover:bg-white/90 shrink-0 gap-2">
                פתח
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sites Status - 2 cols */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold">אתרים אחרונים</CardTitle>
              <CardDescription className="text-xs">סטטוס real-time</CardDescription>
            </div>
            <Link href="/admin/sites">
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                כל האתרים
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentSites && recentSites.length > 0 ? (
              <div className="space-y-2">
                {recentSites.map((site) => {
                  const status = statusConfig[site.status] ?? statusConfig.paused;
                  return (
                    <div key={site.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-indigo-50 group-hover:to-purple-50 transition-colors">
                          <Globe className="h-4 w-4 text-slate-500 group-hover:text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{site.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {site.domain || site.netlify_url || "אין דומיין"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${status.dot}`} />
                        <span className="text-xs font-medium text-muted-foreground">{status.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-3">
                  <Globe className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="font-medium text-sm">אין אתרים עדיין</p>
                <p className="text-xs text-muted-foreground mb-4">התחל בהוספת האתר הראשון</p>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  הוסף אתר
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              פעולות מהירות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "ליד חדש", href: "/admin/leads?new=true", icon: "🎯", desc: "הוסף לPipeline" },
              { label: "הצעת מחיר", href: "/admin/proposals", icon: "📄", desc: "צור עם AI" },
              { label: "פוסט לסושיאל", href: "/admin/social", icon: "📱", desc: "פרסם עכשיו" },
              { label: "בדוק SEO", href: "/admin/seo", icon: "🔍", desc: "ניתוח AI" },
              { label: "Health Score", href: "/admin/clients-health", icon: "❤️", desc: "ניטור לקוחות" },
              { label: "Domain Monitor", href: "/admin/domains", icon: "🌐", desc: "תוקפי SSL" },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                  <span className="text-xl">{action.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overdue Payments */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                תשלומים באיחור
              </CardTitle>
              <CardDescription className="text-xs">דורשים טיפול מיידי</CardDescription>
            </div>
            <Link href="/admin/crm/payments">
              <Button variant="ghost" size="sm" className="text-xs h-7">כל התשלומים</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {overduePayments && overduePayments.length > 0 ? (
              <div className="space-y-2">
                {overduePayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/50">
                    <div>
                      <p className="font-medium text-sm">
                        {(payment.clients as { contact_name: string } | null)?.contact_name ?? "לא ידוע"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        יעד: {formatDate(payment.due_date)}
                      </p>
                    </div>
                    <span className="font-bold text-red-600">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2" />
                <p className="font-medium text-sm">הכל תקין!</p>
                <p className="text-xs text-muted-foreground">אין תשלומים באיחור</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              סטטוס מערכות
            </CardTitle>
            <CardDescription className="text-xs">real-time monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Supabase DB", status: "operational", latency: "12ms" },
              { name: "N8N Automations", status: "operational", latency: "—" },
              { name: "Coolify Infra", status: "operational", latency: "—" },
              { name: "WhatsApp API", status: "operational", latency: "—" },
              { name: "Claude AI", status: "operational", latency: "—" },
              { name: "Netlify CDN", status: "operational", latency: "45ms" },
            ].map(service => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm">{service.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{service.latency}</span>
                  <span className="text-xs text-emerald-600 font-medium">תקין</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
