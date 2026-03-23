import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, CreditCard, Zap, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [sites, clients, payments, automations] = await Promise.all([
    supabase.from("sites").select("id, status", { count: "exact" }),
    supabase.from("clients").select("id, status", { count: "exact" }),
    supabase.from("payments").select("amount, status", { count: "exact" }),
    supabase.from("automations").select("id, is_active", { count: "exact" }),
  ]);

  const totalRevenue = payments.data
    ?.filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0) ?? 0;

  const pendingPayments = payments.data
    ?.filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0) ?? 0;

  return {
    sites: { total: sites.count ?? 0, active: sites.data?.filter(s => s.status === "active").length ?? 0 },
    clients: { total: clients.count ?? 0, active: clients.data?.filter(c => c.status === "active").length ?? 0 },
    revenue: { total: totalRevenue, pending: pendingPayments },
    automations: { total: automations.count ?? 0, active: automations.data?.filter(a => a.is_active).length ?? 0 },
  };
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const stats = await getStats(supabase);

  // Recent sites
  const { data: recentSites } = await supabase
    .from("sites")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // Overdue payments
  const { data: overduePayments } = await supabase
    .from("payments")
    .select("*, clients(contact_name)")
    .eq("status", "overdue")
    .limit(5);

  const statCards = [
    {
      title: "אתרים פעילים",
      value: `${stats.sites.active}/${stats.sites.total}`,
      icon: Globe,
      color: "text-blue-600",
      bg: "bg-blue-50",
      description: "אתרים במערכת",
    },
    {
      title: "לקוחות פעילים",
      value: `${stats.clients.active}/${stats.clients.total}`,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
      description: "לקוחות במערכת",
    },
    {
      title: "הכנסות",
      value: formatCurrency(stats.revenue.total),
      icon: CreditCard,
      color: "text-purple-600",
      bg: "bg-purple-50",
      description: `${formatCurrency(stats.revenue.pending)} בהמתנה`,
    },
    {
      title: "אוטומציות",
      value: `${stats.automations.active}/${stats.automations.total}`,
      icon: Zap,
      color: "text-orange-600",
      bg: "bg-orange-50",
      description: "workflows פעילים",
    },
  ];

  const statusMap: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "info" }> = {
    active: { label: "פעיל", variant: "success" },
    building: { label: "בנייה", variant: "warning" },
    error: { label: "שגיאה", variant: "destructive" },
    paused: { label: "מושהה", variant: "info" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">דשבורד</h2>
        <p className="text-muted-foreground">סקירה כללית של הסוכנות</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${card.bg}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sites */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              אתרים אחרונים
            </CardTitle>
            <CardDescription>5 האתרים האחרונים שנוספו</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSites && recentSites.length > 0 ? (
              <div className="space-y-3">
                {recentSites.map((site) => {
                  const status = statusMap[site.status] ?? { label: site.status, variant: "info" as const };
                  return (
                    <div key={site.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{site.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {site.domain || site.netlify_url || "אין דומיין"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Globe className="h-10 w-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">אין אתרים עדיין</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              תשלומים באיחור
            </CardTitle>
            <CardDescription>דורשים טיפול מיידי</CardDescription>
          </CardHeader>
          <CardContent>
            {overduePayments && overduePayments.length > 0 ? (
              <div className="space-y-3">
                {overduePayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">
                        {(payment.clients as { contact_name: string } | null)?.contact_name ?? "לקוח לא ידוע"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        תאריך יעד: {formatDate(payment.due_date)}
                      </p>
                    </div>
                    <Badge variant="destructive">{formatCurrency(payment.amount)}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500/40 mb-2" />
                <p className="text-sm text-muted-foreground">אין תשלומים באיחור</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            פעולות מהירות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "אתר חדש", href: "/admin/sites?new=true", icon: "🌐" },
              { label: "לקוח חדש", href: "/admin/crm/clients?new=true", icon: "👤" },
              { label: "חוזה חדש", href: "/admin/crm/contracts?new=true", icon: "📄" },
              { label: "אוטומציה חדשה", href: "/admin/automations?new=true", icon: "⚡" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="font-medium text-sm">{action.label}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
