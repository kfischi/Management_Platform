/**
 * PayMe Integration
 *
 * POST /api/payments/payme
 *   Creates a PayMe payment link for a site visitor.
 *   Returns { payment_url } to redirect the user to PayMe checkout.
 *
 * POST /api/payments/payme/webhook  (handled below)
 *   Receives PayMe IPN (Instant Payment Notification) and updates the lead/order.
 *
 * PayMe API docs: https://payme.io/
 * Uses the PayMe "Payments" API to create a payment link.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface PaymePayload {
  site_id: string;
  amount: number;          // in agorot (₪1 = 100 agorot)
  description: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  product_name?: string;
  success_url?: string;
  fail_url?: string;
  callback_url?: string;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const body = await req.json() as PaymePayload;
  const { site_id, amount, description, buyer_name, buyer_email, buyer_phone, product_name, success_url, fail_url } = body;

  if (!site_id || !amount || !description)
    return NextResponse.json({ error: "site_id, amount, description הם שדות חובה" }, { status: 400 });

  // Get PayMe key from site settings or agency settings
  const [siteSettingsRes, agencySettingsRes] = await Promise.all([
    supabase.from("site_settings").select("key, value").eq("site_id", site_id).eq("key", "payme_seller_id").single(),
    supabase.from("agency_settings").select("key, value").in("key", ["payme_seller_id", "payme_api_key"]),
  ]);

  const siteSellerId = (siteSettingsRes.data as { key: string; value: string } | null)?.value;
  const agencySettings: Record<string, string> = {};
  for (const row of (agencySettingsRes.data ?? []) as { key: string; value: string | null }[]) {
    if (row.value) agencySettings[row.key] = row.value;
  }

  const sellerId = siteSellerId ?? agencySettings["payme_seller_id"];
  const apiKey   = agencySettings["payme_api_key"];

  if (!sellerId) return NextResponse.json({ error: "PayMe seller ID לא מוגדר" }, { status: 400 });

  // Build PayMe payment link via their API
  // PayMe Business API: POST https://preprod.paymeservice.com/api/generate-sale
  // (use https://ng.paymeservice.com/api/generate-sale for production)
  const isProduction = process.env.NODE_ENV === "production";
  const apiUrl = isProduction
    ? "https://ng.paymeservice.com/api/generate-sale"
    : "https://preprod.paymeservice.com/api/generate-sale";

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000";

  const paymeBody = {
    seller_payme_id: sellerId,
    sale_price: amount,          // in agorot
    currency: "ILS",
    product_name: product_name ?? description,
    sale_payment_method: "both", // credit card + bit
    buyer_name: buyer_name ?? "",
    buyer_email: buyer_email ?? "",
    buyer_phone: buyer_phone ?? "",
    success_url: success_url ?? `${origin}/payment/success`,
    fail_url: fail_url ?? `${origin}/payment/failed`,
    notify_url: `${origin}/api/payments/payme/webhook`,
    language: "heb",
    capture_buyer_name: !buyer_name,
    capture_buyer_email: !buyer_email,
    capture_buyer_phone: !buyer_phone,
  };

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    (headers as Record<string, string>)["x-api-key"] = apiKey;
  }

  const paymeRes = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(paymeBody),
  });

  if (!paymeRes.ok) {
    const err = await paymeRes.text().catch(() => "Unknown error");
    return NextResponse.json({ error: `PayMe API error: ${paymeRes.status} — ${err}` }, { status: 502 });
  }

  const data = await paymeRes.json() as { payme_sale_id?: string; sale_url?: string; status_code?: string; status_error_details?: string };

  if (!data.sale_url) {
    return NextResponse.json({ error: data.status_error_details ?? "PayMe לא החזיר קישור תשלום" }, { status: 502 });
  }

  // Log the payment attempt to audit_logs
  await supabase.from("audit_logs").insert({
    user_id: null,
    action: "payment.payme_link_created",
    resource_type: "sites",
    resource_id: site_id,
    metadata: {
      amount_agorot: amount,
      description,
      buyer_email: buyer_email ?? null,
      sale_id: data.payme_sale_id ?? null,
    },
  } as never);

  return NextResponse.json({
    payment_url: data.sale_url,
    sale_id: data.payme_sale_id,
  });
}
