import { createClient } from "@/lib/supabase/server";
import { ContractsCollection } from "./contracts-collection";

export default async function ContractsPage() {
  const supabase = await createClient();

  const { data: contracts } = await supabase
    .from("contracts")
    .select("*, clients(contact_name, company_name)")
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ContractsCollection initialData={(contracts as any) ?? []} />;
}
