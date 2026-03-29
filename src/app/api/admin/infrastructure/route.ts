import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

async function getCoolifyConfig(supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server")["createClient"]>>) {
  const { data } = await supabase
    .from("agency_settings")
    .select("key, value")
    .in("key", ["coolify_url", "coolify_token"]);
  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
  return { url: map.coolify_url as string | null, token: map.coolify_token as string | null };
}

async function coolifyFetch(base: string, token: string, path: string) {
  const res = await fetch(`${base.replace(/\/$/, "")}/api/v1${path}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Coolify ${path} → ${res.status}`);
  return res.json();
}

export async function GET(_req: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { url, token } = await getCoolifyConfig(supabase);
  if (!url || !token) {
    return NextResponse.json({ connected: false, servers: [], applications: [] });
  }

  try {
    const [servers, applications] = await Promise.all([
      coolifyFetch(url, token, "/servers"),
      coolifyFetch(url, token, "/applications"),
    ]);
    return NextResponse.json({ connected: true, servers, applications });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ connected: false, error: msg, servers: [], applications: [] });
  }
}

export async function POST(req: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { url, token } = await getCoolifyConfig(supabase);
  if (!url || !token) {
    return NextResponse.json({ error: "Coolify not configured" }, { status: 400 });
  }

  const { action, appId } = await req.json();
  const actionMap: Record<string, string> = {
    restart: `/applications/${appId}/restart`,
    start:   `/applications/${appId}/start`,
    stop:    `/applications/${appId}/stop`,
    deploy:  `/applications/${appId}/deploy`,
  };
  const path = actionMap[action];
  if (!path) return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  try {
    await coolifyFetch(url, token, path);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
