import { createClient } from "@/lib/supabase/server";
import { SitesCollection } from "./sites-collection";

export default async function SitesPage() {
  const supabase = await createClient();

  const { data: sites } = await supabase
    .from("sites")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <SitesCollection initialData={(sites as any) ?? []} />;
}
