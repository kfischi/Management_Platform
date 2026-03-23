import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Key, Webhook, Bell, Palette, Building, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">הגדרות מערכת</h2>
        <p className="text-muted-foreground">הגדרת API keys, חיבורים, ו-webhooks</p>
      </div>

      <Tabs defaultValue="integrations">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="integrations" className="gap-1.5">🔗 אינטגרציות</TabsTrigger>
          <TabsTrigger value="agency" className="gap-1.5">🏢 סוכנות</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">🔔 התראות</TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-1.5">⚡ Webhooks</TabsTrigger>
        </TabsList>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-4 space-y-4">
          {/* GitHub */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                🐙 GitHub API
                <Badge variant="success" className="text-xs">מחובר</Badge>
              </CardTitle>
              <CardDescription>גישה ל-repositories, webhooks, ו-deployments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Personal Access Token</Label>
                  <Input type="password" value="ghp_••••••••••••••••" readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label>Organization (אופציונלי)</Label>
                  <Input placeholder="my-org" />
                </div>
              </div>
              <Button size="sm">שמור</Button>
            </CardContent>
          </Card>

          {/* Netlify */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                🌐 Netlify API
                <Badge variant="success" className="text-xs">מחובר</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Netlify Personal Access Token</Label>
                <Input type="password" value="••••••••••••••••" readOnly />
              </div>
              <Button size="sm">שמור</Button>
            </CardContent>
          </Card>

          {/* N8N */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                ⚡ N8N
                <Badge variant="success" className="text-xs">מחובר</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>N8N URL</Label>
                  <Input placeholder="https://n8n.yourdomain.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>API Key</Label>
                  <Input type="password" placeholder="n8n_api_••••••••" />
                </div>
              </div>
              <Button size="sm">שמור</Button>
            </CardContent>
          </Card>

          {/* Coolify */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                🖥️ Coolify API
                <Badge variant="success" className="text-xs">מחובר</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Coolify URL</Label>
                  <Input placeholder="https://coolify.yourdomain.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>API Token</Label>
                  <Input type="password" placeholder="••••••••••••••••" />
                </div>
              </div>
              <Button size="sm">שמור</Button>
            </CardContent>
          </Card>

          {/* WhatsApp */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                💬 WhatsApp Business
                <Badge variant="warning" className="text-xs">דורש הגדרה</Badge>
              </CardTitle>
              <CardDescription>Meta Business Cloud API + Evolution API (חינם)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Phone Number ID</Label>
                  <Input placeholder="1234567890" />
                </div>
                <div className="space-y-1.5">
                  <Label>Access Token</Label>
                  <Input type="password" placeholder="EAABsbCS0..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Verify Token (Webhook)</Label>
                  <Input placeholder="my-secret-token" />
                </div>
                <div className="space-y-1.5">
                  <Label>Evolution API URL (חינם)</Label>
                  <Input placeholder="https://evo.yourdomain.com" />
                </div>
              </div>
              <Button size="sm">שמור וחבר</Button>
            </CardContent>
          </Card>

          {/* AI */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                🤖 AI Providers
                <Badge variant="success" className="text-xs">Claude מחובר</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Anthropic (Claude) API Key</Label>
                  <Input type="password" value="sk-ant-••••••••" readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label>OpenAI API Key</Label>
                  <Input type="password" placeholder="sk-••••••••" />
                </div>
              </div>
              <Button size="sm">שמור</Button>
            </CardContent>
          </Card>

          {/* Email */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                📧 Email Provider
                <Badge variant="success" className="text-xs">Resend מחובר</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Resend API Key</Label>
                  <Input type="password" value="re_••••••••" readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label>From Email</Label>
                  <Input placeholder="no-reply@youragency.com" />
                </div>
              </div>
              <Button size="sm">שמור</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agency Settings */}
        <TabsContent value="agency" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">פרטי הסוכנות</CardTitle>
              <CardDescription>המידע מוצג ב-Client Portal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>שם הסוכנות</Label>
                  <Input defaultValue="NBH Agency" />
                </div>
                <div className="space-y-1.5">
                  <Label>אימייל ראשי</Label>
                  <Input defaultValue="info@nbh.co.il" />
                </div>
                <div className="space-y-1.5">
                  <Label>טלפון</Label>
                  <Input defaultValue="+972-50-1234567" />
                </div>
                <div className="space-y-1.5">
                  <Label>WhatsApp Support</Label>
                  <Input defaultValue="+972501234567" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>לוגו URL</Label>
                <Input placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label>Primary Color (Brand)</Label>
                <div className="flex gap-2">
                  <Input type="color" defaultValue="#6366f1" className="w-16 h-9 p-1" />
                  <Input defaultValue="#6366f1" />
                </div>
              </div>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                שמור הגדרות
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">הגדרות התראות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Deploy חדש", desc: "כשאתר עולה לאוויר", wa: true, email: true },
                { label: "Deploy נכשל", desc: "כשיש שגיאה בפרסום", wa: true, email: true },
                { label: "לקוח חדש", desc: "כשנרשם לקוח חדש", wa: true, email: false },
                { label: "תשלום התקבל", desc: "כשנכנס תשלום", wa: true, email: true },
                { label: "תשלום באיחור", desc: "תזכורת אוטומטית", wa: true, email: true },
                { label: "ליד חדש", desc: "כשמגיע ליד ממטופס", wa: true, email: false },
                { label: "שגיאת שרת", desc: "בעיה ב-Coolify", wa: true, email: true },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input type="checkbox" defaultChecked={n.wa} className="rounded" />
                      💬 WhatsApp
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input type="checkbox" defaultChecked={n.email} className="rounded" />
                      📧 Email
                    </label>
                  </div>
                </div>
              ))}
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                שמור
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Webhook className="h-4 w-4" />
                Webhook Endpoints
              </CardTitle>
              <CardDescription>הוסף את הכתובות האלה ב-services החיצוניים</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "GitHub Events", path: "/api/webhooks/github", secret: true },
                { name: "Netlify Deploy Hook", path: "/api/webhooks/netlify", secret: true },
                { name: "WhatsApp Messages", path: "/api/webhooks/whatsapp", secret: true },
                { name: "Form Lead Capture", path: "/api/webhooks/leads", secret: false },
                { name: "Coolify Events", path: "/api/webhooks/coolify", secret: true },
                { name: "N8N Callbacks", path: "/api/webhooks/n8n", secret: true },
                { name: "Stripe Payments", path: "/api/webhooks/stripe", secret: true },
              ].map((endpoint) => (
                <div key={endpoint.path} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{endpoint.name}</p>
                    <code className="text-xs text-muted-foreground font-mono">
                      POST {"{BASE_URL}"}{endpoint.path}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    {endpoint.secret && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Key className="h-2.5 w-2.5" />
                        Secret
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      העתק URL
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
