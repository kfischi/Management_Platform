"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Globe, Users, Target, FileText, CreditCard, Zap,
  Server, Bot, MessageSquare, Image, Settings, Share2, Brain,
  Calendar, Search, Heart, Globe2, Receipt, Plus, LogOut,
  Command, ArrowRight, Hash
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const navigate = useCallback((path: string) => {
    router.push(path);
    setOpen(false);
    setQuery("");
  }, [router]);

  const commands: CommandItem[] = [
    // Navigation
    { id: "dashboard", title: "דשבורד", subtitle: "סקירה כללית", icon: <LayoutDashboard className="h-4 w-4" />, action: () => navigate("/admin/dashboard"), category: "ניווט" },
    { id: "command", title: "AI Command Center", subtitle: "הפקד בשפה טבעית", icon: <Brain className="h-4 w-4 text-purple-500" />, action: () => navigate("/admin/command"), category: "ניווט", keywords: ["ai", "command", "פקודה"] },
    { id: "sites", title: "אתרים", subtitle: "ניהול אתרים", icon: <Globe className="h-4 w-4" />, action: () => navigate("/admin/sites"), category: "ניווט" },
    { id: "leads", title: "לידים", subtitle: "Pipeline לידים", icon: <Target className="h-4 w-4" />, action: () => navigate("/admin/leads"), category: "ניווט" },
    { id: "clients", title: "לקוחות", subtitle: "CRM", icon: <Users className="h-4 w-4" />, action: () => navigate("/admin/crm/clients"), category: "ניווט" },
    { id: "health", title: "Client Health", subtitle: "ניטור לקוחות AI", icon: <Heart className="h-4 w-4 text-red-500" />, action: () => navigate("/admin/clients-health"), category: "ניווט" },
    { id: "proposals", title: "הצעות מחיר", subtitle: "מחולל AI", icon: <Receipt className="h-4 w-4" />, action: () => navigate("/admin/proposals"), category: "ניווט" },
    { id: "calendar", title: "לוח תוכן", subtitle: "תזמון פוסטים", icon: <Calendar className="h-4 w-4" />, action: () => navigate("/admin/calendar"), category: "ניווט" },
    { id: "social", title: "רשתות חברתיות", subtitle: "FB/IG/LinkedIn", icon: <Share2 className="h-4 w-4" />, action: () => navigate("/admin/social"), category: "ניווט" },
    { id: "seo", title: "SEO Analyzer", subtitle: "ניתוח AI", icon: <Search className="h-4 w-4" />, action: () => navigate("/admin/seo"), category: "ניווט" },
    { id: "domains", title: "דומיינים & SSL", subtitle: "ניטור תוקפים", icon: <Globe2 className="h-4 w-4" />, action: () => navigate("/admin/domains"), category: "ניווט" },
    { id: "automations", title: "אוטומציות N8N", subtitle: "Workflows", icon: <Zap className="h-4 w-4" />, action: () => navigate("/admin/automations"), category: "ניווט" },
    { id: "infra", title: "תשתיות Coolify", subtitle: "Servers & containers", icon: <Server className="h-4 w-4" />, action: () => navigate("/admin/infrastructure"), category: "ניווט" },
    { id: "ai", title: "AI & Chatbots", subtitle: "Claude + OpenAI", icon: <Bot className="h-4 w-4" />, action: () => navigate("/admin/ai-tools"), category: "ניווט" },
    { id: "communications", title: "תקשורת", subtitle: "WhatsApp + Email", icon: <MessageSquare className="h-4 w-4" />, action: () => navigate("/admin/communications"), category: "ניווט" },
    { id: "media", title: "מדיה", subtitle: "ספריית קבצים", icon: <Image className="h-4 w-4" />, action: () => navigate("/admin/media"), category: "ניווט" },
    { id: "settings", title: "הגדרות", subtitle: "API Keys & Configuration", icon: <Settings className="h-4 w-4" />, action: () => navigate("/admin/settings"), category: "ניווט" },

    // Actions
    { id: "new-lead", title: "ליד חדש", subtitle: "הוסף ליד לPipeline", icon: <Plus className="h-4 w-4 text-green-500" />, action: () => navigate("/admin/leads?new=true"), category: "פעולות", keywords: ["new", "lead", "create"] },
    { id: "new-proposal", title: "הצעת מחיר חדשה", subtitle: "צור הצעה עם AI", icon: <Plus className="h-4 w-4 text-blue-500" />, action: () => navigate("/admin/proposals"), category: "פעולות" },
    { id: "new-post", title: "פוסט חדש לסושיאל", subtitle: "פרסם בכל הפלטפורמות", icon: <Plus className="h-4 w-4 text-purple-500" />, action: () => navigate("/admin/social"), category: "פעולות" },
    { id: "seo-check", title: "בדוק SEO לאתר", subtitle: "הרץ ניתוח AI", icon: <Search className="h-4 w-4 text-orange-500" />, action: () => navigate("/admin/seo"), category: "פעולות" },
    { id: "logout", title: "התנתק", subtitle: "יציאה מהמערכת", icon: <LogOut className="h-4 w-4 text-red-500" />, action: () => navigate("/auth/login"), category: "פעולות" },
  ];

  const filtered = commands.filter(cmd => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle?.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords?.some(k => k.toLowerCase().includes(q))
    );
  });

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery("");
        setSelected(0);
      }
      if (!open) return;

      if (e.key === "Escape") { setOpen(false); setQuery(""); }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected(p => Math.min(p + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected(p => Math.max(p - 1, 0)); }
      if (e.key === "Enter") {
        e.preventDefault();
        filtered[selected]?.action();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, selected]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelected(0);
    }
  }, [open]);

  if (!open) return null;

  let globalIndex = 0;

  return (
    <div
      className="cmd-overlay animate-fade-in"
      onClick={() => { setOpen(false); setQuery(""); }}
    >
      <div
        className="w-full max-w-xl mx-4 rounded-2xl shadow-2xl border bg-white overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Command className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            placeholder="חפש דף, פעולה, לקוח..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              לא נמצאו תוצאות
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-2">
                <div className="flex items-center gap-2 px-2 py-1">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {category}
                  </span>
                </div>
                {items.map((item) => {
                  const isSelected = selected === globalIndex;
                  const currentIndex = globalIndex++;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelected(currentIndex)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-right ${
                        isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                        isSelected ? "bg-primary/10" : "bg-muted"
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-sm font-medium">{item.title}</p>
                        {item.subtitle && (
                          <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                        )}
                      </div>
                      {isSelected && (
                        <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t bg-muted/30">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">↑↓</kbd>
            ניווט
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">↵</kbd>
            בחר
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">ESC</kbd>
            סגור
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">⌘K</kbd>
            לפתוח שוב
          </div>
        </div>
      </div>
    </div>
  );
}
