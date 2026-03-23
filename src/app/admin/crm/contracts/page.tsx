import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Download } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function ContractsPage() {
  const supabase = await createClient();

  const { data: contracts } = await supabase
    .from("contracts")
    .select("*, clients(contact_name, company_name)")
    .order("created_at", { ascending: false });

  const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "info" }> = {
    active: { label: "פעיל", variant: "success" },
    pending: { label: "ממתין", variant: "warning" },
    expired: { label: "פג תוקף", variant: "destructive" },
    cancelled: { label: "בוטל", variant: "info" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">חוזים</h2>
          <p className="text-muted-foreground">{contracts?.length ?? 0} חוזים במערכת</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          חוזה חדש
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            כל החוזים
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contracts && contracts.length > 0 ? (
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-3 py-2 text-xs font-medium text-muted-foreground uppercase border-b">
                <span>חוזה</span>
                <span>לקוח</span>
                <span>סכום</span>
                <span>תאריכים</span>
                <span>סטטוס</span>
              </div>
              {contracts.map((contract) => {
                const status = statusConfig[contract.status] ?? { label: contract.status, variant: "info" as const };
                const client = contract.clients as { contact_name: string; company_name: string | null } | null;
                return (
                  <div
                    key={contract.id}
                    className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-3 py-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer items-center"
                  >
                    <div>
                      <p className="font-medium text-sm">{contract.title}</p>
                      {contract.description && (
                        <p className="text-xs text-muted-foreground truncate">{contract.description}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm">{client?.contact_name ?? "לא ידוע"}</p>
                      {client?.company_name && (
                        <p className="text-xs text-muted-foreground">{client.company_name}</p>
                      )}
                    </div>
                    <span className="font-semibold text-sm whitespace-nowrap">
                      {formatCurrency(contract.amount, contract.currency)}
                    </span>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      <div>{formatDate(contract.start_date)}</div>
                      {contract.end_date && <div>→ {formatDate(contract.end_date)}</div>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                      {contract.file_url && (
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild>
                          <a href={contract.file_url} download>
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <h3 className="font-semibold mb-1">אין חוזים עדיין</h3>
              <Button size="sm" className="mt-3 gap-2">
                <Plus className="h-4 w-4" />
                הוסף חוזה
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
