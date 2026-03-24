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
];

export const TEMPLATE_CATEGORIES = [...new Set(TEMPLATES.map((t) => t.category))];
