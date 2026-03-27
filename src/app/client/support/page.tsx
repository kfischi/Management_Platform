import { createClient } from "@/lib/supabase/server";
import { SupportDashboard } from "./support-dashboard";
import type { Database } from "@/types/database";

type TicketRow = Database["public"]["Tables"]["support_tickets"]["Row"];

export default async function ClientSupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: ticketsRaw } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("client_id", user?.id ?? "")
    .order("created_at", { ascending: false });
  const tickets = (ticketsRaw ?? []) as TicketRow[];

  return <SupportDashboard initialTickets={tickets} />;
}
