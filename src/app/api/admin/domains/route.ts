import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET(_req: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { data, error: dbErr } = await supabase
    .from("domains")
    .select("*, sites(name)")
    .order("domain", { ascending: true });

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { domain, site_id, registrar, expires_at, ssl_expires_at, auto_renew, ssl_enabled, notes } = body;

  if (!domain) return NextResponse.json({ error: "domain is required" }, { status: 400 });

  const { data, error: dbErr } = await supabase.from("domains").insert({
    domain,
    site_id: site_id ?? null,
    registrar: registrar ?? null,
    expires_at: expires_at ?? null,
    ssl_expires_at: ssl_expires_at ?? null,
    auto_renew: auto_renew ?? true,
    ssl_enabled: ssl_enabled ?? true,
    notes: notes ?? null,
    status: "active",
  }).select().single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}
