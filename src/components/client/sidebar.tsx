"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Globe, Image, BarChart2, MessageSquare, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { title: "דשבורד", href: "/client/dashboard", icon: LayoutDashboard },
  { title: "האתר שלי", href: "/client/my-site", icon: Globe },
  { title: "מדיה", href: "/client/media", icon: Image },
  { title: "אנליטיקס", href: "/client/analytics", icon: BarChart2 },
  { title: "תמיכה", href: "/client/support", icon: MessageSquare },
];

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-l bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold">WMA Agency</p>
          <p className="text-xs text-muted-foreground">Client Portal</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <Badge className="w-full justify-center text-xs bg-blue-100 text-blue-800 border-0">
          Client Portal
        </Badge>
      </div>
    </aside>
  );
}
