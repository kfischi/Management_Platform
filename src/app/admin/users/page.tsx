import { createClient } from "@/lib/supabase/server";
import { UsersCollection } from "./users-collection";

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <UsersCollection initialData={(users as any) ?? []} />;
}
