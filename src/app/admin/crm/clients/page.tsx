import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, Mail, Phone, Building } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "info" }> = {
    active: { label: "פעיל", variant: "success" },
    inactive: { label: "לא פעיל", variant: "warning" },
    lead: { label: "ליד", variant: "info" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">לקוחות</h2>
          <p className="text-muted-foreground">{clients?.length ?? 0} לקוחות במערכת</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          לקוח חדש
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "פעילים", value: clients?.filter(c => c.status === "active").length ?? 0, color: "text-green-600", bg: "bg-green-50" },
          { label: "לידים", value: clients?.filter(c => c.status === "lead").length ?? 0, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "לא פעילים", value: clients?.filter(c => c.status === "inactive").length ?? 0, color: "text-gray-600", bg: "bg-gray-50" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${s.bg}`}>
                <Users className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">כל הלקוחות</CardTitle>
        </CardHeader>
        <CardContent>
          {clients && clients.length > 0 ? (
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-3 py-2 text-xs font-medium text-muted-foreground uppercase border-b">
                <span>שם / חברה</span>
                <span>פרטי קשר</span>
                <span>סטטוס</span>
                <span>נוסף</span>
              </div>
              {clients.map((client) => {
                const status = statusConfig[client.status] ?? { label: client.status, variant: "info" as const };
                return (
                  <div
                    key={client.id}
                    className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-3 py-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer items-center"
                  >
                    <div>
                      <p className="font-medium text-sm">{client.contact_name}</p>
                      {client.company_name && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building className="h-3 w-3" />
                          {client.company_name}
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                    <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(client.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <h3 className="font-semibold mb-1">אין לקוחות עדיין</h3>
              <p className="text-sm text-muted-foreground mb-4">התחל בהוספת הלקוח הראשון</p>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                הוסף לקוח
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
