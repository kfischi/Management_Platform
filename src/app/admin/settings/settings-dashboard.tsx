"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Key, Webhook, Check, Loader2, Copy, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";

/* ─── types ─── */
type Settings = Record<string, string>;

/* ─── helpers ─── */
function Connected({ connected }: { connected: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
      connected ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-green-500" : "bg-amber-500")} />
      {connected ? "מחובר" : "דורש הגדרה"}
    </span>
  );
}

function SecretInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-9"
      />
      <button type="button" onClick={() => setShow(v => !v)} className="absolute left-2.5 top-2.5 text-muted-foreground hover:text-slate-600">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* ─── save hook ─── */
function useSave(keys: string[], s: Settings, set: React.Dispatch<React.SetStateAction<Settings>>) {
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const { success, error } = useToast();

  async function save() {
    setSaving(true);
    const patch: Settings = {};
    keys.forEach(k => { patch[k] = s[k] ?? ""; });
    const res = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    setSaving(false);
    if (res.ok) { success("נשמר בהצלחה"); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    else error("שגיאה בשמירה");
  }

  return { saving, saved, save };
}

/* ─── component ─── */
export function SettingsDashboard({ initialSettings }: { initialSettings: Settings }) {
  const [s, setS] = React.useState<Settings>(initialSettings);
  const set = (key: string) => (val: string) => setS(prev => ({ ...prev, [key]: val }));
  const { success } = useToast();

  // Section save hooks
  const n8n      = useSave(["n8n_url","n8n_api_key"], s, setS);
  const netlify  = useSave(["netlify_token"], s, setS);
  const github   = useSave(["github_token"], s, setS);
  const whatsapp = useSave(["whatsapp_token","whatsapp_phone"], s, setS);
  const evolution = useSave(["evolution_api_key","evolution_api_url","evolution_instance","n8n_whatsapp_webhook"], s, setS);
  const ai       = useSave(["claude_api_key","openai_api_key","ai_provider"], s, setS);
  const resend   = useSave(["resend_api_key","resend_from_email"], s, setS);
  const coolify  = useSave(["coolify_url","coolify_token"], s, setS);
  const agency   = useSave(["agency_name","agency_email","agency_phone","agency_logo","brand_color","whatsapp_phone"], s, setS);

  function SaveBtn({ hook }: { hook: ReturnType<typeof useSave> }) {
    return (
      <Button size="sm" onClick={hook.save} disabled={hook.saving} className="gap-2">
        {hook.saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : hook.saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
        {hook.saved ? "נשמר!" : "שמור"}
      </Button>
    );
  }

  function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = React.useState(false);
    return (
      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); success("הועתק"); }}>
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        העתק
      </Button>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "{BASE_URL}";

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">הגדרות מערכת</h2>
        <p className="text-muted-foreground text-sm">API keys, חיבורים, ו-webhooks</p>
      </div>

      <Tabs defaultValue="integrations">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="integrations">🔗 אינטגרציות</TabsTrigger>
          <TabsTrigger value="agency">🏢 סוכנות</TabsTrigger>
          <TabsTrigger value="webhooks">⚡ Webhooks</TabsTrigger>
        </TabsList>

        {/* ── Integrations ── */}
        <TabsContent value="integrations" className="mt-4 space-y-4">

          {/* N8N */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                ⚡ N8N <Connected connected={!!s.n8n_url && !!s.n8n_api_key} />
              </CardTitle>
              <CardDescription>הפעלת workflow automations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>N8N URL</Label>
                  <Input value={s.n8n_url ?? ""} onChange={e => set("n8n_url")(e.target.value)} placeholder="https://n8n.yourdomain.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>API Key</Label>
                  <SecretInput value={s.n8n_api_key ?? ""} onChange={set("n8n_api_key")} placeholder="n8n_api_••••••••" />
                </div>
              </div>
              <SaveBtn hook={n8n} />
            </CardContent>
          </Card>

          {/* Netlify */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                🌐 Netlify <Connected connected={!!s.netlify_token} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Personal Access Token</Label>
                <SecretInput value={s.netlify_token ?? ""} onChange={set("netlify_token")} placeholder="nfp_••••••••" />
              </div>
              <SaveBtn hook={netlify} />
            </CardContent>
          </Card>

          {/* GitHub */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                🐙 GitHub <Connected connected={!!s.github_token} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Personal Access Token</Label>
                <SecretInput value={s.github_token ?? ""} onChange={set("github_token")} placeholder="ghp_••••••••" />
              </div>
              <SaveBtn hook={github} />
            </CardContent>
          </Card>

          {/* WhatsApp */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                💬 WhatsApp Business <Connected connected={!!s.whatsapp_token && !!s.whatsapp_phone} />
              </CardTitle>
              <CardDescription>Meta Business Cloud API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Phone Number ID</Label>
                  <Input value={s.whatsapp_phone ?? ""} onChange={e => set("whatsapp_phone")(e.target.value)} placeholder="1234567890" />
                </div>
                <div className="space-y-1.5">
                  <Label>Access Token</Label>
                  <SecretInput value={s.whatsapp_token ?? ""} onChange={set("whatsapp_token")} placeholder="EAABsbCS0..." />
                </div>
              </div>
              <SaveBtn hook={whatsapp} />
            </CardContent>
          </Card>

          {/* AI */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                🤖 AI Providers <Connected connected={!!s.claude_api_key || !!s.openai_api_key} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Anthropic (Claude) API Key</Label>
                  <SecretInput value={s.claude_api_key ?? ""} onChange={set("claude_api_key")} placeholder="sk-ant-••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label>OpenAI API Key</Label>
                  <SecretInput value={s.openai_api_key ?? ""} onChange={set("openai_api_key")} placeholder="sk-••••••••" />
                </div>
              </div>
              <SaveBtn hook={ai} />
            </CardContent>
          </Card>

          {/* Resend / Email */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                📧 Email — Resend <Connected connected={!!s.resend_api_key} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Resend API Key</Label>
                  <SecretInput value={s.resend_api_key ?? ""} onChange={set("resend_api_key")} placeholder="re_••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label>From Email</Label>
                  <Input value={s.resend_from_email ?? ""} onChange={e => set("resend_from_email")(e.target.value)} placeholder="noreply@yourdomain.com" />
                </div>
              </div>
              <SaveBtn hook={resend} />
            </CardContent>
          </Card>

          {/* Evolution API (WhatsApp) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                📱 Evolution API — WhatsApp <Connected connected={!!s.evolution_api_url && !!s.evolution_api_key} />
              </CardTitle>
              <CardDescription>Evolution API לשליחת WhatsApp ישירה</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Evolution API URL</Label>
                  <Input value={s.evolution_api_url ?? ""} onChange={e => set("evolution_api_url")(e.target.value)} placeholder="https://evolution.yourserver.com" dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label>API Key</Label>
                  <SecretInput value={s.evolution_api_key ?? ""} onChange={set("evolution_api_key")} placeholder="your-api-key" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Instance Name</Label>
                  <Input value={s.evolution_instance ?? ""} onChange={e => set("evolution_instance")(e.target.value)} placeholder="default" dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label>N8N WhatsApp Webhook (חלופי)</Label>
                  <Input value={s.n8n_whatsapp_webhook ?? ""} onChange={e => set("n8n_whatsapp_webhook")(e.target.value)} placeholder="https://n8n.../webhook/whatsapp" dir="ltr" />
                </div>
              </div>
              <SaveBtn hook={evolution} />
            </CardContent>
          </Card>

          {/* Coolify */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                🖥️ Coolify <Connected connected={!!s.coolify_url && !!s.coolify_token} />
              </CardTitle>
              <CardDescription>ניהול שרתים ו-containers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Coolify URL</Label>
                  <Input value={s.coolify_url ?? ""} onChange={e => set("coolify_url")(e.target.value)} placeholder="https://coolify.yourdomain.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>API Token</Label>
                  <SecretInput value={s.coolify_token ?? ""} onChange={set("coolify_token")} placeholder="eyJ••••••••" />
                </div>
              </div>
              <SaveBtn hook={coolify} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Agency ── */}
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
                  <Input value={s.agency_name ?? ""} onChange={e => set("agency_name")(e.target.value)} placeholder="WMA Agency" />
                </div>
                <div className="space-y-1.5">
                  <Label>אימייל ראשי</Label>
                  <Input type="email" value={s.agency_email ?? ""} onChange={e => set("agency_email")(e.target.value)} placeholder="info@agency.co.il" />
                </div>
                <div className="space-y-1.5">
                  <Label>טלפון</Label>
                  <Input value={s.agency_phone ?? ""} onChange={e => set("agency_phone")(e.target.value)} placeholder="+972-50-1234567" />
                </div>
                <div className="space-y-1.5">
                  <Label>WhatsApp Support</Label>
                  <Input value={s.whatsapp_phone ?? ""} onChange={e => set("whatsapp_phone")(e.target.value)} placeholder="+972501234567" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>לוגו URL</Label>
                <Input value={s.agency_logo ?? ""} onChange={e => set("agency_logo")(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label>Primary Color (Brand)</Label>
                <div className="flex gap-2">
                  <input type="color" value={s.brand_color ?? "#6366f1"} onChange={e => set("brand_color")(e.target.value)} className="w-12 h-9 rounded border p-0.5 cursor-pointer" />
                  <Input value={s.brand_color ?? "#6366f1"} onChange={e => set("brand_color")(e.target.value)} className="font-mono" />
                </div>
              </div>
              <SaveBtn hook={agency} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Webhooks ── */}
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
                { name: "GitHub Events",       path: "/api/webhooks/github",    secret: true },
                { name: "Netlify Deploy",       path: "/api/webhooks/netlify",   secret: true },
                { name: "WhatsApp Messages",    path: "/api/webhooks/whatsapp",  secret: true },
                { name: "Form Lead Capture",    path: "/api/webhooks/leads",     secret: false },
                { name: "Coolify Events",       path: "/api/webhooks/coolify",   secret: true },
                { name: "N8N Callbacks",        path: "/api/webhooks/n8n",       secret: true },
              ].map((ep) => (
                <div key={ep.path} className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{ep.name}</p>
                    <code className="text-xs text-muted-foreground font-mono truncate block">
                      POST {baseUrl}{ep.path}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {ep.secret && (
                      <span className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium bg-slate-50 text-slate-600">
                        <Key className="h-2.5 w-2.5" />
                        Secret
                      </span>
                    )}
                    <CopyBtn text={`${baseUrl}${ep.path}`} />
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
