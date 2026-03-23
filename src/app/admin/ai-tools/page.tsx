import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Plus, MessageSquare, Sparkles, Brain, Code2, Zap, Settings } from "lucide-react";

const mockChatbots = [
  {
    id: "cb-1",
    name: "Support Bot - Client A",
    site: "client-a.co.il",
    provider: "claude",
    model: "claude-opus-4-6",
    isActive: true,
    conversations: 234,
    satisfaction: 4.8,
  },
  {
    id: "cb-2",
    name: "Lead Bot - NBH",
    site: "nbh.co.il",
    provider: "openai",
    model: "gpt-4o",
    isActive: true,
    conversations: 89,
    satisfaction: 4.6,
  },
];

const aiCapabilities = [
  {
    id: "cap-1",
    title: "Chat Agent",
    description: "בניית chatbots מתקדמים עם memory, context, ו-tools",
    icon: "🤖",
    actions: ["יצור Agent חדש", "ערוך System Prompt", "בדוק Conversations"],
  },
  {
    id: "cap-2",
    title: "Content Generator",
    description: "יצירת תוכן לסושיאל, בלוג, אימייל בעברית ואנגלית",
    icon: "✍️",
    actions: ["צור פוסט", "כתוב אימייל", "נסח תיאור מוצר"],
  },
  {
    id: "cap-3",
    title: "Lead Analyzer",
    description: "ניתוח לידים וסיווג אוטומטי לפי פוטנציאל עסקי",
    icon: "🎯",
    actions: ["נתח ליד", "דרג פוטנציאל", "הצע תגובה"],
  },
  {
    id: "cap-4",
    title: "Code Assistant",
    description: "עזרה בפיתוח, debug, ו-code review לפרויקטים",
    icon: "💻",
    actions: ["בדוק קוד", "הצע שיפורים", "צור component"],
  },
];

export default function AIToolsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI & צ׳אטבוטים</h2>
          <p className="text-muted-foreground">Claude API + OpenAI · {mockChatbots.length} bots פעילים</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Bot חדש
        </Button>
      </div>

      {/* Provider Status */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { name: "Claude (Anthropic)", model: "claude-opus-4-6", status: true, icon: "🟣", requests: "1,234" },
          { name: "OpenAI", model: "gpt-4o", status: true, icon: "🟢", requests: "567" },
        ].map((provider) => (
          <Card key={provider.name} className={provider.status ? "border-green-200" : "border-red-200"}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{provider.icon}</span>
                <div>
                  <p className="font-medium text-sm">{provider.name}</p>
                  <p className="text-xs text-muted-foreground">Model: {provider.model}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={provider.status ? "success" : "destructive"} className="text-xs mb-1">
                  {provider.status ? "מחובר" : "שגיאה"}
                </Badge>
                <p className="text-xs text-muted-foreground">{provider.requests} requests היום</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Chatbots */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Chatbots פעילים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockChatbots.map((bot) => (
              <div key={bot.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{bot.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{bot.site}</span>
                      <span>·</span>
                      <Badge variant="secondary" className="text-xs">{bot.provider}</Badge>
                      <span>{bot.model}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{bot.conversations} שיחות</p>
                    <p>⭐ {bot.satisfaction}/5</p>
                  </div>
                  <Badge variant={bot.isActive ? "success" : "secondary"} className="text-xs">
                    {bot.isActive ? "פעיל" : "כבוי"}
                  </Badge>
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <Settings className="h-3 w-3" />
                    הגדר
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Capabilities */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          יכולות AI מובנות
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {aiCapabilities.map((cap) => (
            <Card key={cap.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{cap.icon}</span>
                  <p className="font-medium">{cap.title}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{cap.description}</p>
                <div className="flex flex-wrap gap-2">
                  {cap.actions.map((action) => (
                    <Button key={action} size="sm" variant="outline" className="text-xs h-7">
                      {action}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat Playground */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Playground
          </CardTitle>
          <CardDescription>בדוק את ה-AI ישירות ממשק הניהול</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-4 min-h-32 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Brain className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">הקלד שאלה או משימה לבדיקה</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              placeholder="שאל את ה-AI משהו..."
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button className="gap-1">
              <Zap className="h-4 w-4" />
              שלח
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
