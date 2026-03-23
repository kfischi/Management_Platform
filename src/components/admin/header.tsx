"use client";

import { Bell, LogOut, Command, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CommandPalette } from "@/components/shared/command-palette";
import { useState, useEffect } from "react";

interface AdminHeaderProps {
  title?: string;
  userEmail?: string;
  userAvatar?: string;
  userName?: string;
}

export function AdminHeader({ title, userEmail, userAvatar, userName }: AdminHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [cmdOpen, setCmdOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const initials = userName
    ? userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : userEmail?.slice(0, 2).toUpperCase() ?? "AD";

  // Listen for Cmd+K to show hint
  const [cmdHint, setCmdHint] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setCmdHint(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <CommandPalette />
      <header className="flex h-14 items-center justify-between border-b bg-white/80 backdrop-blur-md px-6 sticky top-0 z-40">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          {title && (
            <h1 className="text-sm font-semibold text-foreground">{title}</h1>
          )}
        </div>

        {/* Center: Search / Command */}
        <button
          onClick={() => {
            const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
            window.dispatchEvent(event);
          }}
          className="hidden md:flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span>חפש כל דבר...</span>
          <div className="flex items-center gap-0.5 mr-2">
            <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1 text-[10px] font-medium">⌘</kbd>
            <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1 text-[10px] font-medium">K</kbd>
          </div>
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </Button>

          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 pl-3 pr-1.5 py-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium hidden sm:block max-w-24 truncate">
              {userName || userEmail}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
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
