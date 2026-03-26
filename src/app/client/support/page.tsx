import { createClient } from "@/lib/supabase/server";
import { SupportDashboard } from "./support-dashboard";

export default async function ClientSupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("client_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  return <SupportDashboard initialTickets={tickets ?? []} />;
}
