import { createClient } from "@/lib/supabase/server";
import { BillingDashboard } from "./billing-dashboard";

export default async function BillingPage() {
  const supabase = await createClient();

  const [{ data: payments }, { data: clients }, { data: contracts }] = await Promise.all([
    supabase.from("payments").select("*, clients(contact_name, company_name)").order("due_date", { ascending: false }),
    supabase.from("clients").select("id, contact_name, company_name, status"),
    supabase.from("contracts").select("id, title, client_id, amount, currency, status, start_date, end_date, clients(contact_name, company_name)"),
  ]);

  return (
    <BillingDashboard
      initialPayments={payments ?? []}
      clients={clients ?? []}
      contracts={contracts ?? []}
    />
  );
}
