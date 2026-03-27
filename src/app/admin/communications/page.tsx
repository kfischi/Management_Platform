"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Mail, Send, Phone, Users, Plus, CheckCircle2, Clock, TrendingUp, Loader2, RefreshCw, Bell } from "lucide-react";

interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

interface ResendEmail {
  id: string;
  to: string[];
  subject: string;
  created_at: string;
  last_event: string;
}

interface CommData {
  notifications: NotificationRow[];
  whatsappConnected: boolean;
  resendConnected: boolean;
  resendEmails: ResendEmail[];
  stats: { totalNotifications: number; unread: number };
}

const EMPTY: CommData = {
  notifications: [],
  whatsappConnected: false,
  resendConnected: false,
  resendEmails: [],
  stats: { totalNotifications: 0, unread: 0 },
};

export default function CommunicationsPage() {
  const [data, setData] = useState<CommData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  // WhatsApp send form
  const [waPhone, setWaPhone] = useState("");
  const [waMsg, setWaMsg] = useState("");
  // Email send form
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMsg, setEmailMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/communications");
      if (res.ok) setData(await res.json());
    } catch { /* keep empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function send(channel: "whatsapp" | "email") {
    setSending(true);
    setSendResult(null);
    const body = channel === "whatsapp"
      ? { channel, to: waPhone, message: waMsg }
      : { channel, to: emailTo, message: emailMsg, subject: emailSubject };

    try {
      const res = await fetch("/api/admin/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) {
        setSendResult("✓ נשלח בהצלחה!");
        if (channel === "whatsapp") { setWaPhone(""); setWaMsg(""); }
        else { setEmailTo(""); setEmailSubject(""); setEmailMsg(""); }
        await load();
      } else {
        setSendResult(`שגיאה: ${json.error}`);
      }
    } catch {
      setSendResult("שגיאת רשת");
    }
    setSending(false);
  }

  const { notifications, whatsappConnected, resendConnected, resendEmails, stats } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">תקשורת</h2>
          <p className="text-muted-foreground">
            {stats.unread} הודעות לא נקראו · {notifications.length} נוטיפיקציות
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            רענן
          </Button>
          <Button className="gap-2">
            <MessageSquare className="h-4 w-4" />
            הודעת WhatsApp
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "נוטיפיקציות", value: stats.totalNotifications, icon: Bell, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "לא נקראו", value: stats.unread, icon: MessageSquare, color: "text-green-600", bg: "bg-green-50" },
          { label: "אימיילים", value: resendEmails.length, icon: Mail, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "WhatsApp", value: whatsappConnected ? "מחובר" : "לא מחובר", icon: Phone, color: whatsappConnected ? "text-green-600" : "text-gray-400", bg: whatsappConnected ? "bg-green-50" : "bg-gray-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`rounded-lg p-2.5 ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="notifications">
        <TabsList className="grid w-full grid-cols-3 max-w-sm">
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            נוטיפיקציות
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            אימייל
          </TabsTrigger>
        </TabsList>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">נוטיפיקציות מערכת</CardTitle>
              <CardDescription className="text-xs">הודעות שנשלחו למשתמשים מהמערכת</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">אין נוטיפיקציות עדיין</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${!n.read ? "bg-primary/5 border border-primary/10" : "hover:bg-accent/40"}`}>
                      <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${!n.read ? "bg-primary" : "bg-transparent"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {new Date(n.created_at).toLocaleDateString("he-IL")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                        <Badge variant="secondary" className="text-xs mt-1">{n.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp */}
        <TabsContent value="whatsapp" className="space-y-4 mt-4">
          <Card className={whatsappConnected ? "border-green-200 bg-green-50/30" : "border-amber-200 bg-amber-50/30"}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💬</span>
                <div>
                  <p className="font-medium">WhatsApp Business</p>
                  <p className="text-xs text-muted-foreground">
                    {whatsappConnected ? "מחובר דרך Evolution API / N8N" : "לא מוגדר — הגדר בהגדרות"}
                  </p>
                </div>
              </div>
              <Badge variant={whatsappConnected ? "success" : "warning"}>
                {whatsappConnected ? "מחובר" : "לא מחובר"}
              </Badge>
            </CardContent>
          </Card>

          {!whatsappConnected && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  כדי לשלוח הודעות WhatsApp, הגדר Evolution API URL ו-API Key בהגדרות.
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/admin/settings"}>
                  עבור להגדרות
                </Button>
              </CardContent>
            </Card>
          )}

          {whatsappConnected && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">שלח הודעת WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  type="tel"
                  value={waPhone}
                  onChange={e => setWaPhone(e.target.value)}
                  placeholder="+972501234567"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  dir="ltr"
                />
                <textarea
                  value={waMsg}
                  onChange={e => setWaMsg(e.target.value)}
                  placeholder="כתוב הודעת WhatsApp..."
                  rows={4}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
                {sendResult && (
                  <p className={`text-sm ${sendResult.startsWith("✓") ? "text-green-600" : "text-red-600"}`}>{sendResult}</p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1" onClick={() => send("whatsapp")} disabled={sending || !waPhone || !waMsg}>
                    {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    שלח
                  </Button>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-2">תבניות מהירות:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["ברוך הבא! 👋", "תזכורת תשלום", "האתר שלך עלה! 🚀", "פגישה מחר ב-10:00"].map((t) => (
                      <button key={t} onClick={() => setWaMsg(t)} className="text-xs bg-accent rounded px-2 py-1 hover:bg-accent/80 transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Email */}
        <TabsContent value="email" className="space-y-4 mt-4">
          <Card className={resendConnected ? "border-blue-200 bg-blue-50/30" : "border-amber-200 bg-amber-50/30"}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📧</span>
                <div>
                  <p className="font-medium">Resend Email</p>
                  <p className="text-xs text-muted-foreground">
                    {resendConnected ? `${resendEmails.length} אימיילים נשלחו` : "לא מוגדר — הגדר Resend API Key בהגדרות"}
                  </p>
                </div>
              </div>
              <Badge variant={resendConnected ? "success" : "warning"}>
                {resendConnected ? "מחובר" : "לא מחובר"}
              </Badge>
            </CardContent>
          </Card>

          {resendConnected && (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Send form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">שלח אימייל</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <input
                    type="email"
                    value={emailTo}
                    onChange={e => setEmailTo(e.target.value)}
                    placeholder="to@example.com"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    dir="ltr"
                  />
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    placeholder="נושא האימייל"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <textarea
                    value={emailMsg}
                    onChange={e => setEmailMsg(e.target.value)}
                    placeholder="תוכן ההודעה..."
                    rows={4}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                  {sendResult && (
                    <p className={`text-sm ${sendResult.startsWith("✓") ? "text-green-600" : "text-red-600"}`}>{sendResult}</p>
                  )}
                  <Button size="sm" className="w-full gap-1" onClick={() => send("email")} disabled={sending || !emailTo || !emailMsg}>
                    {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    שלח אימייל
                  </Button>
                </CardContent>
              </Card>

              {/* Sent emails */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">אימיילים אחרונים</CardTitle>
                </CardHeader>
                <CardContent>
                  {resendEmails.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">אין אימיילים עדיין</p>
                  ) : (
                    <div className="space-y-2">
                      {resendEmails.map(email => (
                        <div key={email.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{email.subject}</p>
                              <p className="text-xs text-muted-foreground">{email.to?.join(", ")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {new Date(email.created_at).toLocaleDateString("he-IL")}
                            </span>
                            <Badge
                              variant={email.last_event === "delivered" || email.last_event === "opened" ? "success" : "info"}
                              className="text-xs"
                            >
                              {email.last_event === "delivered" ? "נמסר" : email.last_event === "opened" ? "נפתח" : email.last_event ?? "נשלח"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {!resendConnected && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  כדי לשלוח אימיילים, הגדר Resend API Key בהגדרות.
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/admin/settings"}>
                  עבור להגדרות
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
