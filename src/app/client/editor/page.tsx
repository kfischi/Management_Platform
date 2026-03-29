import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteEditor from "@/components/client/SiteEditor";
import { FULL_PERMISSIONS, type ClientPermissions } from "@/lib/permissions";
import type { Database } from "@/types/database";

type SiteRow = Database["public"]["Tables"]["sites"]["Row"];
type SitePageRow = Database["public"]["Tables"]["site_pages"]["Row"];
type SiteSettingRow = Database["public"]["Tables"]["site_settings"]["Row"];

export default async function EditorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Check if this user is an admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";

  // Get the client's site
  const { data: sitesRaw } = await supabase
    .from("sites")
    .select("*")
    .eq("owner_id", user.id)
    .limit(1);
  const sites = (sitesRaw ?? []) as SiteRow[];

  const site = sites[0];
  if (!site) redirect("/client/dashboard");

  // Load all pages
  const { data: pagesRaw } = await supabase
    .from("site_pages")
    .select("*")
    .eq("site_id", site.id)
    .order("order_index", { ascending: true });
  const pages = (pagesRaw ?? []) as SitePageRow[];

  // Load settings
  const { data: settingsRowsRaw } = await supabase
    .from("site_settings")
    .select("*")
    .eq("site_id", site.id);
  const settingsRows = (settingsRowsRaw ?? []) as SiteSettingRow[];

  const settings: Record<string, unknown> = {};
  for (const s of settingsRows) settings[s.key] = s.value;

  // Read client permissions (set by admin via site settings)
  const clientPermissions: ClientPermissions =
    (settings.client_permissions as ClientPermissions) ?? FULL_PERMISSIONS;

  return (
    <SiteEditor
      site={site}
      initialPages={pages}
      initialSettings={settings}
      clientPermissions={clientPermissions}
      isAdmin={isAdmin}
    />
  );
}
