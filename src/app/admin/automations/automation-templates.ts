import type { WorkflowData } from "@/components/admin/workflow-canvas";

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tags: string[];
  difficulty: "קל" | "בינוני" | "מתקדם";
  estimatedMinutes: number;
  workflow: WorkflowData;
}

export const TEMPLATES: AutomationTemplate[] = [
  {
    id: "welcome-client",
    name: "ברוך הבא ללקוח חדש",
    description: "שלח WhatsApp + Email אוטומטי כשנוסף לקוח חדש. כולל הודעת ברכה מותאמת אישית.",
    category: "CRM",
    icon: "👋",
    tags: ["CRM", "WhatsApp", "Email"],
    difficulty: "קל",
    estimatedMinutes: 5,
    workflow: {
      nodes: [
        { id: "n1", type: "trigger_new_lead", x: 80, y: 200, config: { source: "any" } },
        { id: "n2", type: "action_send_whatsapp", x: 360, y: 120, config: { to: "{{lead.phone}}", message: "שלום {{lead.name}}! ברוכים הבאים ל-WMA Agency. נחזור אליך תוך 24 שעות 🎉", session: "default" } },
        { id: "n3", type: "action_send_email",   x: 360, y: 280, config: { to: "{{lead.email}}", subject: "ברוכים הבאים!", body: "שלום {{lead.name}},\n\nתודה שפנית אלינו. נשמח לעזור!" } },
        { id: "n4", type: "action_update_crm",   x: 640, y: 200, config: { table: "clients", id: "{{lead.id}}", fields: '{"status":"active"}' } },
      ],
      edges: [
        { id: "e1", sourceNodeId: "n1", sourcePort: "out", targetNodeId: "n2", targetPort: "in" },
        { id: "e2", sourceNodeId: "n1", sourcePort: "out", targetNodeId: "n3", targetPort: "in" },
        { id: "e3", sourceNodeId: "n2", sourcePort: "out", targetNodeId: "n4", targetPort: "in" },
      ],
    },
  },
  {
    id: "payment-reminder",
    name: "תזכורת תשלום",
    description: "שלח תזכורת WhatsApp ללקוחות 3 ימים לפני מועד תשלום. בדוק אם כבר שולם לפני שליחה.",
    category: "Finance",
    icon: "💳",
    tags: ["Finance", "WhatsApp", "Automation"],
    difficulty: "בינוני",
    estimatedMinutes: 10,
    workflow: {
      nodes: [
        { id: "n1", type: "trigger_payment_due",   x: 80, y: 200, config: { days_before: 3, statuses: "pending" } },
        { id: "n2", type: "logic_condition",        x: 340, y: 200, config: { field: "{{payment.status}}", operator: "eq", value: "pending" } },
        { id: "n3", type: "action_send_whatsapp",   x: 600, y: 120, config: { to: "{{client.phone}}", message: "שלום {{client.name}}, תזכורת ידידותית: תשלום של ₪{{payment.amount}} מגיע ב-{{payment.due_date}} 🙏" } },
        { id: "n4", type: "action_update_crm",      x: 600, y: 280, config: { table: "payments", id: "{{payment.id}}", fields: '{"reminder_sent":true}' } },
      ],
      edges: [
        { id: "e1", sourceNodeId: "n1", sourcePort: "out",  targetNodeId: "n2", targetPort: "in" },
        { id: "e2", sourceNodeId: "n2", sourcePort: "true", targetNodeId: "n3", targetPort: "in" },
        { id: "e3", sourceNodeId: "n3", sourcePort: "out",  targetNodeId: "n4", targetPort: "in" },
      ],
    },
  },
  {
    id: "lead-capture",
    name: "Lead Capture → CRM + AI",
    description: "קלוט ליד מטופס/webhook, AI מנתח ומדרג, שולח WhatsApp לצוות ומוסיף ל-CRM.",
    category: "Marketing",
    icon: "🎯",
    tags: ["Lead", "AI", "CRM", "WhatsApp"],
    difficulty: "מתקדם",
    estimatedMinutes: 15,
    workflow: {
      nodes: [
        { id: "n1", type: "trigger_webhook",      x: 80,  y: 200, config: { path: "/webhook/lead-form", method: "POST" } },
        { id: "n2", type: "ai_analyze",           x: 340, y: 200, config: { extract: "שם, טלפון, אימייל, סוג עסק, תקציב משוער", format: "json" } },
        { id: "n3", type: "ai_decide",            x: 600, y: 200, config: { question: "האם זה ליד איכותי?", criteria: "תקציב מעל 5000, עסק רשום, מספר טלפון ישראלי" } },
        { id: "n4", type: "action_create_lead",   x: 860, y: 120, config: { name: "{{data.name}}", email: "{{data.email}}", phone: "{{data.phone}}", source: "website" } },
        { id: "n5", type: "action_send_whatsapp", x: 860, y: 280, config: { to: "972501234567", message: "🔥 ליד חדש איכותי!\nשם: {{data.name}}\nטלפון: {{data.phone}}\nתקציב: {{data.budget}}" } },
      ],
      edges: [
        { id: "e1", sourceNodeId: "n1", sourcePort: "out",   targetNodeId: "n2", targetPort: "in" },
        { id: "e2", sourceNodeId: "n2", sourcePort: "out",   targetNodeId: "n3", targetPort: "in" },
        { id: "e3", sourceNodeId: "n3", sourcePort: "yes",   targetNodeId: "n4", targetPort: "in" },
        { id: "e4", sourceNodeId: "n3", sourcePort: "yes",   targetNodeId: "n5", targetPort: "in" },
      ],
    },
  },
  {
    id: "deploy-notification",
    name: "Deploy Notification",
    description: "קבל התראה ב-WhatsApp כשיש deploy חדש. AI מנתח את שינויי הקוד ושולח סיכום.",
    category: "DevOps",
    icon: "🚀",
    tags: ["DevOps", "Netlify", "WhatsApp", "AI"],
    difficulty: "בינוני",
    estimatedMinutes: 8,
    workflow: {
      nodes: [
        { id: "n1", type: "trigger_site_status",  x: 80,  y: 200, config: { event: "any", site_id: "" } },
        { id: "n2", type: "ai_generate_content",  x: 340, y: 200, config: { content_type: "summary", prompt: "סכם את ה-deploy: {{event.details}}", language: "he" } },
        { id: "n3", type: "action_send_whatsapp", x: 600, y: 200, config: { to: "972501234567", message: "{{event.status === 'success' ? '✅' : '❌'}} Deploy {{event.site_name}}\n{{ai_summary}}" } },
      ],
      edges: [
        { id: "e1", sourceNodeId: "n1", sourcePort: "out", targetNodeId: "n2", targetPort: "in" },
        { id: "e2", sourceNodeId: "n2", sourcePort: "out", targetNodeId: "n3", targetPort: "in" },
      ],
    },
  },
  {
    id: "whatsapp-ai-bot",
    name: "WhatsApp AI Agent",
    description: "בוט WhatsApp חכם שמגיב ללקוחות עם Claude AI, מזהה כוונה ומנתב לפעולה הנכונה.",
    category: "AI",
    icon: "🤖",
    tags: ["AI", "WhatsApp", "Chatbot"],
    difficulty: "מתקדם",
    estimatedMinutes: 20,
    workflow: {
      nodes: [
        { id: "n1", type: "trigger_whatsapp_in",  x: 80,  y: 250, config: { keyword: "", session: "default" } },
        { id: "n2", type: "ai_sentiment",         x: 340, y: 250, config: { field: "{{message.text}}" } },
        { id: "n3", type: "ai_claude",            x: 600, y: 150, config: { model: "claude-sonnet-4-6", system: "אתה עוזר AI של WMA Agency. ענה בעברית בצורה מקצועית וידידותית.", prompt: "{{message.text}}", tools: "supabase" } },
        { id: "n4", type: "action_send_whatsapp", x: 860, y: 150, config: { to: "{{message.from}}", message: "{{ai_response}}", session: "default" } },
        { id: "n5", type: "action_create_lead",   x: 860, y: 350, config: { name: "{{message.contact_name}}", phone: "{{message.from}}", source: "whatsapp" } },
      ],
      edges: [
        { id: "e1", sourceNodeId: "n1", sourcePort: "out",      targetNodeId: "n2", targetPort: "in" },
        { id: "e2", sourceNodeId: "n2", sourcePort: "positive", targetNodeId: "n3", targetPort: "in" },
        { id: "e3", sourceNodeId: "n3", sourcePort: "out",      targetNodeId: "n4", targetPort: "in" },
        { id: "e4", sourceNodeId: "n2", sourcePort: "negative", targetNodeId: "n5", targetPort: "in" },
      ],
    },
  },
  {
    id: "social-auto-post",
    name: "AI Social Media Manager",
    description: "AI כותב פוסטים שבועיים לכל הרשתות לפי נושא, פרסם אוטומטית בזמן הנכון.",
    category: "Social",
    icon: "📱",
    tags: ["Social", "AI", "Schedule"],
    difficulty: "מתקדם",
    estimatedMinutes: 20,
    workflow: {
      nodes: [
        { id: "n1", type: "trigger_schedule",     x: 80,  y: 200, config: { cron: "0 9 * * 1", timezone: "Asia/Jerusalem" } },
        { id: "n2", type: "ai_generate_content",  x: 340, y: 200, config: { content_type: "post", prompt: "כתוב 3 פוסטים לינקדאין מקצועיים על טכנולוגיה ועסקים", language: "he", tone: "professional" } },
        { id: "n3", type: "action_http_request",  x: 600, y: 120, config: { method: "POST", url: "https://api.linkedin.com/v2/ugcPosts", headers: '{"Authorization":"Bearer {{linkedin_token}}"}' } },
        { id: "n4", type: "action_http_request",  x: 600, y: 280, config: { method: "POST", url: "https://graph.facebook.com/me/feed", body: '{"message":"{{ai_post}}","access_token":"{{fb_token}}"}' } },
      ],
      edges: [
        { id: "e1", sourceNodeId: "n1", sourcePort: "out", targetNodeId: "n2", targetPort: "in" },
        { id: "e2", sourceNodeId: "n2", sourcePort: "out", targetNodeId: "n3", targetPort: "in" },
        { id: "e3", sourceNodeId: "n2", sourcePort: "out", targetNodeId: "n4", targetPort: "in" },
      ],
    },
  },

  /* ── Contract Expiry Alert ── */
  {
    id: "contract-expiry",
    name: "התראת פקיעת חוזה",
    description: "שלח התראה ל-WhatsApp + Email 30 ו-7 ימים לפני פקיעת חוזה לקוח.",
    category: "CRM",
    icon: "📄",
    tags: ["CRM", "Contract", "WhatsApp", "Email"],
    difficulty: "בינוני",
    estimatedMinutes: 10,
    workflow: {
      nodes: [
        { id: "n1", type: "trigger_schedule",     x: 80,  y: 200, config: { cron: "0 8 * * *", timezone: "Asia/Jerusalem" } },
        { id: "n2", type: "action_http_request",  x: 340, y: 200, config: { method: "GET", url: "/api/admin/clients?contractExpiringSoon=true", headers: '{"x-internal":"1"}' } },
        { id: "n3", type: "logic_condition",      x: 600, y: 200, config: { field: "{{client.days_to_expiry}}", operator: "in", value: "7,30" } },
        { id: "n4", type: "action_send_email",    x: 860, y: 120, config: { to: "{{client.email}}", subject: "חוזה מסתיים בקרוב — {{client.name}}", body: "שלום {{client.name}},\n\nחוזה השירות שלך מסתיים בעוד {{client.days_to_expiry}} ימים.\nנשמח לחדש — צרו קשר בהקדם." } },
        { id: "n5", type: "action_send_whatsapp", x: 860, y: 280, config: { to: "{{client.phone}}", message: "📋 שלום {{client.name}}, החוזה שלך מסתיים בעוד {{client.days_to_expiry}} ימים. נשמח לדבר על חידוש 🙏" } },
      ],
      edges: [
        { id: "e1", sourceNodeId: "n1", sourcePort: "out",   targetNodeId: "n2", targetPort: "in" },
        { id: "e2", sourceNodeId: "n2", sourcePort: "out",   targetNodeId: "n3", targetPort: "in" },
        { id: "e3", sourceNodeId: "n3", sourcePort: "true",  targetNodeId: "n4", targetPort: "in" },
        { id: "e4", sourceNodeId: "n3", sourcePort: "true",  targetNodeId: "n5", targetPort: "in" },
      ],
    },
  },

  /* ── Site Down Monitor ── */
  {
    id: "site-monitor",
    name: "ניטור זמינות אתר",
    description: "בדוק כל 5 דקות שהאתר עולה. אם נפל — שלח התראה מיידית ל-WhatsApp.",
    category: "DevOps",
    icon: "🔍",
    tags: ["DevOps", "Monitor", "WhatsApp", "Alert"],
    difficulty: "קל",
    estimatedMinutes: 5,
    workflow: {
      nodes: [
        { id: "n1", type: "trigger_schedule",     x: 80,  y: 200, config: { cron: "*/5 * * * *", timezone: "UTC" } },
        { id: "n2", type: "action_http_request",  x: 340, y: 200, config: { method: "GET", url: "{{site.url}}", timeout: 10000 } },
        { id: "n3", type: "logic_condition",      x: 600, y: 200, config: { field: "{{response.status}}", operator: "neq", value: "200" } },
        { id: "n4", type: "action_send_whatsapp", x: 860, y: 120, config: { to: "972501234567", message: "🚨 *האתר נפל!*\n{{site.name}} אינו מגיב.\nסטטוס: {{response.status}}\nזמן: {{now}}" } },
        { id: "n5", type: "action_update_crm",    x: 860, y: 280, config: { table: "deployments", fields: '{"status":"error","notes":"Site down detected"}' } },
      ],
      edges: [
        { id: "e1", sourceNodeId: "n1", sourcePort: "out",   targetNodeId: "n2", targetPort: "in" },
        { id: "e2", sourceNodeId: "n2", sourcePort: "out",   targetNodeId: "n3", targetPort: "in" },
        { id: "e3", sourceNodeId: "n3", sourcePort: "true",  targetNodeId: "n4", targetPort: "in" },
        { id: "e4", sourceNodeId: "n3", sourcePort: "true",  targetNodeId: "n5", targetPort: "in" },
      ],
    },
  },

  /* ── Birthday / Anniversary Greeting ── */
  {
    id: "birthday-greeting",
    name: "ברכת יום הולדת / יום נישואין",
    description: "שלח הודעת WhatsApp מותאמת אישית ביום הולדת או יום נישואין של הלקוח.",
    category: "CRM",
    icon: "🎂",
    tags: ["CRM", "WhatsApp", "Personal"],
    difficulty: "קל",
    estimatedMinutes: 5,
    workflow: {
      nodes: [
        { id: "n1", type: "trigger_schedule",     x: 80,  y: 200, config: { cron: "0 9 * * *", timezone: "Asia/Jerusalem" } },
        { id: "n2", type: "action_http_request",  x: 340, y: 200, config: { method: "GET", url: "/api/admin/clients?birthdayToday=true" } },
        { id: "n3", type: "ai_generate_content",  x: 600, y: 200, config: { content_type: "greeting", prompt: "כתוב ברכת יום הולדת חמה ומקצועית ל{{client.name}} בעברית", language: "he", tone: "warm" } },
        { id: "n4", type: "action_send_whatsapp", x: 860, y: 200, config: { to: "{{client.phone}}", message: "{{ai_greeting}} 🎉🎂" } },
      ],
      edges: [
        { id: "e1", sourceNodeId: "n1", sourcePort: "out", targetNodeId: "n2", targetPort: "in" },
        { id: "e2", sourceNodeId: "n2", sourcePort: "out", targetNodeId: "n3", targetPort: "in" },
        { id: "e3", sourceNodeId: "n3", sourcePort: "out", targetNodeId: "n4", targetPort: "in" },
      ],
    },
  },

  /* ── Invoice Generator ── */
  {
    id: "invoice-auto",
    name: "חשבונית חודשית אוטומטית",
    description: "בתחילת כל חודש — צור חשבוניות לכל הלקוחות הפעילים ושלח ב-Email.",
    category: "Finance",
    icon: "🧾",
    tags: ["Finance", "Email", "Automation"],
    difficulty: "מתקדם",
    estimatedMinutes: 15,
    workflow: {
      nodes: [
        { id: "n1", type: "trigger_schedule",     x: 80,  y: 200, config: { cron: "0 8 1 * *", timezone: "Asia/Jerusalem" } },
        { id: "n2", type: "action_http_request",  x: 340, y: 200, config: { method: "GET", url: "/api/admin/clients?status=active&contractType=monthly" } },
        { id: "n3", type: "action_http_request",  x: 600, y: 200, config: { method: "POST", url: "/api/admin/payments", body: '{"client_id":"{{client.id}}","amount":"{{client.mrr}}","due_date":"{{month_end}}","status":"pending"}' } },
        { id: "n4", type: "action_send_email",    x: 860, y: 200, config: { to: "{{client.email}}", subject: "חשבונית {{month_name}} — {{company_name}}", body: "שלום {{client.name}},\n\nמצורפת חשבונית חודש {{month_name}} בסך ₪{{client.mrr}}.\n\nפרטי תשלום: {{payment_link}}\n\nתודה,\n{{company_name}}" } },
      ],
      edges: [
        { id: "e1", sourceNodeId: "n1", sourcePort: "out", targetNodeId: "n2", targetPort: "in" },
        { id: "e2", sourceNodeId: "n2", sourcePort: "out", targetNodeId: "n3", targetPort: "in" },
        { id: "e3", sourceNodeId: "n3", sourcePort: "out", targetNodeId: "n4", targetPort: "in" },
      ],
    },
  },

  /* ── Support Ticket Escalation ── */
  {
    id: "ticket-escalation",
    name: "הסלמת כרטיסי תמיכה",
    description: "כרטיס תמיכה שלא נענה תוך 4 שעות — שלח התראה לצוות ושנה עדיפות ל-urgent.",
    category: "Support",
    icon: "🆘",
    tags: ["Support", "WhatsApp", "Automation"],
    difficulty: "בינוני",
    estimatedMinutes: 8,
    workflow: {
      nodes: [
        { id: "n1", type: "trigger_schedule",     x: 80,  y: 200, config: { cron: "0 */4 * * *", timezone: "Asia/Jerusalem" } },
        { id: "n2", type: "action_http_request",  x: 340, y: 200, config: { method: "GET", url: "/api/admin/support?unansweredHours=4&status=open" } },
        { id: "n3", type: "logic_condition",      x: 600, y: 200, config: { field: "{{tickets.length}}", operator: "gt", value: "0" } },
        { id: "n4", type: "action_send_whatsapp", x: 860, y: 120, config: { to: "972501234567", message: "⚠️ {{tickets.length}} כרטיסי תמיכה ממתינים מעל 4 שעות!\nלקוחות: {{tickets.client_names}}" } },
        { id: "n5", type: "action_update_crm",    x: 860, y: 280, config: { table: "support_tickets", id: "{{ticket.id}}", fields: '{"priority":"urgent"}' } },
      ],
      edges: [
        { id: "e1", sourceNodeId: "n1", sourcePort: "out",  targetNodeId: "n2", targetPort: "in" },
        { id: "e2", sourceNodeId: "n2", sourcePort: "out",  targetNodeId: "n3", targetPort: "in" },
        { id: "e3", sourceNodeId: "n3", sourcePort: "true", targetNodeId: "n4", targetPort: "in" },
        { id: "e4", sourceNodeId: "n3", sourcePort: "true", targetNodeId: "n5", targetPort: "in" },
      ],
    },
  },

  /* ── New Site Deploy Welcome ── */
  {
    id: "new-site-welcome",
    name: "אתר חדש עלה לאוויר",
    description: "כשאתר חדש עולה לאוויר — שלח מזל טוב ללקוח עם הלינק ובקש ביקורת Google.",
    category: "DevOps",
    icon: "🌐",
    tags: ["DevOps", "WhatsApp", "Email", "CRM"],
    difficulty: "קל",
    estimatedMinutes: 5,
    workflow: {
      nodes: [
        { id: "n1", type: "trigger_site_status",  x: 80,  y: 200, config: { event: "success", site_id: "" } },
        { id: "n2", type: "action_send_whatsapp", x: 340, y: 120, config: { to: "{{client.phone}}", message: "🎉 *מזל טוב {{client.name}}!*\nהאתר שלך עלה לאוויר!\n👉 {{site.url}}\n\nנשמח אם תשאיר ביקורת: {{google_review_link}}" } },
        { id: "n3", type: "action_send_email",    x: 340, y: 280, config: { to: "{{client.email}}", subject: "🚀 האתר שלך עלה לאוויר!", body: "שלום {{client.name}},\n\nהאתר שלך פעיל ב: {{site.url}}\n\nתודה שבחרת בנו! 🙏" } },
        { id: "n4", type: "action_update_crm",    x: 620, y: 200, config: { table: "sites", id: "{{site.id}}", fields: '{"status":"active"}' } },
      ],
      edges: [
        { id: "e1", sourceNodeId: "n1", sourcePort: "out", targetNodeId: "n2", targetPort: "in" },
        { id: "e2", sourceNodeId: "n1", sourcePort: "out", targetNodeId: "n3", targetPort: "in" },
        { id: "e3", sourceNodeId: "n2", sourcePort: "out", targetNodeId: "n4", targetPort: "in" },
      ],
    },
  },

  /* ── Weekly Report ── */
  {
    id: "weekly-report",
    name: "דוח שבועי למנהל",
    description: "כל יום ראשון בבוקר — AI מסכם את הפעילות השבועית ושולח דוח ל-WhatsApp.",
    category: "Reports",
    icon: "📊",
    tags: ["Reports", "AI", "WhatsApp", "Schedule"],
    difficulty: "מתקדם",
    estimatedMinutes: 15,
    workflow: {
      nodes: [
        { id: "n1", type: "trigger_schedule",     x: 80,  y: 200, config: { cron: "0 8 * * 0", timezone: "Asia/Jerusalem" } },
        { id: "n2", type: "action_http_request",  x: 340, y: 200, config: { method: "GET", url: "/api/admin/dashboard?period=week" } },
        { id: "n3", type: "ai_generate_content",  x: 600, y: 200, config: { content_type: "report", prompt: "סכם את הנתונים הבאים לדוח שבועי קצר ומקצועי בעברית: {{data}}", language: "he", tone: "professional" } },
        { id: "n4", type: "action_send_whatsapp", x: 860, y: 200, config: { to: "972501234567", message: "📊 *דוח שבועי — {{week_label}}*\n\n{{ai_report}}" } },
      ],
      edges: [
        { id: "e1", sourceNodeId: "n1", sourcePort: "out", targetNodeId: "n2", targetPort: "in" },
        { id: "e2", sourceNodeId: "n2", sourcePort: "out", targetNodeId: "n3", targetPort: "in" },
        { id: "e3", sourceNodeId: "n3", sourcePort: "out", targetNodeId: "n4", targetPort: "in" },
      ],
    },
  },
];

export const TEMPLATE_CATEGORIES = [...new Set(TEMPLATES.map((t) => t.category))];
