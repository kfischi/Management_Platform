import { createClient } from "@/lib/supabase/server";
import ChatbotBuilderDashboard from "./chatbot-builder-dashboard";
import type { Database } from "@/types/database";

type ChatbotRow = Database["public"]["Tables"]["chatbots"]["Row"];

export const metadata = { title: "Chatbot Builder" };

export default async function ChatbotBuilderPage() {
  const supabase = await createClient();

  const { data: chatbots } = await supabase
    .from("chatbots")
    .select("*, sites(id, name)")
    .order("created_at", { ascending: false });

  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, status")
    .eq("status", "active")
    .order("name");

  return (
    <ChatbotBuilderDashboard
      initialChatbots={(chatbots ?? []) as (ChatbotRow & { sites: { id: string; name: string } | null })[]}
      availableSites={(sites ?? []) as { id: string; name: string; status: string }[]}
    />
  );
}
