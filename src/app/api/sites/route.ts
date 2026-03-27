import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { SITE_TEMPLATES } from "@/app/admin/sites/site-templates";
import type { Json } from "@/types/database";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const profile = profileRaw as { role: string } | null;
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const body = await request.json();
  const { name, domain, github_repo, netlify_url, description, templateId } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "שם האתר הוא שדה חובה" }, { status: 400 });
  }

  // Create the site
  const { data: siteRaw, error } = await supabase
    .from("sites")
    .insert({
      name: name.trim(),
      domain: domain?.trim() || null,
      github_repo: github_repo?.trim() || null,
      netlify_url: netlify_url?.trim() || null,
      description: description?.trim() || null,
      owner_id: user.id,
      status: "paused",
      template: templateId ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const site = siteRaw as { id: string } | null;
  if (!site) {
    return NextResponse.json({ error: "שגיאה ביצירת האתר" }, { status: 500 });
  }

  // Seed pages + content blocks from template if provided
  if (templateId) {
    const template = SITE_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      for (const page of template.pages) {
        const { data: pageRaw } = await supabase
          .from("site_pages")
          .insert({
            site_id: site.id,
            slug: page.slug,
            title: page.title,
            meta_title: page.meta_title ?? null,
            meta_desc: page.meta_desc ?? null,
            is_published: false,
            order_index: page.order_index,
          })
          .select("id")
          .single();

        const createdPage = pageRaw as { id: string } | null;
        if (createdPage && page.blocks.length > 0) {
          await supabase.from("content_blocks").insert(
            page.blocks.map((block) => ({
              page_id: createdPage.id,
              site_id: site.id,
              block_type: block.block_type,
              label: block.label,
              content: block.content as unknown as Json,
              order_index: block.order_index,
              is_visible: true,
              is_editable: true,
            }))
          );
        }
      }
    }
  }

  return NextResponse.json(siteRaw, { status: 201 });
}
