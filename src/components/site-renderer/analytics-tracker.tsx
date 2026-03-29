"use client";

import { useEffect } from "react";

export function AnalyticsTracker({
  siteId,
  pageSlug,
}: {
  siteId: string;
  pageSlug: string;
}) {
  useEffect(() => {
    const visitorId =
      localStorage.getItem("_vid") ??
      (() => {
        const id = crypto.randomUUID();
        localStorage.setItem("_vid", id);
        return id;
      })();

    fetch(`/api/analytics/${siteId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_slug: pageSlug,
        visitor_id: visitorId,
        referrer: document.referrer || null,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [siteId, pageSlug]);

  return null;
}
