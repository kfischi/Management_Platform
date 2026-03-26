import { createClient } from "@/lib/supabase/server";
import { SettingsDashboard } from "./settings-dashboard";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("agency_settings").select("key, value");
  const settings = Object.fromEntries((rows ?? []).map(r => [r.key, r.value ?? ""]));
  return <SettingsDashboard initialSettings={settings} />;
}
