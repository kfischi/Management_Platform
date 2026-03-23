import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteEditor from "@/components/client/SiteEditor";

export default async function EditorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Get the client's site
  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("owner_id", user.id)
    .limit(1);

  const site = sites?.[0];
  if (!site) redirect("/client/dashboard");

  // Load all pages
  const { data: pages } = await supabase
    .from("site_pages")
    .select("*")
    .eq("site_id", site.id)
    .order("order_index", { ascending: true });

  // Load settings
  const { data: settingsRows } = await supabase
    .from("site_settings")
    .select("*")
    .eq("site_id", site.id);

  const settings: Record<string, unknown> = {};
  for (const s of settingsRows ?? []) settings[s.key] = s.value;

  return (
    <SiteEditor
      site={site}
      initialPages={pages ?? []}
      initialSettings={settings}
    />
  );
}
