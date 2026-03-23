import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Plus, Play, Pause, ExternalLink, Clock, CheckCircle2, AlertCircle, GitBranch, Webhook } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

type Automation = {
  id: string;
  name: string;
  description: string | null;
  n8n_workflow_id: string | null;
  trigger_type: string;
  is_active: boolean;
  last_run_at: string | null;
  run_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export default async function AutomationsPage() {
  const supabase = await createClient();

  const { data: automationsRaw } = await supabase
    .from("automations")
    .select("*")
    .order("created_at", { ascending: false });
  const automations = automationsRaw as Automation[] | null;

  const triggerIcons: Record<string, string> = {
    webhook: "🔗",
    schedule: "⏰",
    manual: "▶️",
    email: "📧",
    whatsapp: "💬",
    github: "🐙",
    form: "📋",
  };

  const templateWorkflows = [
    {
      id: "tpl-1",
      name: "ברוך הבא ללקוח חדש",
      description: "שלח WhatsApp + Email אוטומטי כשנוסף לקוח חדש למערכת",
      category: "CRM",
      icon: "👋",
      steps: ["CRM Trigger", "WhatsApp Message", "Email Notification", "Update Status"],
    },
    {
      id: "tpl-2",
      name: "Deploy Notification",
      description: "התראה ב-WhatsApp/Slack כשיש deployment חדש ב-Netlify",
      category: "DevOps",
      icon: "🚀",
      steps: ["Netlify Webhook", "Filter", "WhatsApp", "Slack"],
    },
    {
      id: "tpl-3",
      name: "תזכורת תשלום",
      description: "שלח תזכורת ללקוח 3 ימים לפני מועד תשלום",
      category: "Finance",
      icon: "💰",
      steps: ["Schedule (Daily)", "Query DB", "Filter Due Payments", "Send WhatsApp"],
    },
    {
      id: "tpl-4",
      name: "Lead Capture → CRM",
      description: "קלוט לידים מטופס אתר ישירות ל-CRM + הודעת WhatsApp",
      category: "Marketing",
      icon: "🎯",
      steps: ["Webhook", "Validate Data", "Create Client", "WhatsApp Alert", "Email to Lead"],
    },
    {
      id: "tpl-5",
      name: "Social Media Auto-Post",
      description: "פרסם פוסט מוזמן בכל הרשתות בו-זמנית",
      category: "Social",
      icon: "📱",
      steps: ["Schedule", "Get Post", "Facebook", "Instagram", "LinkedIn", "Twitter"],
    },
    {
      id: "tpl-6",
      name: "Coolify Health Monitor",
      description: "בדוק בריאות containers כל 5 דקות ושלח התראה אם יש בעיה",
      category: "Infrastructure",
      icon: "❤️",
      steps: ["Schedule (5min)", "Coolify API", "Check Status", "Alert on Error"],
    },
  ];

  const activeCount = automations?.filter(a => a.is_active).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">אוטומציות N8N</h2>
          <p className="text-muted-foreground">
            {activeCount} פעילות מתוך {automations?.length ?? 0} workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <a href={process.env.NEXT_PUBLIC_N8N_URL ?? "#"} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              פתח N8N
            </a>
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Workflow חדש
          </Button>
        </div>
      </div>

      {/* N8N Connection Status */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-sm">N8N מחובר</p>
              <p className="text-xs text-muted-foreground">{process.env.NEXT_PUBLIC_N8N_URL ?? "לא הוגדר URL"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-700 font-medium">Online</span>
          </div>
        </CardContent>
      </Card>

      {/* Active Workflows */}
      {automations && automations.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Workflows פעילים</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {automations.map((automation) => (
              <Card key={automation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{triggerIcons[automation.trigger_type] ?? "⚡"}</span>
                      <div>
                        <p className="font-medium text-sm">{automation.name}</p>
                        <p className="text-xs text-muted-foreground">{automation.trigger_type}</p>
                      </div>
                    </div>
                    <Badge variant={automation.is_active ? "success" : "secondary"} className="text-xs">
                      {automation.is_active ? "פעיל" : "מושהה"}
                    </Badge>
                  </div>
                  {automation.description && (
                    <p className="text-xs text-muted-foreground mb-3">{automation.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {automation.run_count} הרצות
                    </div>
                    {automation.last_run_at && (
                      <span>הרצה אחרונה: {formatDate(automation.last_run_at)}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1 text-xs gap-1">
                      {automation.is_active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      {automation.is_active ? "השהה" : "הפעל"}
                    </Button>
                    {automation.n8n_workflow_id && (
                      <Button size="sm" variant="outline" className="text-xs gap-1" asChild>
                        <a href={`${process.env.NEXT_PUBLIC_N8N_URL}/workflow/${automation.n8n_workflow_id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Templates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">תבניות מוכנות לשימוש</h3>
          <span className="text-xs text-muted-foreground">{templateWorkflows.length} תבניות</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templateWorkflows.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{template.name}</p>
                    <Badge variant="secondary" className="text-xs mt-0.5">{template.category}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{template.description}</p>

                {/* Steps Flow */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="text-xs bg-accent rounded px-1.5 py-0.5">{step}</span>
                      {i < template.steps.length - 1 && (
                        <span className="text-muted-foreground text-xs">→</span>
                      )}
                    </div>
                  ))}
                </div>

                <Button size="sm" className="w-full text-xs gap-1">
                  <Plus className="h-3 w-3" />
                  ייבא ל-N8N
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Webhook Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhook Endpoints
          </CardTitle>
          <CardDescription>כתובות לקבלת events חיצוניים</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: "GitHub Events", path: "/api/webhooks/github", method: "POST" },
              { name: "Netlify Deploy", path: "/api/webhooks/netlify", method: "POST" },
              { name: "Form Leads", path: "/api/webhooks/leads", method: "POST" },
              { name: "WhatsApp Incoming", path: "/api/webhooks/whatsapp", method: "POST" },
              { name: "Coolify Events", path: "/api/webhooks/coolify", method: "POST" },
            ].map((endpoint) => (
              <div key={endpoint.path} className="flex items-center justify-between p-2 rounded-md bg-muted/50 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="info" className="text-xs uppercase">{endpoint.method}</Badge>
                  <span className="text-muted-foreground">{endpoint.name}:</span>
                  <span>{endpoint.path}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs"
                  onClick={() => {}}
                >
                  העתק
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
