"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Send, Zap, ChevronLeft, Loader2, Command, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: CommandAction[];
  timestamp: Date;
}

interface CommandAction {
  label: string;
  icon: string;
  type: "whatsapp" | "email" | "deploy" | "create" | "report" | "n8n";
  executed?: boolean;
}

const exampleCommands = [
  "שלח WhatsApp לכל הלקוחות שלא שילמו החודש",
  "צור דוח הכנסות של החודש האחרון",
  "deploy את כל האתרים שבסטטוס error",
  "הצג לי את 5 הלידים הכי חמים",
  "הפעל את workflow שליחת תזכורות תשלום",
  "מה הסטטוס של כל השרתים?",
  "צור לקוח חדש מהליד של אבי גולדברג",
  "שלח דו״ח שבועי לכל הלקוחות על האתר שלהם",
];

const mockResponses: Record<string, { content: string; actions?: CommandAction[] }> = {
  default: {
    content: "ביצעתי את הפקודה! הנה מה שעשיתי:",
    actions: [
      { label: "פתח בN8N", icon: "⚡", type: "n8n" },
      { label: "צפה בתוצאות", icon: "👁", type: "report" },
    ]
  }
};

export default function CommandCenterPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "שלום! אני ה-AI Command Center שלך. אני יכול לבצע כל פעולה במערכת בשפה טבעית. מה תרצה לעשות?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const parseCommand = (text: string): { content: string; actions?: CommandAction[] } => {
    const lower = text.toLowerCase();

    if (lower.includes("whatsapp") || lower.includes("שלח")) {
      return {
        content: `מעולה! זיהיתי פקודת שליחת WhatsApp. בדקתי את הנתונים:\n\n• מצאתי 3 לקוחות עם תשלום פתוח החודש\n• יוסי כהן - ₪2,400 (איחור של 5 ימים)\n• שרה לוי - ₪1,800 (איחור של 2 ימים)\n• דוד מזרחי - ₪3,200 (איחור של יום)\n\nהפעלתי את workflow "תזכורת תשלום" ב-N8N. ההודעות ישלחו תוך 30 שניות.`,
        actions: [
          { label: "אשר שליחה (3 הודעות)", icon: "✅", type: "whatsapp" },
          { label: "בטל", icon: "❌", type: "n8n" },
          { label: "ערוך הודעה", icon: "✏️", type: "create" },
        ]
      };
    }

    if (lower.includes("דוח") || lower.includes("report") || lower.includes("הכנסות")) {
      return {
        content: `יצרתי דוח הכנסות מלא:\n\n📊 **סיכום החודש**\n• סה״כ הכנסות: ₪47,850\n• שולם: ₪38,200 (79.8%)\n• ממתין: ₪9,650 (20.2%)\n• לקוחות חדשים: 4\n• לקוחות שחידשו: 7\n\n📈 שינוי לעומת חודש קודם: +23%`,
        actions: [
          { label: "הורד PDF", icon: "📄", type: "report" },
          { label: "שלח לאימייל", icon: "📧", type: "email" },
          { label: "שתף בדשבורד", icon: "📊", type: "report" },
        ]
      };
    }

    if (lower.includes("deploy") || lower.includes("error")) {
      return {
        content: `בדקתי את כל האתרים. מצאתי 2 אתרים בסטטוס error:\n\n🔴 **client-store.co.il** - build error: package version conflict\n🔴 **agency-site.com** - deploy failed: environment variable missing\n\nהכנתי fix אוטומטי לשני האתרים. רוצה שאריץ?`,
        actions: [
          { label: "תקן והפעל deploy", icon: "🚀", type: "deploy" },
          { label: "פרטים נוספים", icon: "🔍", type: "report" },
          { label: "פנה ל-Coolify", icon: "🖥️", type: "n8n" },
        ]
      };
    }

    if (lower.includes("לידים") || lower.includes("חמים")) {
      return {
        content: `הנה 5 הלידים הכי חמים לפי AI Score:\n\n1. 🔥 **אבי גולדברג** (92) - רוצה ecommerce, תקציב גבוה - **התקשר עכשיו!**\n2. 🔥 **יוסי מזרחי** (85) - חיכה להצעה 3 ימים - **שלח follow-up**\n3. 🌡️ **מיכל לב** (78) - נכנסה לאתר 4 פעמים - **חמה מאוד**\n4. 🌡️ **ראובן כהן** (71) - LinkedIn - ב2b טוב\n5. 💛 **תמר שפר** (65) - ממתינה להצעה`,
        actions: [
          { label: "שלח WhatsApp לטופ 3", icon: "💬", type: "whatsapp" },
          { label: "צור קמפיין email", icon: "📧", type: "email" },
          { label: "פתח Kanban", icon: "📋", type: "report" },
        ]
      };
    }

    if (lower.includes("שרתים") || lower.includes("סטטוס")) {
      return {
        content: `סקנתי את כל התשתיות:\n\n🟢 **Production Server** (10.0.0.1) - תקין | CPU: 23% | RAM: 45% | Disk: 34%\n🟢 **Dev Server** (10.0.0.2) - תקין | CPU: 8% | RAM: 31% | Disk: 67%\n\n📦 **Containers**: 12/14 פעילים\n⚠️ 2 containers בסטטוס stopped:\n• postgres-backup - הופסק ידנית\n• redis-cache - crashed לפני שעה (auto-restart כשל)\n\n💡 AI מציע: הפעל מחדש את redis-cache עכשיו`,
        actions: [
          { label: "הפעל redis-cache", icon: "▶️", type: "deploy" },
          { label: "פתח Coolify", icon: "🖥️", type: "n8n" },
          { label: "הגדר monitor", icon: "👁️", type: "n8n" },
        ]
      };
    }

    return {
      content: `מעולה! מבין את הפקודה: "${text}"\n\nבודק את הנתונים הרלוונטיים ומכין פלן פעולה...\n\n✅ זיהיתי 3 צעדים לביצוע\n⚡ מפעיל N8N workflow מתאים\n📊 אאסוף נתונים ואחזור עם עדכון`,
      actions: [
        { label: "ראה פרטים", icon: "🔍", type: "report" },
        { label: "בצע עכשיו", icon: "⚡", type: "n8n" },
      ]
    };
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1200));

    const response = parseCommand(input);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.content,
      actions: response.actions,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
              <Brain className="h-4 w-4 text-white" />
            </div>
            AI Command Center
          </h2>
          <p className="text-muted-foreground">הפקד כל דבר במערכת בשפה טבעית</p>
        </div>
        <Badge className="gap-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
          <Sparkles className="h-3 w-3" />
          Powered by Claude
        </Badge>
      </div>

      {/* Capabilities */}
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 shrink-0">
        {[
          { icon: "💬", label: "שלח WhatsApp/Email", desc: "לפלחים חכמים" },
          { icon: "🚀", label: "Deploy & Rollback", desc: "אוטומטי עם AI" },
          { icon: "📊", label: "דוחות חכמים", desc: "תוך שניות" },
          { icon: "⚡", label: "הפעל Workflows", desc: "N8N + Coolify" },
        ].map((cap) => (
          <Card key={cap.label} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-3 text-center">
              <div className="text-2xl mb-1">{cap.icon}</div>
              <p className="text-xs font-medium">{cap.label}</p>
              <p className="text-xs text-muted-foreground">{cap.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chat */}
      <Card className="flex-1 flex flex-col min-h-96">
        <CardContent className="flex flex-col h-full p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <Brain className="h-3.5 w-3.5 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-600">AI Command</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>

                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/30">
                      {msg.actions.map((action, i) => (
                        <Button
                          key={i}
                          size="sm"
                          variant={i === 0 ? "default" : "outline"}
                          className="text-xs h-7 gap-1"
                        >
                          <span>{action.icon}</span>
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  <span className="text-sm text-muted-foreground">AI מעבד את הפקודה...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Example Commands */}
          <div className="px-4 pb-2 shrink-0">
            <p className="text-xs text-muted-foreground mb-2">פקודות מהירות:</p>
            <div className="flex flex-wrap gap-1.5">
              {exampleCommands.slice(0, 4).map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => setInput(cmd)}
                  className="text-xs bg-accent hover:bg-accent/80 rounded-full px-2.5 py-1 transition-colors border truncate max-w-xs"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t p-4 shrink-0">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
                <Command className="h-4 w-4 text-muted-foreground shrink-0" />
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="הקלד פקודה בעברית... (לדוגמה: שלח WhatsApp לכל הלקוחות)"
                  rows={1}
                  className="flex-1 bg-transparent text-sm resize-none focus:outline-none"
                />
              </div>
              <Button onClick={handleSend} disabled={!input.trim() || loading} className="gap-2 shrink-0">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                שלח
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              ⌨️ Enter לשליחה · Shift+Enter לשורה חדשה · דובר עברית ואנגלית
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
