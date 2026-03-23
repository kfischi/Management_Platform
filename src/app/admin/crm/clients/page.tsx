import { createClient } from "@/lib/supabase/server";
import { ClientsCollection } from "./clients-collection";

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  return <ClientsCollection initialData={clients ?? []} />;
}
