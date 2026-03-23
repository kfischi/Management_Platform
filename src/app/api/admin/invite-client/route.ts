/**
 * POST /api/admin/invite-client
 *
 * Admin-only. Creates a new client user in Supabase Auth,
 * sets their profile (role=client), and links them to a site.
 *
 * Supabase automatically sends the user an invitation email
 * with a magic link so they can set their password.
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Verify the caller is admin
  const supabase = await createClient();
  const { data: { user: caller } } = await supabase.auth.getUser();
  if (!caller) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((callerProfile as any)?.role !== "admin") {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  // 2. Parse body
  const { email, full_name, company, phone, site_id } = await req.json();
  if (!email || !full_name) {
    return NextResponse.json({ error: "אימייל ושם מלא הם שדות חובה" }, { status: 400 });
  }

  const admin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // 3. Invite user via Supabase — sends magic-link email automatically
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: `${appUrl}/auth/callback?next=/client/dashboard`,
      data: { full_name, company: company ?? null },
    }
  );

  if (inviteError) {
    // "User already registered" → still proceed to update their profile & site
    if (!inviteError.message.includes("already been registered")) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }
  }

  const newUserId = invited?.user?.id;

  if (newUserId) {
    // 4. Upsert profile with role=client
    await admin.from("profiles").upsert(
      {
        id: newUserId,
        email,
        full_name,
        company: company ?? null,
        phone: phone ?? null,
        role: "client",
      },
      { onConflict: "id" }
    );

    // 5. Link the site to this user if provided
    if (site_id) {
      await admin
        .from("sites")
        .update({ owner_id: newUserId })
        .eq("id", site_id);
    }

    // 6. Audit log
    await admin.from("audit_logs").insert({
      user_id: caller.id,
      action: "invite_client",
      resource_type: "profile",
      resource_id: newUserId,
      metadata: { email, full_name, site_id: site_id ?? null },
    });
  }

  return NextResponse.json({
    success: true,
    message: `הזמנה נשלחה ל-${email}. הלקוח יקבל מייל עם קישור כניסה.`,
    user_id: newUserId,
  });
}
