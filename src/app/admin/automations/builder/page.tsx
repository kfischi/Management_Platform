import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WorkflowBuilderClient from "./workflow-builder-client";

interface Props {
  searchParams: Promise<{ id?: string; template?: string }>;
}

export default async function WorkflowBuilderPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/admin/automations");

  const { id, template } = await searchParams;

  let automation = null;
  if (id) {
    const { data } = await supabase
      .from("automations").select("*").eq("id", id).single();
    automation = data;
  }

  return (
    <WorkflowBuilderClient
      automation={automation}
      templateId={template ?? null}
    />
  );
}
