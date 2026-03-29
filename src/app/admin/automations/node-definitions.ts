/* ─────────────────────────────────────────────
   All available node types for the workflow builder
   ───────────────────────────────────────────── */

export type NodeCategory = "trigger" | "action" | "ai" | "logic";

export interface NodePort {
  id: string;
  label: string;
  side: "top" | "bottom" | "left" | "right";
}

export interface NodeTypeDef {
  type: string;
  label: string;
  description: string;
  category: NodeCategory;
  icon: string;        // emoji icon
  color: string;       // tailwind bg class for node header
  textColor: string;   // tailwind text class
  inputs: NodePort[];
  outputs: NodePort[];
  configFields: ConfigField[];
  estimatedMs?: number; // avg execution time
}

export interface ConfigField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "toggle" | "code" | "cron" | "url" | "template";
  placeholder?: string;
  options?: { value: string; label: string }[];
  default?: unknown;
  hint?: string;
}

/* ─────────── TRIGGER NODES ─────────── */

const TRIGGERS: NodeTypeDef[] = [
  {
    type: "trigger_webhook",
    label: "Webhook",
    description: "קבל HTTP POST מכל מקור",
    category: "trigger",
    icon: "🔗",
    color: "bg-sky-600",
    textColor: "text-sky-700",
    inputs: [],
    outputs: [{ id: "out", label: "payload", side: "bottom" }],
    configFields: [
      { key: "path", label: "Endpoint Path", type: "text", placeholder: "/webhook/my-flow", hint: "נוצר אוטומטית" },
      { key: "method", label: "HTTP Method", type: "select", options: [{ value: "POST", label: "POST" }, { value: "GET", label: "GET" }], default: "POST" },
      { key: "secret", label: "Webhook Secret", type: "text", placeholder: "ל-HMAC verification" },
    ],
    estimatedMs: 0,
  },
  {
    type: "trigger_schedule",
    label: "Schedule",
    description: "הפעל לפי לוח זמנים",
    category: "trigger",
    icon: "⏰",
    color: "bg-sky-600",
    textColor: "text-sky-700",
    inputs: [],
    outputs: [{ id: "out", label: "tick", side: "bottom" }],
    configFields: [
      { key: "cron", label: "Cron Expression", type: "cron", placeholder: "0 9 * * *", hint: "כל יום ב-9:00" },
      { key: "timezone", label: "Timezone", type: "select", options: [{ value: "Asia/Jerusalem", label: "ישראל (UTC+3)" }, { value: "UTC", label: "UTC" }], default: "Asia/Jerusalem" },
    ],
    estimatedMs: 0,
  },
  {
    type: "trigger_new_lead",
    label: "ליד חדש",
    description: "מופעל בהוספת ליד ל-CRM",
    category: "trigger",
    icon: "🎯",
    color: "bg-sky-600",
    textColor: "text-sky-700",
    inputs: [],
    outputs: [{ id: "out", label: "lead", side: "bottom" }],
    configFields: [
      { key: "source", label: "מקור ליד", type: "select", options: [{ value: "any", label: "כל מקור" }, { value: "website", label: "אתר" }, { value: "whatsapp", label: "WhatsApp" }], default: "any" },
    ],
    estimatedMs: 0,
  },
  {
    type: "trigger_payment_due",
    label: "תשלום מתקרב",
    description: "הפעל N ימים לפני תשלום",
    category: "trigger",
    icon: "💳",
    color: "bg-sky-600",
    textColor: "text-sky-700",
    inputs: [],
    outputs: [{ id: "out", label: "payment", side: "bottom" }],
    configFields: [
      { key: "days_before", label: "ימים מראש", type: "number", default: 3 },
      { key: "statuses", label: "סטטוסים", type: "select", options: [{ value: "pending", label: "ממתין" }, { value: "overdue", label: "באיחור" }], default: "pending" },
    ],
    estimatedMs: 0,
  },
  {
    type: "trigger_whatsapp_in",
    label: "WhatsApp נכנס",
    description: "הודעת WhatsApp נכנסת (WAHA)",
    category: "trigger",
    icon: "📱",
    color: "bg-sky-600",
    textColor: "text-sky-700",
    inputs: [],
    outputs: [{ id: "out", label: "message", side: "bottom" }],
    configFields: [
      { key: "keyword", label: "מילת מפתח (אופציונלי)", type: "text", placeholder: "e.g. הצעה, עזרה" },
      { key: "session", label: "WAHA Session", type: "text", default: "default" },
    ],
    estimatedMs: 0,
  },
  {
    type: "trigger_site_status",
    label: "סטטוס אתר השתנה",
    description: "Deploy הצליח / נכשל",
    category: "trigger",
    icon: "🌐",
    color: "bg-sky-600",
    textColor: "text-sky-700",
    inputs: [],
    outputs: [{ id: "out", label: "event", side: "bottom" }],
    configFields: [
      { key: "event", label: "אירוע", type: "select", options: [{ value: "any", label: "כל אירוע" }, { value: "success", label: "Deploy הצליח" }, { value: "failed", label: "Deploy נכשל" }], default: "any" },
      { key: "site_id", label: "אתר (ריק = כולם)", type: "text" },
    ],
    estimatedMs: 0,
  },
];

