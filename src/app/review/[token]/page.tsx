/**
 * /review/[token] — Public client approval portal
 * No auth required — validated by review_token.
 */
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewPortal from "./review-portal";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // Look up site by review_token
  const { data: site } = await supabase
    .from("sites")
    .select("id, name, review_status, review_comment")
    .eq("review_token", token)
    .single();

  if (!site) notFound();

  return (
    <ReviewPortal
      token={token}
      siteId={site.id}
      siteName={site.name}
      reviewStatus={site.review_status ?? "pending"}
      reviewComment={site.review_comment ?? ""}
    />
  );
}
