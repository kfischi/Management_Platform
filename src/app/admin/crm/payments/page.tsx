import { createClient } from "@/lib/supabase/server";
import { PaymentsCollection } from "./payments-collection";

export default async function PaymentsPage() {
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("*, clients(contact_name, company_name)")
    .order("due_date", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PaymentsCollection initialData={(payments as any) ?? []} />;
}
