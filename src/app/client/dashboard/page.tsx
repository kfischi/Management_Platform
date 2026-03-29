import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Activity, CreditCard, MessageSquare, ExternalLink, Clock, CheckCircle2 } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type SiteRow = Database["public"]["Tables"]["sites"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type DeploymentRow = Database["public"]["Tables"]["deployments"]["Row"] & {
  sites: { name: string } | null;
};

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = profileRaw as ProfileRow | null;

  const { data: clientRecordRaw } = await supabase
    .from("clients")
    .select("*")
    .eq("profile_id", user.id)
    .single();
  const clientRecord = clientRecordRaw as ClientRow | null;

  const { data: sitesRaw } = await supabase
    .from("sites")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  const sites = (sitesRaw ?? []) as SiteRow[];

  const { data: paymentsRaw } = await supabase
    .from("payments")
    .select("*")
    .eq("client_id", clientRecord?.id ?? "")
    .order("due_date", { ascending: false })
    .limit(5);
  const payments = (paymentsRaw ?? []) as PaymentRow[];

  const { data: deploymentsRaw } = await supabase
    .from("deployments")
    .select("*, sites(name)")
    .in("site_id", sites.map(s => s.id))
    .order("created_at", { ascending: false })
    .limit(5);
  const deployments = (deploymentsRaw ?? []) as DeploymentRow[];

  const activeSite = sites[0] ?? null;
  const pendingPayments = payments.filter(p => p.status === "pending" || p.status === "overdue");

  const siteStatusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "info"; dot: string }> = {
    active: { label: "פעיל", variant: "success", dot: "bg-green-500" },
    building: { label: "בנייה", variant: "warning", dot: "bg-yellow-500" },
    error: { label: "שגיאה", variant: "destructive", dot: "bg-red-500" },
    paused: { label: "מושהה", variant: "info", dot: "bg-gray-400" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          שלום, {profile?.full_name ?? "לקוח"} 👋
        </h2>
        <p className="text-muted-foreground">הנה סקירה של הפרויקטים שלך</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "אתרים פעילים",
            value: sites?.filter(s => s.status === "active").length ?? 0,
            icon: Globe,
            color: "text-blue-600",
            bg: "bg-blue-50",
            href: "/client/my-site",
          },
          {
            label: "סטטוס כללי",
            value: activeSite?.status === "active" ? "תקין" : "בדיקה",
            icon: Activity,
            color: "text-green-600",
            bg: "bg-green-50",
            href: "/client/my-site",
          },
          {
            label: "תשלומים פתוחים",
            value: pendingPayments.length,
            icon: CreditCard,
            color: pendingPayments.length > 0 ? "text-red-600" : "text-green-600",
            bg: pendingPayments.length > 0 ? "bg-red-50" : "bg-green-50",
            href: "#payments",
          },
          {
            label: "פניות תמיכה",
            value: "0",
            icon: MessageSquare,
            color: "text-purple-600",
            bg: "bg-purple-50",
            href: "/client/support",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Sites */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                האתרים שלי
              </CardTitle>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/client/my-site">צפה הכל</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sites && sites.length > 0 ? (
              <div className="space-y-3">
                {sites.map((site) => {
                  const status = siteStatusConfig[site.status];
                  return (
                    <div key={site.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{site.name}</p>
                        {(site.domain || site.netlify_url) && (
                          <a
                            href={site.domain ? `https://${site.domain}` : site.netlify_url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {site.domain || site.netlify_url}
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${status.dot}`} />
                        <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Globe className="h-10 w-10 opacity-30 mb-2" />
                <p className="text-sm">אין אתרים עדיין</p>
                <p className="text-xs">צור קשר עם הסוכנות</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Deployments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              עדכוני אתר אחרונים
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deployments && deployments.length > 0 ? (
              <div className="space-y-2">
                {deployments.map((dep) => (
                  <div key={dep.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                    {dep.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : dep.status === "building" ? (
                      <Clock className="h-4 w-4 text-yellow-500 shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-red-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {dep.commit_message || "Deploy"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(dep.sites as { name: string } | null)?.name} · {formatDate(dep.created_at)}
                      </p>
                    </div>
                    <Badge
                      variant={dep.status === "success" ? "success" : dep.status === "building" ? "warning" : "destructive"}
                      className="text-xs shrink-0"
                    >
                      {dep.status === "success" ? "הצליח" : dep.status === "building" ? "בתהליך" : "נכשל"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Activity className="h-10 w-10 opacity-30 mb-2" />
                <p className="text-sm">אין עדכונים עדיין</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payments */}
      {pendingPayments.length > 0 && (
        <Card id="payments" className="border-orange-200 bg-orange-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-orange-700">
              <CreditCard className="h-4 w-4" />
              תשלומים פתוחים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-white">
                  <div>
                    <p className="font-medium text-sm">{payment.description || "תשלום"}</p>
                    <p className="text-xs text-muted-foreground">תאריך יעד: {formatDate(payment.due_date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatCurrency(payment.amount, payment.currency)}</span>
                    <Badge
                      variant={payment.status === "overdue" ? "destructive" : "warning"}
                      className="text-xs"
                    >
                      {payment.status === "overdue" ? "באיחור" : "ממתין"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Contact */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">צריך עזרה?</p>
            <p className="text-xs text-muted-foreground">צוות WMA Agency זמין לך 24/7</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5">
              💬 WhatsApp
            </Button>
            <Button size="sm" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              פתח פנייה
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
