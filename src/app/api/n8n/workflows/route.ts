import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* GET /api/n8n/workflows — fetch workflows from n8n */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const n8nUrl = process.env.N8N_URL;
  const n8nApiKey = process.env.N8N_API_KEY;

  if (!n8nUrl || !n8nApiKey) {
    return NextResponse.json({ error: "N8N_URL ו-N8N_API_KEY לא מוגדרים" }, { status: 400 });
  }

  try {
    const res = await fetch(`${n8nUrl}/api/v1/workflows`, {
      headers: { "X-N8N-API-KEY": n8nApiKey },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `n8n החזיר ${res.status}` }, { status: 502 });
    }

    const json = await res.json();
    return NextResponse.json(json?.data ?? json ?? []);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "לא ניתן להתחבר ל-n8n" },
      { status: 502 }
    );
  }
}
