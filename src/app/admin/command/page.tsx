"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Send, Loader2, Command, Sparkles, AlertCircle } from "lucide-react";

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

const COMMAND_SYSTEM = `You are an AI Command Center for a digital agency management platform called WMA Agency Platform.
You help the admin manage clients, sites, deployments, leads, payments, and automations via natural language in Hebrew or English.
You are proactive, concise, and action-oriented. When asked to do something:
1. Explain what you found / what you will do in 2-3 lines
2. List any relevant data points (clients, amounts, sites) with bullet points
3. Suggest 2-3 concrete next actions with emoji labels
4. Always respond in the same language as the user (Hebrew/English)
You do NOT have direct API access in this demo, but you should respond as if you do and suggest the actions clearly.`;

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
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError(null);

    // Build payload for AI — only role+content, no extra fields
    const payload = updatedMessages.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/admin/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payload,
          model: "claude-opus-4-6",
          system: COMMAND_SYSTEM,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה");

      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: data.content, timestamp: new Date() },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "שגיאה";
      setError(msg);
    } finally {
      setLoading(false);
    }
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
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error.includes("not configured") ? (
                  <span>הגדר Claude API Key ב<a href="/admin/settings" className="underline font-medium">הגדרות → AI</a> כדי להשתמש ב-AI אמיתי.</span>
                ) : error}
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
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
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
