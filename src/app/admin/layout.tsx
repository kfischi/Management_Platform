import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { ToastProvider } from "@/components/admin/toast";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = profileRaw as ProfileRow | null;

  if (profile?.role !== "admin") {
    redirect("/client/dashboard");
  }

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader
            userEmail={profile?.email || user.email}
            userAvatar={profile?.avatar_url || undefined}
            userName={profile?.full_name || undefined}
          />
          <main className="flex-1 overflow-y-auto gradient-mesh">
            <div className="p-6 animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
