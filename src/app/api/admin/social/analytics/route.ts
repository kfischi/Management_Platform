/**
 * GET /api/admin/social/analytics
 * Returns per-platform stats computed from social_posts table.
 * Reach/engagement/followers are placeholders — connect Meta/LinkedIn API for real metrics.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: allPostsRaw } = await supabase
    .from("social_posts")
    .select("platforms, status, created_at, scheduled_at");

  type PostRow = { platforms: string[]; status: string; created_at: string; scheduled_at: string | null };
  const posts = (allPostsRaw ?? []) as PostRow[];

  const platforms = ["instagram", "facebook", "linkedin", "twitter"];

  const stats = platforms.map(platform => {
    const platformPosts = posts.filter(p => p.platforms.includes(platform));
    const published = platformPosts.filter(p => p.status === "published").length;
    const scheduled = platformPosts.filter(p => p.status === "scheduled").length;
    const thisMonth = platformPosts.filter(p => p.created_at >= startOfMonth).length;

    return {
      platform,
      totalPosts: platformPosts.length,
      published,
      scheduled,
      drafts: platformPosts.filter(p => p.status === "draft").length,
      thisMonth,
      // Real metrics require platform API — show "—" when not connected
      reach: "—",
      engagement: "—",
      followers: "—",
    };
  });

  // Overall summary
  const totalPublished = posts.filter(p => p.status === "published").length;
  const totalScheduled = posts.filter(p => p.status === "scheduled").length;
  const totalDraft = posts.filter(p => p.status === "draft").length;
  const thisMonthTotal = posts.filter(p => p.created_at >= startOfMonth).length;

  return NextResponse.json({
    platforms: stats,
    summary: {
      total: posts.length,
      published: totalPublished,
      scheduled: totalScheduled,
      drafts: totalDraft,
      thisMonth: thisMonthTotal,
    },
  });
}
