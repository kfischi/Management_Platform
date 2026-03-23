"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Globe, Users, FileText, CreditCard,
  Zap, Server, Bot, MessageSquare, Image, Settings,
  Building2, Target, Share2, Brain, BarChart2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems = [
  {
    title: "ניהול",
    items: [
      { title: "דשבורד", href: "/admin/dashboard", icon: LayoutDashboard },
      { title: "אתרים", href: "/admin/sites", icon: Globe },
      {
        title: "AI Command",
        href: "/admin/command",
        icon: Brain,
        badge: "NEW",
      },
    ],
  },
  {
    title: "CRM & לידים",
    items: [
      { title: "לידים", href: "/admin/leads", icon: Target },
      { title: "לקוחות", href: "/admin/crm/clients", icon: Users },
      { title: "חוזים", href: "/admin/crm/contracts", icon: FileText },
      { title: "תשלומים", href: "/admin/crm/payments", icon: CreditCard },
    ],
  },
  {
    title: "שיווק & תקשורת",
    items: [
      { title: "תקשורת", href: "/admin/communications", icon: MessageSquare },
      { title: "רשתות חברתיות", href: "/admin/social", icon: Share2 },
    ],
  },
  {
    title: "כלים",
    items: [
      { title: "אוטומציות N8N", href: "/admin/automations", icon: Zap },
      { title: "תשתיות Coolify", href: "/admin/infrastructure", icon: Server },
      { title: "AI & Chatbots", href: "/admin/ai-tools", icon: Bot },
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
    <aside className="flex h-full w-64 flex-col border-l bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold">NBH Agency</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {navItems.map((section) => (
          <div key={section.title}>
            <p className="mb-1 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
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
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="text-[9px] font-bold bg-purple-100 text-purple-700 rounded px-1 py-0.5">
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

      {/* Footer */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">כל המערכות פעילות</span>
        </div>
      </div>
    </aside>
  );
}