/* ─────────── ACTION NODES ─────────── */

const ACTIONS: NodeTypeDef[] = [
  {
    type: "action_send_whatsapp",
    label: "שלח WhatsApp",
    description: "שלח הודעה ב-WhatsApp (WAHA)",
    category: "action",
    icon: "💬",
    color: "bg-indigo-600",
    textColor: "text-indigo-700",
    inputs: [{ id: "in", label: "data", side: "top" }],
    outputs: [{ id: "out", label: "sent", side: "bottom" }],
    configFields: [
      { key: "to", label: "מספר נמען", type: "text", placeholder: "972501234567 / {{client.phone}}", hint: "ניתן להשתמש ב-variables" },
      { key: "message", label: "הודעה", type: "template", placeholder: "שלום {{client.name}}, תשלום של {{payment.amount}} מחכה לך...", hint: "תומך ב-{{variables}}" },
      { key: "session", label: "WAHA Session", type: "text", default: "default" },
    ],
    estimatedMs: 800,
  },
  {
    type: "action_send_email",
    label: "שלח Email",
    description: "שלח אימייל ל-לקוח/צוות",
    category: "action",
    icon: "📧",
    color: "bg-indigo-600",
    textColor: "text-indigo-700",
    inputs: [{ id: "in", label: "data", side: "top" }],
    outputs: [{ id: "out", label: "sent", side: "bottom" }],
    configFields: [
      { key: "to",      label: "נמען",    type: "text",     placeholder: "{{client.email}}" },
      { key: "subject", label: "נושא",    type: "text",     placeholder: "{{subject}}" },
      { key: "body",    label: "תוכן",    type: "template", placeholder: "תוכן האימייל..." },
      { key: "from",    label: "שולח",    type: "text",     default: "no-reply@agencypro.co.il" },
    ],
    estimatedMs: 500,
  },
  {
    type: "action_deploy_site",
    label: "Deploy אתר",
    description: "הפעל build hook של Netlify/Coolify",
    category: "action",
    icon: "🚀",
    color: "bg-indigo-600",
    textColor: "text-indigo-700",
    inputs: [{ id: "in", label: "trigger", side: "top" }],
    outputs: [
      { id: "success", label: "הצליח", side: "bottom" },
      { id: "error",   label: "נכשל",  side: "right" },
    ],
    configFields: [
      { key: "site_id",   label: "אתר", type: "select", options: [{ value: "all", label: "בחר אתר..." }] },
      { key: "hook_url",  label: "Build Hook URL", type: "url", placeholder: "https://api.netlify.com/build_hooks/..." },
      { key: "wait",      label: "המתן לסיום", type: "toggle", default: false },
    ],
    estimatedMs: 45000,
  },
  {
    type: "action_update_crm",
    label: "עדכן CRM",
    description: "עדכן רשומה ב-Supabase CRM",
    category: "action",
    icon: "📊",
    color: "bg-indigo-600",
    textColor: "text-indigo-700",
    inputs: [{ id: "in", label: "data", side: "top" }],
    outputs: [{ id: "out", label: "updated", side: "bottom" }],
    configFields: [
      { key: "table",  label: "טבלה",  type: "select", options: [{ value: "clients", label: "clients" }, { value: "payments", label: "payments" }, { value: "contracts", label: "contracts" }, { value: "leads", label: "leads" }] },
      { key: "id",     label: "Record ID", type: "text", placeholder: "{{record.id}}" },
      { key: "fields", label: "שדות לעדכון (JSON)", type: "code", placeholder: '{"status": "paid", "updated_at": "{{now}}"}' },
    ],
    estimatedMs: 300,
  },
  {
    type: "action_http_request",
    label: "HTTP Request",
    description: "קרא ל-API חיצוני",
    category: "action",
    icon: "🌐",
    color: "bg-indigo-600",
    textColor: "text-indigo-700",
    inputs: [{ id: "in", label: "data", side: "top" }],
    outputs: [
      { id: "success", label: "200 OK",  side: "bottom" },
      { id: "error",   label: "שגיאה",  side: "right" },
    ],
    configFields: [
      { key: "method",  label: "Method", type: "select", options: [{ value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "PUT", label: "PUT" }, { value: "DELETE", label: "DELETE" }], default: "GET" },
      { key: "url",     label: "URL", type: "url", placeholder: "https://api.example.com/endpoint" },
      { key: "headers", label: "Headers (JSON)", type: "code", placeholder: '{"Authorization": "Bearer {{token}}"}' },
      { key: "body",    label: "Body (JSON)", type: "code" },
    ],
    estimatedMs: 1000,
  },
  {
    type: "action_run_n8n",
    label: "הפעל N8N Workflow",
    description: "קרא ל-N8N webhook trigger",
    category: "action",
    icon: "⚡",
    color: "bg-indigo-600",
    textColor: "text-indigo-700",
    inputs: [{ id: "in", label: "data", side: "top" }],
    outputs: [{ id: "out", label: "result", side: "bottom" }],
    configFields: [
      { key: "workflow_id",  label: "Workflow ID", type: "text", placeholder: "n8n workflow ID" },
      { key: "webhook_url",  label: "Webhook URL", type: "url", placeholder: "https://n8n.domain.com/webhook/..." },
      { key: "wait_result",  label: "המתן לתוצאה", type: "toggle", default: true },
    ],
    estimatedMs: 2000,
  },
  {
    type: "action_create_lead",
    label: "צור ליד",
    description: "הוסף ליד חדש ל-Pipeline",
    category: "action",
    icon: "🎯",
    color: "bg-indigo-600",
    textColor: "text-indigo-700",
    inputs: [{ id: "in", label: "data", side: "top" }],
    outputs: [{ id: "out", label: "lead", side: "bottom" }],
    configFields: [
      { key: "name",    label: "שם",      type: "text", placeholder: "{{data.name}}" },
      { key: "email",   label: "אימייל",  type: "text", placeholder: "{{data.email}}" },
      { key: "phone",   label: "טלפון",   type: "text", placeholder: "{{data.phone}}" },
      { key: "source",  label: "מקור",    type: "select", options: [{ value: "website", label: "אתר" }, { value: "whatsapp", label: "WhatsApp" }, { value: "automation", label: "אוטומציה" }] },
    ],
    estimatedMs: 300,
  },
  {
    type: "action_wait",
    label: "המתן",
    description: "עצור X שניות/דקות",
    category: "action",
    icon: "⏳",
    color: "bg-indigo-600",
    textColor: "text-indigo-700",
    inputs: [{ id: "in", label: "trigger", side: "top" }],
    outputs: [{ id: "out", label: "done", side: "bottom" }],
    configFields: [
      { key: "duration", label: "משך זמן", type: "number", default: 5 },
      { key: "unit",     label: "יחידה",   type: "select", options: [{ value: "seconds", label: "שניות" }, { value: "minutes", label: "דקות" }, { value: "hours", label: "שעות" }], default: "seconds" },
    ],
    estimatedMs: 5000,
  },
];

