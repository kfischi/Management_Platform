"use client";

import * as React from "react";
import { Bot, Plus, Sparkles, Brain, Send, Trash2, ChevronDown, Settings, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MODELS = [
  { id: "claude-opus-4-6",   label: "Claude Opus 4.6",   provider: "claude" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", provider: "claude" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", provider: "claude" },
  { id: "gpt-4o",            label: "GPT-4o",            provider: "openai" },
  { id: "gpt-4o-mini",       label: "GPT-4o Mini",       provider: "openai" },
];

const SYSTEM_PRESETS = [
  { label: "עוזר כללי",       value: "You are a helpful assistant for a digital agency. Answer concisely in the same language as the user." },
  { label: "כתיבת תוכן",      value: "You are a creative content writer specializing in Hebrew and English marketing content for digital agencies. Write engaging, concise content." },
  { label: "ניתוח לידים",     value: "You are a sales analyst. Given information about a lead, score their potential (0-100), suggest follow-up actions, and identify key selling points." },
  { label: "Code Assistant",  value: "You are a senior full-stack developer. Review code, suggest improvements, and write clean, typed TypeScript/React code." },
  { label: "SEO Advisor",     value: "You are an SEO expert. Analyze content and URLs, provide actionable optimization suggestions, and explain best practices." },
];

const mockBots = [
  { id: "cb-1", name: "Support Bot — Client A", site: "client-a.co.il", model: "claude-opus-4-6", provider: "claude", active: true,  conversations: 234, satisfaction: 4.8 },
  { id: "cb-2", name: "Lead Bot — WMA",         site: "wma.co.il",      model: "gpt-4o",          provider: "openai", active: true,  conversations: 89,  satisfaction: 4.6 },
  { id: "cb-3", name: "SEO Advisor Bot",        site: "wma.co.il",      model: "claude-sonnet-4-6", provider: "claude", active: false, conversations: 12,  satisfaction: 4.9 },
];

export default function AIToolsPage() {
  const [tab, setTab] = React.useState<"playground" | "bots">("playground");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [model, setModel] = React.useState("claude-opus-4-6");
  const [system, setSystem] = React.useState(SYSTEM_PRESETS[0].value);
  const [showSystem, setShowSystem] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, model, system }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה");
      setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "שגיאה";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI & צ׳אטבוטים
          </h2>
          <p className="text-muted-foreground text-sm">Claude + OpenAI · playground חי · ניהול bots</p>
        </div>
        <Button className="gap-2" onClick={() => setTab("bots")}>
          <Plus className="h-4 w-4" />
          Bot חדש
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {[
          { key: "playground", label: "Playground", icon: MessageSquare },
          { key: "bots",       label: "Chatbots",   icon: Bot },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Playground */}
      {tab === "playground" && (
        <div className="grid grid-cols-[1fr_280px] gap-4 items-start">
          {/* Chat area */}
          <Card className="flex flex-col" style={{ height: "62vh" }}>
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Sparkles className="h-10 w-10 text-purple-400 mb-3 opacity-60" />
                  <p className="font-medium text-slate-700">AI Playground</p>
                  <p className="text-sm text-muted-foreground mt-1">שלח הודעה כדי להתחיל</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-2", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-purple-100 text-purple-700"
                  )}>
                    {m.role === "user" ? "א" : "AI"}
                  </div>
                  <div className={cn(
                    "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted rounded-tl-sm"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold">AI</div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                  </div>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <div ref={endRef} />
            </CardContent>

            {/* Input */}
            <div className="border-t p-3 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="שלח הודעה..."
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                dir="auto"
              />
              {messages.length > 0 && (
                <Button size="icon" variant="ghost" className="shrink-0 h-9 w-9" onClick={() => { setMessages([]); setError(null); }} title="נקה שיחה">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
              <Button size="icon" className="shrink-0 h-9 w-9 bg-purple-600 hover:bg-purple-700" onClick={sendMessage} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Settings panel */}
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm">מודל</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="relative">
                  <select
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">System Prompt</CardTitle>
                  <button
                    onClick={() => setShowSystem(v => !v)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {showSystem ? "סגור" : "ערוך"}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {SYSTEM_PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => setSystem(p.value)}
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                        system === p.value
                          ? "bg-purple-100 border-purple-300 text-purple-700 font-medium"
                          : "hover:bg-accent text-muted-foreground"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {showSystem && (
                  <textarea
                    value={system}
                    onChange={e => setSystem(e.target.value)}
                    rows={5}
                    className="w-full rounded-lg border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    dir="auto"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">API Keys</span> מוגדרות בדף{" "}
                  <a href="/admin/settings" className="text-primary hover:underline">הגדרות → AI</a>.
                  {" "}בחר provider בשדה &quot;ai_provider&quot;.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Chatbots tab */}
      {tab === "bots" && (
        <div className="space-y-4">
          <div className="divide-y rounded-xl border overflow-hidden bg-white">
            {mockBots.map(bot => (
              <div key={bot.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/30 transition-colors">
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                  bot.provider === "claude" ? "bg-purple-100" : "bg-green-100"
                )}>
                  <Bot className={cn("h-4 w-4", bot.provider === "claude" ? "text-purple-600" : "text-green-600")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{bot.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{bot.site}</span>
                    <span>·</span>
                    <Badge variant="secondary" className="text-[10px] py-0">{bot.model}</Badge>
                    <span>{bot.conversations} שיחות</span>
                    <span>⭐ {bot.satisfaction}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={bot.active ? "success" : "secondary"} className="text-xs">
                    {bot.active ? "פעיל" : "כבוי"}
                  </Badge>
                  <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                    <Settings className="h-3 w-3" />
                    הגדר
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Bot className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm font-medium">הוסף Chatbot חדש</p>
              <p className="text-xs text-muted-foreground mt-1 mb-3">חבר לאתר לקוח עם Claude או GPT-4</p>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                צור Bot
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
