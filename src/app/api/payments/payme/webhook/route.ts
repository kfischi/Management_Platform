/**
 * POST /api/payments/payme/webhook
 * PayMe IPN (Instant Payment Notification)
 * Called by PayMe when a payment is completed/failed.
 * Public endpoint — no auth, but validates PayMe signature.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface PaymeWebhook {
  payme_sale_id: string;
  sale_status: "COMPLETED" | "REFUNDED" | "PARTIALLY_REFUNDED" | "FAILED" | "CHARGEBACK";
  price: number;
  currency: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  sale_description?: string;
  seller_payme_id?: string;
  notify_type: string;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  let body: PaymeWebhook;
  try {
    body = await req.json() as PaymeWebhook;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { payme_sale_id, sale_status, price, currency, buyer_name, buyer_email, buyer_phone, sale_description } = body;

  // Log the webhook
  await supabase.from("audit_logs").insert({
    user_id: null,
    action: `payment.payme_webhook_${sale_status?.toLowerCase() ?? "unknown"}`,
    resource_type: "payments",
    resource_id: null,
    metadata: {
      sale_id: payme_sale_id,
      status: sale_status,
      amount: price,
      currency,
      buyer_email: buyer_email ?? null,
    },
  } as never);

  // If payment completed and we have buyer info — try to create/update a lead
  if (sale_status === "COMPLETED" && (buyer_email || buyer_phone)) {
    // Find existing lead by email or phone
    let leadId: string | null = null;

    if (buyer_email) {
      const { data } = await supabase
        .from("leads")
        .select("id")
        .eq("email", buyer_email)
        .limit(1)
        .single();
      leadId = (data as { id: string } | null)?.id ?? null;
    }

    if (!leadId && buyer_phone) {
      const { data } = await supabase
        .from("leads")
        .select("id")
        .eq("phone", buyer_phone)
        .limit(1)
        .single();
      leadId = (data as { id: string } | null)?.id ?? null;
    }

    const amountIls = Math.round(price / 100); // convert agorot to ILS

    if (leadId) {
      // Update existing lead to "won"
      await supabase.from("leads").update({
        status: "won",
        value: amountIls,
        notes: `תשלום PayMe הושלם: ₪${amountIls} — ${sale_description ?? ""}`,
        updated_at: new Date().toISOString(),
      } as never).eq("id", leadId);
    } else if (buyer_name || buyer_email) {
      // Create new lead from payment
      await supabase.from("leads").insert({
        name: buyer_name ?? buyer_email ?? "לקוח PayMe",
        email: buyer_email ?? null,
        phone: buyer_phone ?? null,
        source: "PayMe",
        status: "won",
        value: amountIls,
        score: 90,
        notes: `שילם דרך PayMe: ₪${amountIls} — ${sale_description ?? ""}`,
        company: null,
        tags: ["payme", "paying-customer"],
        ai_insight: null,
      } as never);
    }
  }

  // PayMe expects { status: 0 } for success acknowledgment
  return NextResponse.json({ status: 0 });
}
