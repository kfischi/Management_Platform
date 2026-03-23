import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Mail, Send, Phone, Users, Plus, CheckCircle2, Clock, TrendingUp } from "lucide-react";

const mockConversations = [
  { id: "c1", contact: "ישראל ישראלי", phone: "+972501234567", lastMessage: "תודה רבה על השירות!", time: "לפני 5 דק׳", unread: 0, status: "answered" },
  { id: "c2", contact: "שרה כהן", phone: "+972521234567", lastMessage: "מתי תהיה המצגת מוכנה?", time: "לפני 23 דק׳", unread: 2, status: "pending" },
  { id: "c3", contact: "דוד לוי", phone: "+972531234567", lastMessage: "אני רוצה לשדרג את החבילה", time: "לפני שעה", unread: 1, status: "pending" },
];

const mockEmails = [
  { id: "e1", to: "client@example.com", subject: "ברוכים הבאים ל-NBH!", status: "delivered", sentAt: "היום, 09:00" },
  { id: "e2", to: "lead@example.com", subject: "הצעת מחיר לאתר", status: "opened", sentAt: "אתמול, 14:30" },
  { id: "e3", to: "partner@example.com", subject: "תזכורת פגישה", status: "sent", sentAt: "אתמול, 10:00" },
];

export default function CommunicationsPage() {
  const pendingCount = mockConversations.filter(c => c.status === "pending").length;
  const totalUnread = mockConversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">תקשורת</h2>
          <p className="text-muted-foreground">
            {totalUnread} הודעות לא נקראו · {pendingCount} שיחות ממתינות
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            אימייל חדש
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
          { label: "שיחות WhatsApp", value: mockConversations.length, icon: MessageSquare, color: "text-green-600", bg: "bg-green-50" },
          { label: "אימיילים נשלחו", value: "124", icon: Mail, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "SMS נשלחו", value: "45", icon: Phone, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "קמפיינים פעילים", value: "3", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
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

      <Tabs defaultValue="whatsapp">
        <TabsList className="grid w-full grid-cols-3 max-w-sm">
          <TabsTrigger value="whatsapp" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            אימייל
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            קמפיינים
          </TabsTrigger>
        </TabsList>

        {/* WhatsApp */}
        <TabsContent value="whatsapp" className="space-y-4 mt-4">
          <Card className="border-green-200 bg-green-50/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💬</span>
                <div>
                  <p className="font-medium">WhatsApp Business API</p>
                  <p className="text-xs text-muted-foreground">מחובר דרך Meta Cloud API · דרך N8N Evolution API</p>
                </div>
              </div>
              <Badge variant="success">מחובר</Badge>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Conversations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">שיחות פעילות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockConversations.map((conv) => (
                  <div key={conv.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 shrink-0">
                      <span className="text-sm font-medium text-green-700">
                        {conv.contact.split(" ")[0][0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{conv.contact}</p>
                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-xs shrink-0">
                        {conv.unread}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Send */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">שלח הודעה</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  type="tel"
                  placeholder="+972501234567"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  dir="ltr"
                />
                <textarea
                  placeholder="כתוב הודעת WhatsApp..."
                  rows={4}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    📎 קובץ
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    🖼️ תמונה
                  </Button>
                  <Button size="sm" className="flex-1 gap-1">
                    <Send className="h-3.5 w-3.5" />
                    שלח
                  </Button>
                </div>

                {/* Templates */}
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-2">תבניות מהירות:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["ברוך הבא!", "תזכורת תשלום", "האתר שלך עלה!", "פגישה מחר"].map((t) => (
                      <button key={t} className="text-xs bg-accent rounded px-2 py-1 hover:bg-accent/80 transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: "Resend", status: true, icon: "📧", sent: "89" },
              { name: "SendGrid", status: false, icon: "📬", sent: "—" },
              { name: "SMTP Custom", status: false, icon: "📮", sent: "—" },
            ].map((provider) => (
              <Card key={provider.name} className={provider.status ? "border-blue-200 bg-blue-50/30" : ""}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{provider.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{provider.name}</p>
                      <p className="text-xs text-muted-foreground">{provider.sent} נשלחו</p>
                    </div>
                  </div>
                  <Badge variant={provider.status ? "success" : "secondary"} className="text-xs">
                    {provider.status ? "פעיל" : "לא מוגדר"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">אימיילים אחרונים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockEmails.map((email) => (
                  <div key={email.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{email.subject}</p>
                        <p className="text-xs text-muted-foreground">{email.to}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{email.sentAt}</span>
                      <Badge
                        variant={email.status === "delivered" || email.status === "opened" ? "success" : "info"}
                        className="text-xs"
                      >
                        {email.status === "delivered" ? "נמסר" : email.status === "opened" ? "נפתח" : "נשלח"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns */}
        <TabsContent value="campaigns" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: "קמפיין ברוך הבא", type: "WhatsApp", status: "פעיל", sent: 45, opened: "100%" },
              { name: "תזכורת חודשית", type: "Email", status: "פעיל", sent: 120, opened: "67%" },
              { name: "אפסייל חבילות", type: "Email + SMS", status: "טיוטה", sent: 0, opened: "—" },
            ].map((campaign) => (
              <Card key={campaign.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">{campaign.name}</p>
                      <Badge variant="secondary" className="text-xs mt-1">{campaign.type}</Badge>
                    </div>
                    <Badge variant={campaign.status === "פעיל" ? "success" : "warning"} className="text-xs">
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground text-base">{campaign.sent}</p>
                      <p>נשלחו</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-base">{campaign.opened}</p>
                      <p>פתיחות</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-3 text-xs">
                    ערוך קמפיין
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            קמפיין חדש
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
