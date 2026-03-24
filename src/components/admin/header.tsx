"use client";

import { Bell, LogOut, Search, ChevronRight, X, Check, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { CommandPalette } from "@/components/shared/command-palette";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/* ─────────── breadcrumb config ─────────── */

const ROUTE_LABELS: Record<string, string> = {
  admin:            "מערכת ניהול",
  dashboard:        "דשבורד",
  sites:            "אתרים",
  leads:            "לידים",
  crm:              "CRM",
  clients:          "לקוחות",
  contracts:        "חוזים",
  payments:         "תשלומים",
  users:            "משתמשים",
  proposals:        "הצעות מחיר",
  social:           "רשתות חברתיות",
  calendar:         "לוח תוכן",
  seo:              "SEO",
  automations:      "אוטומציות",
  infrastructure:   "תשתיות",
  settings:         "הגדרות",
  communications:   "תקשורת",
  media:            "מדיה",
  "ai-tools":       "AI & Chatbots",
  domains:          "דומיינים",
  command:          "AI Command",
  "clients-health": "Client Health",
};

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => ({
    label:  ROUTE_LABELS[seg] ?? seg,
    href:   "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));
}

/* ─────────── notification types ─────────── */

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "error",   title: "תשלום באיחור",   body: "שפירא לוגיסטיקס — ₪25,000 באיחור של 24 ימים", time: "לפני שעה",    read: false },
  { id: "n2", type: "success", title: "Deploy הצליח",   body: "טק סולושנס — v2.3.1 עלה לאוויר בהצלחה",       time: "לפני 2 שעות", read: false },
  { id: "n3", type: "warning", title: "SSL עומד לפוג",  body: "cohen-marketing.co.il — פג עוד 12 יום",        time: "לפני 5 שעות", read: false },
  { id: "n4", type: "info",    title: "ליד חדש",        body: "נרשם ליד חדש דרך האתר: startup@example.com",   time: "אתמול",        read: true },
  { id: "n5", type: "success", title: "תשלום התקבל",   body: "כהן מרקטינג — ₪2,000 שולמו",                  time: "לפני יומיים", read: true },
];

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />,
  warning: <AlertCircle  className="h-3.5 w-3.5 text-amber-600" />,
  error:   <AlertCircle  className="h-3.5 w-3.5 text-red-600"   />,
  info:    <Info         className="h-3.5 w-3.5 text-blue-600"  />,
};

/* ─────────── props ─────────── */

interface AdminHeaderProps {
  title?: string;
  userEmail?: string;
  userAvatar?: string;
  userName?: string;
}

/* ─────────── component ─────────── */

export function AdminHeader({ title, userEmail, userAvatar, userName }: AdminHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const breadcrumbs = useBreadcrumbs();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : userEmail?.slice(0, 2).toUpperCase() ?? "AD";

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  useEffect(() => {
    const onClickOut = (e: MouseEvent) => {
      if (!notifRef.current?.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClickOut);
    return () => document.removeEventListener("mousedown", onClickOut);
  }, []);

  return (
    <>
      <CommandPalette />
      <header className="flex h-14 items-center justify-between border-b bg-white/90 backdrop-blur-md px-5 sticky top-0 z-40 gap-3">

        {/* Left: Breadcrumbs */}
        <nav className="flex items-center gap-1 text-xs min-w-0 flex-1">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
              {crumb.isLast ? (
                <span className="font-semibold text-slate-800 truncate">{crumb.label}</span>
              ) : (
                <button
                  onClick={() => router.push(crumb.href)}
                  className="text-muted-foreground hover:text-slate-700 transition-colors truncate"
                >
                  {crumb.label}
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Center: Command search */}
        <button
          onClick={() => {
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
            );
          }}
          className="hidden md:flex items-center gap-2 rounded-xl border bg-slate-50 hover:bg-slate-100 px-3 py-1.5 transition-colors min-w-[200px] max-w-xs"
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="flex-1 text-right text-xs text-muted-foreground">חפש הכל...</span>
          <div className="flex items-center gap-0.5">
            <kbd className="inline-flex h-5 items-center rounded border bg-white px-1 text-[10px] font-medium shadow-sm">⌘</kbd>
            <kbd className="inline-flex h-5 items-center rounded border bg-white px-1 text-[10px] font-medium shadow-sm">K</kbd>
          </div>
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Notification bell */}
          <div ref={notifRef} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8"
              onClick={() => setNotifOpen((v) => !v)}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                  {unreadCount}
                </span>
              )}
            </Button>

            {notifOpen && (
              <div className="absolute left-0 top-10 z-50 w-80 rounded-2xl border bg-white shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50/50">
                  <p className="text-sm font-semibold text-slate-800">התראות</p>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        סמן הכל כנקרא
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)}>
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-slate-700" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <Bell className="h-7 w-7 text-muted-foreground/20" />
                      <p className="text-xs text-muted-foreground">אין התראות</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 group transition-colors",
                          n.read ? "bg-white" : "bg-indigo-50/30"
                        )}
                      >
                        <div className="shrink-0 mt-0.5">{NOTIF_ICONS[n.type]}</div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs font-medium", n.read ? "text-slate-600" : "text-slate-800")}>
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">{n.time}</p>
                        </div>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                        )}
                        <button
                          onClick={() => dismiss(n.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-slate-700" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2.5 border-t bg-slate-50/50 text-center">
                  <button className="text-xs text-indigo-600 hover:underline">
                    ראה את כל ההתראות
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User chip */}
          <div className="flex items-center gap-2 rounded-xl border bg-slate-50 pl-3 pr-1.5 py-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium hidden sm:block max-w-28 truncate text-slate-700">
              {userName || userEmail}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-red-600 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>

        </div>
      </header>
    </>
  );
}
