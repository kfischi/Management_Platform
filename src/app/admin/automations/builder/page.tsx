import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WorkflowBuilderClient from "./workflow-builder-client";
import type { Database } from "@/types/database";

type AutomationRow = Database["public"]["Tables"]["automations"]["Row"];

interface Props {
  searchParams: Promise<{ id?: string; template?: string }>;
}

export default async function WorkflowBuilderPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profileRaw } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  const profile = profileRaw as { role: string } | null;
  if (profile?.role !== "admin") redirect("/admin/automations");

  const { id, template } = await searchParams;

  let automation = null;
  if (id) {
    const { data } = await supabase
      .from("automations").select("*").eq("id", id).single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    automation = (data as any) ?? null;
  }

  return (
    <WorkflowBuilderClient
      automation={automation}
      templateId={template ?? null}
    />
  );
}
