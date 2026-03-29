"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Copy, Check, Code2, Plus, Globe, Zap, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type ChatbotRow = Database["public"]["Tables"]["chatbots"]["Row"];

interface Props {
  initialChatbots: (ChatbotRow & { sites: { id: string; name: string } | null })[];
  availableSites: { id: string; name: string; status: string }[];
}

function EmbedSnippet({ siteId }: { siteId: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="${typeof window !== "undefined" ? window.location.origin : ""}/api/chatbot/${siteId}/embed"></script>`;

  function copy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-slate-900 rounded-xl p-3 flex items-center gap-2 group">
      <code className="text-xs text-emerald-400 flex-1 truncate font-mono">{snippet}</code>
      <button
        onClick={copy}
        className="shrink-0 text-slate-400 hover:text-white transition-colors"
        title="העתק"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export default function ChatbotBuilderDashboard({ initialChatbots, availableSites }: Props) {
  const [chatbots, setChatbots] = useState(initialChatbots);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedSite, setSelectedSite] = useState("");
  const [botName, setBotName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("אתה עוזר אדיב ומקצועי. ענה תמיד בעברית.");
  const [error, setError] = useState<string | null>(null);

  async function createChatbot() {
    if (!selectedSite || !botName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/chatbots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: botName.trim(),
          site_id: selectedSite,
          system_prompt: systemPrompt,
          ai_provider: "claude",
          model: "claude-haiku-4-5-20251001",
          is_active: true,
          config: {},
        }),
      });
      if (!res.ok) throw new Error("שגיאה ביצירת chatbot");
      const newBot = await res.json();
      const site = availableSites.find(s => s.id === selectedSite) ?? null;
      setChatbots(prev => [{ ...newBot, sites: site ? { id: site.id, name: site.name } : null }, ...prev]);
      setShowForm(false);
      setBotName("");
      setSelectedSite("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chatbot Builder</h1>
          <p className="text-slate-500 text-sm mt-1">צור chatbots AI לאתרים שלך והטמע בשורת קוד אחת</p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4" /> Chatbot חדש
        </Button>
      </div>

      {/* How it works */}
      <Card className="border-indigo-200 bg-indigo-50/40">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Code2 className="h-5 w-5 text-indigo-600" />
            <p className="font-semibold text-indigo-800">איך מטמיעים?</p>
          </div>
          <p className="text-sm text-indigo-700 mb-3">
            הוסף שורה אחת לפני סגירת <code className="bg-indigo-100 px-1 rounded">&lt;/body&gt;</code> בכל אתר:
          </p>
          <div className="bg-slate-900 rounded-xl p-3">
            <code className="text-xs text-emerald-400 font-mono">
              {`<script src="https://yourapp.com/api/chatbot/[SITE_ID]/embed"></script>`}
            </code>
          </div>
          <p className="text-xs text-indigo-600 mt-2">
            כפתור הצ&#39;אט יופיע אוטומטית בפינה הימנית התחתונה של האתר.
          </p>
        </CardContent>
      </Card>

      {/* Create form */}
      {showForm && (
        <Card className="border-slate-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-600" /> Chatbot חדש
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">שם הבוט *</label>
                <input
                  className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="עוזר לאתר X"
                  value={botName}
                  onChange={e => setBotName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">אתר *</label>
                <select
                  className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={selectedSite}
                  onChange={e => setSelectedSite(e.target.value)}
                >
                  <option value="">בחר אתר...</option>
                  {availableSites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">System Prompt</label>
              <textarea
                className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                rows={3}
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button
                onClick={createChatbot}
                disabled={creating || !selectedSite || !botName.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                צור Chatbot
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>ביטול</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chatbot list */}
      {chatbots.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Bot className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">אין chatbots עדיין</p>
          <p className="text-sm">צור את הראשון ↑</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chatbots.map(bot => (
            <Card key={bot.id} className="border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{bot.name}</p>
                      {bot.sites && (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {bot.sites.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      "text-xs",
                      bot.is_active
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-slate-100 text-slate-500"
                    )}>
                      {bot.is_active ? "פעיל" : "כבוי"}
                    </Badge>
                    <Badge className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      {bot.model}
                    </Badge>
                    {bot.sites && (
                      <a
                        href={`/sites/${bot.sites.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {bot.system_prompt && (
                  <p className="text-xs text-slate-500 italic mb-3 bg-slate-50 rounded-lg px-3 py-2 line-clamp-2">
                    {bot.system_prompt}
                  </p>
                )}

                {/* Embed snippet */}
                {bot.site_id && (
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1.5">קוד הטמעה:</p>
                    <EmbedSnippet siteId={bot.site_id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
