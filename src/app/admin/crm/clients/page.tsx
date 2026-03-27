import { createClient } from "@/lib/supabase/server";
import { ClientsCollection } from "./clients-collection";
import type { Database } from "@/types/database";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clientsRaw } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  const clients = (clientsRaw ?? []) as ClientRow[];

  return <ClientsCollection initialData={clients} />;
}