/* ─────────── AI NODES ─────────── */

const AI_NODES: NodeTypeDef[] = [
  {
    type: "ai_claude",
    label: "Claude AI Agent",
    description: "הפעל סוכן AI עם Claude",
    category: "ai",
    icon: "🤖",
    color: "bg-violet-600",
    textColor: "text-violet-700",
    inputs: [{ id: "in", label: "context", side: "top" }],
    outputs: [
      { id: "out",    label: "תשובה",  side: "bottom" },
      { id: "action", label: "פעולה",  side: "right" },
    ],
    configFields: [
      { key: "model",       label: "Model",        type: "select", options: [{ value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" }, { value: "claude-opus-4-6", label: "Claude Opus 4.6" }], default: "claude-sonnet-4-6" },
      { key: "system",      label: "System Prompt", type: "textarea", placeholder: "אתה עוזר AI מומחה ל..." },
      { key: "prompt",      label: "Prompt",        type: "template", placeholder: "נתח את הנתונים הבאים: {{data}}" },
      { key: "tools",       label: "כלים זמינים",  type: "select",   options: [{ value: "none", label: "ללא כלים" }, { value: "search", label: "Web Search" }, { value: "supabase", label: "Supabase" }, { value: "all", label: "הכל" }], default: "none" },
      { key: "max_tokens",  label: "Max Tokens",    type: "number",   default: 1024 },
    ],
    estimatedMs: 3000,
  },
  {
    type: "ai_generate_content",
    label: "יצר תוכן",
    description: "יצר טקסט/פוסט/אימייל עם AI",
    category: "ai",
    icon: "✍️",
    color: "bg-violet-600",
    textColor: "text-violet-700",
    inputs: [{ id: "in", label: "context", side: "top" }],
    outputs: [{ id: "out", label: "content", side: "bottom" }],
    configFields: [
      { key: "content_type", label: "סוג תוכן",   type: "select", options: [{ value: "post", label: "פוסט סושיאל" }, { value: "email", label: "אימייל" }, { value: "summary", label: "סיכום" }, { value: "proposal", label: "הצעת מחיר" }] },
      { key: "prompt",       label: "הוראות",     type: "template", placeholder: "צור פוסט על: {{topic}}" },
      { key: "language",     label: "שפה",        type: "select", options: [{ value: "he", label: "עברית" }, { value: "en", label: "English" }], default: "he" },
      { key: "tone",         label: "טון",        type: "select", options: [{ value: "professional", label: "מקצועי" }, { value: "friendly", label: "ידידותי" }, { value: "formal", label: "רשמי" }] },
    ],
    estimatedMs: 2500,
  },
  {
    type: "ai_analyze",
    label: "נתח/חלץ נתונים",
    description: "חלץ מבנה מטקסט חופשי",
    category: "ai",
    icon: "🔍",
    color: "bg-violet-600",
    textColor: "text-violet-700",
    inputs: [{ id: "in", label: "text", side: "top" }],
    outputs: [{ id: "out", label: "structured", side: "bottom" }],
    configFields: [
      { key: "extract",  label: "מה לחלץ",     type: "textarea", placeholder: "שם, טלפון, אימייל, סכום" },
      { key: "format",   label: "פורמט פלט",   type: "select", options: [{ value: "json", label: "JSON" }, { value: "text", label: "טקסט" }], default: "json" },
    ],
    estimatedMs: 1500,
  },
  {
    type: "ai_decide",
    label: "קבל החלטה AI",
    description: "AI מחליט איזה נתיב לעקוב",
    category: "ai",
    icon: "🎲",
    color: "bg-violet-600",
    textColor: "text-violet-700",
    inputs: [{ id: "in", label: "context", side: "top" }],
    outputs: [
      { id: "yes",   label: "כן / חיובי", side: "bottom" },
      { id: "no",    label: "לא / שלילי", side: "right" },
      { id: "maybe", label: "אולי / לא בטוח", side: "left" },
    ],
    configFields: [
      { key: "question",   label: "שאלת ההחלטה", type: "textarea", placeholder: "האם הלקוח הזה הוא VIP? בדוק לפי: {{criteria}}" },
      { key: "criteria",   label: "קריטריונים",   type: "textarea", placeholder: "רכש מעל 50,000 ₪, לקוח מעל שנה..." },
    ],
    estimatedMs: 2000,
  },
  {
    type: "ai_sentiment",
    label: "ניתוח סנטימנט",
    description: "נתח תחושה של הודעה/ביקורת",
    category: "ai",
    icon: "😊",
    color: "bg-violet-600",
    textColor: "text-violet-700",
    inputs: [{ id: "in", label: "text", side: "top" }],
    outputs: [
      { id: "positive", label: "חיובי", side: "bottom" },
      { id: "negative", label: "שלילי", side: "right" },
      { id: "neutral",  label: "נייטרלי", side: "left" },
    ],
    configFields: [
      { key: "field", label: "שדה לניתוח", type: "text", placeholder: "{{message.text}}" },
    ],
    estimatedMs: 800,
  },
];

/* ─────────── LOGIC NODES ─────────── */

const LOGIC_NODES: NodeTypeDef[] = [
  {
    type: "logic_condition",
    label: "תנאי If/Else",
    description: "פצל לנתיבים לפי תנאי",
    category: "logic",
    icon: "❓",
    color: "bg-slate-600",
    textColor: "text-slate-700",
    inputs: [{ id: "in", label: "data", side: "top" }],
    outputs: [
      { id: "true",  label: "כן",  side: "bottom" },
      { id: "false", label: "לא",  side: "right" },
    ],
    configFields: [
      { key: "field",    label: "שדה",      type: "text",   placeholder: "{{payment.status}}" },
      { key: "operator", label: "תנאי",     type: "select", options: [{ value: "eq", label: "שווה ל-" }, { value: "neq", label: "לא שווה" }, { value: "gt", label: "גדול מ-" }, { value: "lt", label: "קטן מ-" }, { value: "contains", label: "מכיל" }, { value: "exists", label: "קיים" }] },
      { key: "value",    label: "ערך",      type: "text",   placeholder: "overdue" },
    ],
    estimatedMs: 1,
  },
  {
    type: "logic_switch",
    label: "Switch / Router",
    description: "פצל לנתיבים מרובים",
    category: "logic",
    icon: "🔀",
    color: "bg-slate-600",
    textColor: "text-slate-700",
    inputs: [{ id: "in", label: "data", side: "top" }],
    outputs: [
      { id: "case1", label: "Case 1", side: "bottom" },
      { id: "case2", label: "Case 2", side: "right" },
      { id: "default", label: "ברירת מחדל", side: "left" },
    ],
    configFields: [
      { key: "field",  label: "שדה לבדיקה", type: "text",  placeholder: "{{data.type}}" },
      { key: "case1",  label: "Case 1 ערך",  type: "text",  placeholder: "whatsapp" },
      { key: "case2",  label: "Case 2 ערך",  type: "text",  placeholder: "email" },
    ],
    estimatedMs: 1,
  },
  {
    type: "logic_loop",
    label: "Loop / Iterator",
    description: "עבור על כל פריט ברשימה",
    category: "logic",
    icon: "🔁",
    color: "bg-slate-600",
    textColor: "text-slate-700",
    inputs: [{ id: "in", label: "array", side: "top" }],
    outputs: [
      { id: "item", label: "item", side: "bottom" },
      { id: "done", label: "סיום", side: "right" },
    ],
    configFields: [
      { key: "array_field", label: "שדה מערך", type: "text", placeholder: "{{payments}}" },
      { key: "batch_size",  label: "Batch Size", type: "number", default: 10 },
    ],
    estimatedMs: 1,
  },
  {
    type: "logic_transform",
    label: "Transform",
    description: "עצב נתונים מחדש",
    category: "logic",
    icon: "🔧",
    color: "bg-slate-600",
    textColor: "text-slate-700",
    inputs: [{ id: "in", label: "data", side: "top" }],
    outputs: [{ id: "out", label: "transformed", side: "bottom" }],
    configFields: [
      { key: "mapping", label: "מיפוי שדות (JSON)", type: "code", placeholder: '{\n  "name": "{{input.full_name}}",\n  "phone": "{{input.phone}}"\n}' },
    ],
    estimatedMs: 1,
  },
  {
    type: "logic_filter",
    label: "Filter",
    description: "סנן פריטים לפי תנאי",
    category: "logic",
    icon: "🔽",
    color: "bg-slate-600",
    textColor: "text-slate-700",
    inputs: [{ id: "in", label: "array", side: "top" }],
    outputs: [
      { id: "passed", label: "עבר סינון", side: "bottom" },
      { id: "filtered", label: "נסנן", side: "right" },
    ],
    configFields: [
      { key: "field",    label: "שדה",   type: "text" },
      { key: "operator", label: "תנאי",  type: "select", options: [{ value: "eq", label: "שווה" }, { value: "gt", label: "גדול מ" }, { value: "contains", label: "מכיל" }] },
      { key: "value",    label: "ערך",   type: "text" },
    ],
    estimatedMs: 1,
  },
];

/* ─────────── EXPORT ─────────── */

export const ALL_NODES: NodeTypeDef[] = [
  ...TRIGGERS,
  ...ACTIONS,
  ...AI_NODES,
  ...LOGIC_NODES,
];

export const NODES_BY_TYPE = Object.fromEntries(
  ALL_NODES.map((n) => [n.type, n])
) as Record<string, NodeTypeDef>;

export const CATEGORY_META: Record<NodeCategory, { label: string; color: string; border: string; bg: string }> = {
  trigger: { label: "Triggers",  color: "text-sky-700",    border: "border-sky-200",    bg: "bg-sky-50"    },
  action:  { label: "פעולות",    color: "text-indigo-700", border: "border-indigo-200", bg: "bg-indigo-50" },
  ai:      { label: "AI סוכנים", color: "text-violet-700", border: "border-violet-200", bg: "bg-violet-50" },
  logic:   { label: "לוגיקה",    color: "text-slate-700",  border: "border-slate-200",  bg: "bg-slate-50"  },
};
