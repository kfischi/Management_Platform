import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, TrendingUp, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function PaymentsPage() {
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("*, clients(contact_name, company_name)")
    .order("due_date", { ascending: false });

  const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "info"; icon: typeof CheckCircle2 }> = {
    paid: { label: "שולם", variant: "success", icon: CheckCircle2 },
    pending: { label: "ממתין", variant: "warning", icon: Clock },
    overdue: { label: "איחור", variant: "destructive", icon: AlertCircle },
    cancelled: { label: "בוטל", variant: "info", icon: AlertCircle },
  };

  const totalPaid = payments?.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const totalPending = payments?.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const totalOverdue = payments?.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">תשלומים</h2>
          <p className="text-muted-foreground">{payments?.length ?? 0} תשלומים במערכת</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          תשלום חדש
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
                <p className="text-xs text-muted-foreground">התקבל</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-yellow-50">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-yellow-700">{formatCurrency(totalPending)}</p>
                <p className="text-xs text-muted-foreground">ממתין</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-red-50">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-red-700">{formatCurrency(totalOverdue)}</p>
                <p className="text-xs text-muted-foreground">באיחור</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            כל התשלומים
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-3 py-2 text-xs font-medium text-muted-foreground uppercase border-b">
                <span>לקוח / תיאור</span>
                <span>סכום</span>
                <span>תאריך יעד</span>
                <span>סטטוס</span>
              </div>
              {payments.map((payment) => {
                const status = statusConfig[payment.status] ?? statusConfig.pending;
                const client = payment.clients as { contact_name: string; company_name: string | null } | null;
                return (
                  <div
                    key={payment.id}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-3 py-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer items-center"
                  >
                    <div>
                      <p className="font-medium text-sm">{client?.contact_name ?? "לא ידוע"}</p>
                      {payment.description && (
                        <p className="text-xs text-muted-foreground truncate">{payment.description}</p>
                      )}
                    </div>
                    <span className="font-semibold text-sm whitespace-nowrap">
                      {formatCurrency(payment.amount, payment.currency)}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(payment.due_date)}
                    </span>
                    <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <h3 className="font-semibold mb-1">אין תשלומים עדיין</h3>
              <p className="text-sm text-muted-foreground mb-4">הוסף תשלום ראשון</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
