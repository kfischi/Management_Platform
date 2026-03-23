import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, Shield, UserCheck, Edit, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "info"; icon: typeof Shield }> = {
    admin: { label: "Admin", variant: "default", icon: Shield },
    client: { label: "Client", variant: "info", icon: UserCheck },
    editor: { label: "Editor", variant: "secondary", icon: Edit },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ניהול משתמשים</h2>
          <p className="text-muted-foreground">{users?.length ?? 0} משתמשים רשומים</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          הזמן משתמש
        </Button>
      </div>

      {/* Role Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(roleConfig).map(([role, config]) => {
          const Icon = config.icon;
          const count = users?.filter(u => u.role === role).length ?? 0;
          return (
            <Card key={role}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-lg p-2.5 bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{config.label}s</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">כל המשתמשים</CardTitle>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <div className="space-y-1">
              {users.map((user) => {
                const roleInfo = roleConfig[user.role] ?? roleConfig.client;
                const initials = user.full_name
                  ? user.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                  : user.email.slice(0, 2).toUpperCase();

                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{user.full_name ?? "—"}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                    <div className="hidden sm:block text-xs text-muted-foreground">
                      {user.company && <span>{user.company}</span>}
                    </div>
                    <Badge variant={roleInfo.variant} className="text-xs">{roleInfo.label}</Badge>
                    <span className="text-xs text-muted-foreground hidden md:block">
                      {formatDate(user.created_at)}
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs">
                        ערוך
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <h3 className="font-semibold mb-1">אין משתמשים עדיין</h3>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
