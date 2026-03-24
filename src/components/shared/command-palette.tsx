"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Globe, Users, Target, FileText, CreditCard, Zap,
  Server, Bot, MessageSquare, Image, Settings, Share2, Brain,
  Calendar, Search, Heart, Globe2, Receipt, Plus, LogOut,
  Command, ArrowRight, Hash, Clock, Sparkles, Keyboard,
  Building, DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────── types ─────────── */

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  keywords?: string[];
  shortcut?: string;
}

/* ─────────── recent items (localStorage) ─────────── */

const RECENT_KEY = "cmd_recent";

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(id: string) {
  try {
    const prev = getRecent().filter((x) => x !== id);
    localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...prev].slice(0, 5)));
  } catch {
    // ignore
  }
}

/* ─────────── component ─────────── */

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const navigate = useCallback((path: string, id: string) => {
    saveRecent(id);
    setRecent(getRecent());
    router.push(path);
    setOpen(false);
    setQuery("");
  }, [router]);

  const COMMANDS: CommandItem[] = useMemo(() => [
    // Navigation
    { id: "dashboard",    title: "דשבורד",              subtitle: "סקירה כללית",           icon: <LayoutDashboard className="h-4 w-4" />,              action: () => navigate("/admin/dashboard", "dashboard"),    category: "ניווט", shortcut: "G D" },
    { id: "command",      title: "AI Command Center",    subtitle: "הפקד בשפה טבעית",       icon: <Brain className="h-4 w-4 text-purple-500" />,       action: () => navigate("/admin/command", "command"),        category: "ניווט", keywords: ["ai", "command", "פקודה"] },
    { id: "sites",        title: "אתרים",               subtitle: "ניהול אתרים",            icon: <Globe className="h-4 w-4 text-blue-500" />,         action: () => navigate("/admin/sites", "sites"),            category: "ניווט", shortcut: "G S" },
    { id: "leads",        title: "לידים",               subtitle: "Pipeline לידים",         icon: <Target className="h-4 w-4 text-orange-500" />,      action: () => navigate("/admin/leads", "leads"),            category: "ניווט", shortcut: "G L" },
    { id: "clients",      title: "לקוחות",              subtitle: "CRM",                    icon: <Building className="h-4 w-4 text-indigo-500" />,    action: () => navigate("/admin/crm/clients", "clients"),    category: "ניווט", shortcut: "G C" },
    { id: "contracts",    title: "חוזים",               subtitle: "ניהול חוזים",            icon: <FileText className="h-4 w-4 text-slate-500" />,     action: () => navigate("/admin/crm/contracts", "contracts"),category: "ניווט" },
    { id: "payments",     title: "תשלומים",             subtitle: "הכנסות ותשלומים",        icon: <DollarSign className="h-4 w-4 text-green-500" />,   action: () => navigate("/admin/crm/payments", "payments"),  category: "ניווט" },
    { id: "users",        title: "משתמשים",             subtitle: "ניהול משתמשים",          icon: <Users className="h-4 w-4 text-purple-500" />,       action: () => navigate("/admin/users", "users"),            category: "ניווט", shortcut: "G U" },
    { id: "health",       title: "Client Health",        subtitle: "ניטור לקוחות AI",       icon: <Heart className="h-4 w-4 text-red-500" />,          action: () => navigate("/admin/clients-health", "health"),  category: "ניווט" },
    { id: "proposals",    title: "הצעות מחיר",          subtitle: "מחולל AI",              icon: <Receipt className="h-4 w-4 text-teal-500" />,       action: () => navigate("/admin/proposals", "proposals"),    category: "ניווט" },
    { id: "calendar",     title: "לוח תוכן",            subtitle: "תזמון פוסטים",           icon: <Calendar className="h-4 w-4 text-pink-500" />,      action: () => navigate("/admin/calendar", "calendar"),      category: "ניווט" },
    { id: "social",       title: "רשתות חברתיות",       subtitle: "FB/IG/LinkedIn",         icon: <Share2 className="h-4 w-4 text-blue-400" />,        action: () => navigate("/admin/social", "social"),          category: "ניווט" },
    { id: "seo",          title: "SEO Analyzer",         subtitle: "ניתוח AI",              icon: <Search className="h-4 w-4 text-yellow-600" />,      action: () => navigate("/admin/seo", "seo"),                category: "ניווט" },
    { id: "domains",      title: "דומיינים & SSL",       subtitle: "ניטור תוקפים",          icon: <Globe2 className="h-4 w-4 text-cyan-600" />,        action: () => navigate("/admin/domains", "domains"),        category: "ניווט" },
    { id: "automations",  title: "אוטומציות N8N",        subtitle: "Workflows",              icon: <Zap className="h-4 w-4 text-yellow-500" />,         action: () => navigate("/admin/automations", "automations"),category: "ניווט" },
    { id: "infra",        title: "תשתיות Coolify",       subtitle: "Servers & containers",  icon: <Server className="h-4 w-4 text-slate-600" />,       action: () => navigate("/admin/infrastructure", "infra"),   category: "ניווט" },
    { id: "ai",           title: "AI & Chatbots",        subtitle: "Claude + OpenAI",        icon: <Bot className="h-4 w-4 text-violet-500" />,         action: () => navigate("/admin/ai-tools", "ai"),            category: "ניווט" },
    { id: "communications",title: "תקשורת",             subtitle: "WhatsApp + Email",       icon: <MessageSquare className="h-4 w-4 text-green-500" />,action: () => navigate("/admin/communications", "comm"),    category: "ניווט" },
    { id: "media",        title: "מדיה",                subtitle: "ספריית קבצים",           icon: <Image className="h-4 w-4 text-rose-500" />,         action: () => navigate("/admin/media", "media"),            category: "ניווט" },
    { id: "settings",     title: "הגדרות",              subtitle: "API Keys & Config",      icon: <Settings className="h-4 w-4" />,                    action: () => navigate("/admin/settings", "settings"),      category: "ניווט", shortcut: "G ," },

    // Quick actions
    { id: "new-lead",     title: "ליד חדש",             subtitle: "הוסף לPipeline",         icon: <Plus className="h-4 w-4 text-green-600" />,         action: () => navigate("/admin/leads?new=true", "new-lead"),category: "פעולות מהירות", keywords: ["create", "add", "new"] },
    { id: "new-proposal", title: "הצעת מחיר חדשה",     subtitle: "צור עם AI",              icon: <Plus className="h-4 w-4 text-blue-600" />,          action: () => navigate("/admin/proposals", "new-proposal"), category: "פעולות מהירות" },
    { id: "new-post",     title: "פוסט חדש",            subtitle: "פרסם בכל הפלטפורמות",   icon: <Plus className="h-4 w-4 text-purple-600" />,        action: () => navigate("/admin/social", "new-post"),        category: "פעולות מהירות" },
    { id: "seo-check",    title: "הרץ SEO Check",       subtitle: "ניתוח AI מיידי",         icon: <Search className="h-4 w-4 text-orange-600" />,      action: () => navigate("/admin/seo", "seo-check"),          category: "פעולות מהירות" },
    { id: "logout",       title: "התנתק",               subtitle: "יציאה מהמערכת",          icon: <LogOut className="h-4 w-4 text-red-500" />,         action: () => navigate("/auth/login", "logout"),            category: "פעולות מהירות" },
  ], [navigate]);

  const filtered = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter((cmd) =>
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle?.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }, [COMMANDS, query]);

  /* Group results OR show recent items when no query */
  const grouped = useMemo(() => {
    if (!query.trim() && recent.length > 0) {
      const recentItems = recent
        .map((id) => COMMANDS.find((c) => c.id === id))
        .filter((c): c is CommandItem => !!c);
      const rest = filtered.filter((c) => !recent.includes(c.id));
      const restGrouped = rest.reduce<Record<string, CommandItem[]>>((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {});
      return { "אחרונים": recentItems, ...restGrouped };
    }
    return filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [filtered, query, recent, COMMANDS]);

  /* Keyboard handling */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelected(0);
        setRecent(getRecent());
      }
      if (!open) return;
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((p) => Math.min(p + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSelected((p) => Math.max(p - 1, 0)); }
      if (e.key === "Enter") {
        e.preventDefault();
        filtered[selected]?.action();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
      className="fixed inset-0 z-[9000] flex items-start justify-center pt-[15vh] bg-black/30 backdrop-blur-[3px]"
      onClick={() => { setOpen(false); setQuery(""); }}
    >
      <div
        className="w-full max-w-xl mx-4 rounded-2xl shadow-2xl border bg-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b">
          <Command className="h-4 w-4 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            placeholder="חפש דף, פעולה, לקוח, כלי..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground text-slate-800"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="text-muted-foreground hover:text-slate-700 transition-colors"
            >
              <span className="text-xs">×</span>
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-slate-100 px-1.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Sparkles className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">לא נמצאו תוצאות עבור &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-1">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  {category === "אחרונים"
                    ? <Clock className="h-3 w-3 text-muted-foreground" />
                    : <Hash className="h-3 w-3 text-muted-foreground" />}
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {category}
                  </span>
                </div>
                {items.map((item) => {
                  const isSelected = selected === globalIndex;
                  const idx = globalIndex++;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelected(idx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-right",
                        isSelected
                          ? "bg-indigo-600 text-white shadow-sm scale-[0.995]"
                          : "hover:bg-slate-100"
                      )}
                    >
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-colors",
                        isSelected ? "bg-white/20" : "bg-slate-100"
                      )}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className={cn("text-sm font-medium", isSelected ? "text-white" : "text-slate-800")}>
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className={cn("text-xs", isSelected ? "text-white/70" : "text-muted-foreground")}>
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.shortcut && (
                          <div className="flex items-center gap-0.5">
                            {item.shortcut.split(" ").map((key, i) => (
                              <kbd
                                key={i}
                                className={cn(
                                  "inline-flex h-5 items-center rounded px-1 text-[9px] font-medium border",
                                  isSelected
                                    ? "bg-white/20 border-white/30 text-white/80"
                                    : "bg-slate-50 border-slate-200 text-muted-foreground"
                                )}
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                        {isSelected && <ArrowRight className="h-3.5 w-3.5 text-white/80 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t bg-slate-50/80">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <kbd className="rounded border bg-white px-1 py-0.5 text-[10px] shadow-sm">↑↓</kbd>
            ניווט
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <kbd className="rounded border bg-white px-1 py-0.5 text-[10px] shadow-sm">↵</kbd>
            פתח
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <kbd className="rounded border bg-white px-1 py-0.5 text-[10px] shadow-sm">ESC</kbd>
            סגור
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Keyboard className="h-3 w-3" />
            <kbd className="rounded border bg-white px-1 py-0.5 text-[10px] shadow-sm">⌘K</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
