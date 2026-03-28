"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Globe, Users, FileText, CreditCard,
  Zap, Server, Bot, MessageSquare, Image, Settings,
  Building2, Target, Share2, Brain, Calendar,
  Search, Heart, Globe2, Receipt, Mail, BarChart2,
  TrendingUp, Sparkles, GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "ניהול",
    items: [
      { title: "דשבורד", href: "/admin/dashboard", icon: LayoutDashboard },
      { title: "AI Command Center", href: "/admin/command", icon: Brain, badge: "AI" },
    ],
  },
  {
    title: "CRM & לידים",
    items: [
      { title: "לידים", href: "/admin/leads", icon: Target },
      { title: "Pipeline מכירות", href: "/admin/pipeline", icon: GitBranch, badge: "NEW" },
      { title: "לקוחות", href: "/admin/crm/clients", icon: Users },
      { title: "Revenue Dashboard", href: "/admin/revenue", icon: TrendingUp, badge: "NEW" },
      { title: "חוזים", href: "/admin/crm/contracts", icon: FileText },
      { title: "תשלומים", href: "/admin/crm/payments", icon: CreditCard },
      { title: "Client Health", href: "/admin/clients-health", icon: Heart },
    ],
  },
  {
    title: "שיווק",
    items: [
      { title: "לוח תוכן", href: "/admin/calendar", icon: Calendar },
      { title: "רשתות חברתיות", href: "/admin/social", icon: Share2 },
      { title: "הצעות מחיר", href: "/admin/proposals", icon: Receipt },
      { title: "תקשורת", href: "/admin/communications", icon: MessageSquare },
      { title: "סדרות אימיילים", href: "/admin/email-sequences", icon: Mail, badge: "NEW" },
    ],
  },
  {
    title: "אתרים & SEO",
    items: [
      { title: "אתרים", href: "/admin/sites", icon: Globe },
      { title: "SEO Analyzer", href: "/admin/seo", icon: Search, badge: "AI" },
      { title: "דומיינים & SSL", href: "/admin/domains", icon: Globe2 },
    ],
  },
  {
    title: "DevOps & AI",
    items: [
      { title: "אוטומציות N8N", href: "/admin/automations", icon: Zap },
      { title: "תשתיות Coolify", href: "/admin/infrastructure", icon: Server },
      { title: "AI & Chatbots", href: "/admin/ai-tools", icon: Bot },
      { title: "AI Site Auditor", href: "/admin/site-auditor", icon: Sparkles, badge: "AI" },
      { title: "אנליטיקס אתרים", href: "/admin/site-analytics", icon: BarChart2 },
      { title: "מדיה", href: "/admin/media", icon: Image },
    ],
  },
  {
    title: "מערכת",
    items: [
      { title: "משתמשים", href: "/admin/users", icon: Users },
      { title: "הגדרות", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-950 text-slate-100">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">WMA Agency</p>
          <p className="text-[10px] text-slate-400">Management Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {navItems.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-all",
                        isActive
                          ? "bg-white/10 text-white font-medium"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.badge && (
                        <span className={cn(
                          "text-[9px] font-bold rounded px-1 py-0.5 shrink-0",
                          item.badge === "AI" ? "bg-purple-500/30 text-purple-300" : "bg-emerald-500/30 text-emerald-300"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Status Footer */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-2 px-2 py-2 rounded-md bg-white/5">
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
          <span className="text-[11px] text-slate-400">כל המערכות פעילות</span>
        </div>
      </div>
    </aside>
  );
}
