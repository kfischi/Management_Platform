/**
 * POST /api/admin/sites/[siteId]/export-netlify
 *
 * Generates standalone HTML for every published page of the site
 * and deploys it to Netlify using the Files API (no GitHub required).
 *
 * Requirements:
 *   - NETLIFY_API_TOKEN env var (personal access token)
 *   - site.netlify_site_id must be set for the site
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─── block → HTML ─── */
function blockToHtml(block_type: string, content: Record<string, unknown>): string {
  switch (block_type) {
    case "hero":
      return `
      <section style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:100px 24px;text-align:center;">
        <h1 style="font-size:3rem;font-weight:800;margin-bottom:16px;">${esc(content.title as string)}</h1>
        ${content.subtitle ? `<p style="font-size:1.25rem;opacity:.9;margin-bottom:32px;">${esc(content.subtitle as string)}</p>` : ""}
        ${content.cta_text ? `<a href="${esc(content.cta_link as string ?? "#")}" style="background:#fff;color:#4f46e5;padding:14px 36px;border-radius:9999px;font-weight:700;text-decoration:none;display:inline-block;">${esc(content.cta_text as string)}</a>` : ""}
      </section>`;

    case "text":
      return `
      <section style="max-width:800px;margin:60px auto;padding:0 24px;">
        ${content.heading ? `<h2 style="font-size:2rem;font-weight:700;margin-bottom:16px;color:#1e293b;">${esc(content.heading as string)}</h2>` : ""}
        <div style="color:#475569;line-height:1.8;font-size:1.1rem;">${esc(content.body as string ?? "")}</div>
      </section>`;

    case "services":
      return `
      <section style="background:#f8fafc;padding:80px 24px;">
        <div style="max-width:1100px;margin:0 auto;text-align:center;">
          <h2 style="font-size:2rem;font-weight:700;margin-bottom:48px;color:#1e293b;">${esc(content.heading as string ?? "השירותים שלנו")}</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;">
            ${((content.services as {title:string;desc:string;icon?:string}[]) ?? []).map(s => `
            <div style="background:#fff;border-radius:16px;padding:28px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
              ${s.icon ? `<div style="font-size:2.5rem;margin-bottom:12px;">${s.icon}</div>` : ""}
              <h3 style="font-weight:700;margin-bottom:8px;color:#1e293b;">${esc(s.title)}</h3>
              <p style="color:#64748b;font-size:.9rem;">${esc(s.desc)}</p>
            </div>`).join("")}
          </div>
        </div>
      </section>`;

    case "testimonials":
      return `
      <section style="padding:80px 24px;">
        <div style="max-width:1100px;margin:0 auto;text-align:center;">
          <h2 style="font-size:2rem;font-weight:700;margin-bottom:48px;color:#1e293b;">${esc(content.heading as string ?? "מה אומרים עלינו")}</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
            ${((content.testimonials as {name:string;text:string;role?:string}[]) ?? []).map(t => `
            <div style="background:#f8fafc;border-radius:16px;padding:28px;text-align:right;">
              <p style="color:#475569;font-style:italic;margin-bottom:16px;">"${esc(t.text)}"</p>
              <strong style="color:#1e293b;">${esc(t.name)}</strong>
              ${t.role ? `<p style="color:#94a3b8;font-size:.85rem;">${esc(t.role)}</p>` : ""}
            </div>`).join("")}
          </div>
        </div>
      </section>`;

    case "faq":
      return `
      <section style="max-width:800px;margin:80px auto;padding:0 24px;">
        <h2 style="font-size:2rem;font-weight:700;margin-bottom:40px;color:#1e293b;text-align:center;">${esc(content.heading as string ?? "שאלות נפוצות")}</h2>
        ${((content.items as {q:string;a:string}[]) ?? []).map(item => `
        <details style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:12px;">
          <summary style="font-weight:600;cursor:pointer;color:#1e293b;">${esc(item.q)}</summary>
          <p style="margin-top:12px;color:#475569;line-height:1.7;">${esc(item.a)}</p>
        </details>`).join("")}
      </section>`;

    case "cta":
      return `
      <section style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:80px 24px;text-align:center;">
        <h2 style="font-size:2rem;font-weight:800;color:#fff;margin-bottom:16px;">${esc(content.heading as string ?? "")}</h2>
        ${content.subtext ? `<p style="color:#94a3b8;margin-bottom:32px;">${esc(content.subtext as string)}</p>` : ""}
        ${content.cta_text ? `<a href="${esc(content.cta_link as string ?? "#")}" style="background:#4f46e5;color:#fff;padding:14px 36px;border-radius:9999px;font-weight:700;text-decoration:none;display:inline-block;">${esc(content.cta_text as string)}</a>` : ""}
      </section>`;

    case "contact":
      return `
      <section id="contact" style="max-width:600px;margin:80px auto;padding:0 24px;">
        <h2 style="font-size:2rem;font-weight:700;margin-bottom:32px;color:#1e293b;text-align:center;">${esc(content.heading as string ?? "צרו קשר")}</h2>
        <form style="display:grid;gap:16px;" onsubmit="return false;">
          <input placeholder="שם מלא" style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;font-size:1rem;width:100%;box-sizing:border-box;">
          <input placeholder="מספר טלפון" style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;font-size:1rem;width:100%;box-sizing:border-box;">
          <input placeholder="כתובת אימייל" style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;font-size:1rem;width:100%;box-sizing:border-box;">
          <textarea rows="4" placeholder="הודעה" style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;font-size:1rem;width:100%;box-sizing:border-box;resize:vertical;"></textarea>
          <button type="submit" style="background:#4f46e5;color:#fff;padding:14px;border-radius:8px;font-size:1rem;font-weight:600;border:none;cursor:pointer;">שלח הודעה</button>
        </form>
      </section>`;

    case "gallery":
      return `
      <section style="padding:60px 24px;">
        <h2 style="text-align:center;font-size:2rem;font-weight:700;margin-bottom:40px;color:#1e293b;">${esc(content.heading as string ?? "גלריה")}</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;max-width:1100px;margin:0 auto;">
          ${((content.images as {url:string;alt?:string}[]) ?? []).map(img => `
          <img src="${esc(img.url)}" alt="${esc(img.alt ?? "")}" style="width:100%;height:200px;object-fit:cover;border-radius:12px;">`).join("")}
        </div>
      </section>`;

    case "image":
      return `
      <section style="padding:40px 24px;text-align:center;">
        ${content.caption ? `<p style="color:#64748b;margin-top:12px;">${esc(content.caption as string)}</p>` : ""}
        <img src="${esc(content.url as string ?? "")}" alt="${esc(content.alt as string ?? "")}" style="max-width:100%;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.1);">
      </section>`;

    case "video":
      return `
      <section style="padding:60px 24px;text-align:center;">
        ${content.heading ? `<h2 style="font-size:2rem;font-weight:700;margin-bottom:24px;color:#1e293b;">${esc(content.heading as string)}</h2>` : ""}
        <div style="position:relative;padding-bottom:56.25%;max-width:800px;margin:0 auto;">
          <iframe src="${esc(content.url as string ?? "")}" frameborder="0" allowfullscreen
            style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:12px;"></iframe>
        </div>
      </section>`;

    default:
      return "";
  }
}

function esc(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildPage(opts: {
  title: string;
  siteName: string;
  siteId: string;
  pages: { slug: string; title: string }[];
  blocks: { block_type: string; content: Record<string, unknown>; order_index: number }[];
  whatsappNum: string;
  chatEnabled: boolean;
  chatGreeting: string;
}): string {
  const navLinks = opts.pages
    .filter(p => p.slug !== "home")
    .map(p => `<a href="${p.slug === "home" ? "/" : `/${p.slug}`}" style="color:#fff;text-decoration:none;font-weight:500;">${esc(p.title)}</a>`)
    .join("");

  const bodyContent = opts.blocks
    .sort((a, b) => a.order_index - b.order_index)
    .map(b => blockToHtml(b.block_type, b.content))
    .join("\n");

  const whatsappWidget = opts.whatsappNum
    ? `<a href="https://wa.me/${opts.whatsappNum.replace(/\D/g, "")}" target="_blank" rel="noopener noreferrer"
        style="position:fixed;bottom:24px;left:24px;z-index:1000;background:#25d366;color:#fff;border-radius:50%;width:60px;height:60px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(37,211,102,.4);text-decoration:none;font-size:1.6rem;">
        💬
      </a>`
    : "";

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(opts.title)} | ${esc(opts.siteName)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; }
    a { color: inherit; }
    details > summary { list-style: none; }
    details > summary::-webkit-details-marker { display: none; }
  </style>
</head>
<body>
  <nav style="position:sticky;top:0;z-index:30;background:#1e293b;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:24px;">
    <a href="/" style="color:#fff;font-weight:800;font-size:1.1rem;text-decoration:none;">${esc(opts.siteName)}</a>
    <div style="display:flex;gap:20px;flex-wrap:wrap;">${navLinks}</div>
    <a href="#contact" style="background:#4f46e5;color:#fff;padding:10px 24px;border-radius:9999px;font-weight:600;text-decoration:none;white-space:nowrap;">צרו קשר</a>
  </nav>

  <main>${bodyContent}</main>

  <footer style="background:#0f172a;color:#94a3b8;padding:40px 24px;text-align:center;font-size:.875rem;">
    <p>© ${new Date().getFullYear()} ${esc(opts.siteName)}. כל הזכויות שמורות.</p>
  </footer>

  ${whatsappWidget}
</body>
</html>`;
}

/* ─── route handler ─── */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  // Admin only
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if ((profile as { role: string } | null)?.role !== "admin") {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const { siteId } = await params;

  const { data: siteRaw } = await supabase
    .from("sites")
    .select("id, name, netlify_site_id, netlify_url")
    .eq("id", siteId)
    .single();

  const site = siteRaw as { id: string; name: string; netlify_site_id: string | null; netlify_url: string | null } | null;
  if (!site) return NextResponse.json({ error: "אתר לא נמצא" }, { status: 404 });

  const netlifyToken = process.env.NETLIFY_API_TOKEN;
  if (!netlifyToken) return NextResponse.json({ error: "NETLIFY_API_TOKEN לא מוגדר" }, { status: 500 });

  if (!site.netlify_site_id) return NextResponse.json({ error: "netlify_site_id לא מוגדר לאתר זה" }, { status: 400 });

  // Fetch all published pages
  const { data: pagesRaw } = await supabase
    .from("site_pages")
    .select("id, slug, title, meta_title, meta_desc")
    .eq("site_id", siteId)
    .eq("is_published", true)
    .order("order_index");

  const pages = (pagesRaw ?? []) as { id: string; slug: string; title: string; meta_title: string | null; meta_desc: string | null }[];

  // Fetch chatbot settings
  const { data: settingsRaw } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("site_id", siteId)
    .in("key", ["chatbot_enabled", "chatbot_greeting", "whatsapp_number"]);

  const settings: Record<string, unknown> = {};
  for (const row of (settingsRaw ?? []) as { key: string; value: unknown }[]) {
    settings[row.key] = row.value;
  }
  const whatsappNum  = typeof settings.whatsapp_number === "string" ? settings.whatsapp_number : "";
  const chatEnabled  = settings.chatbot_enabled === true;
  const chatGreeting = typeof settings.chatbot_greeting === "string" ? settings.chatbot_greeting : "שלום! אשמח לעזור 😊";

  // Build HTML for each page
  const files: Record<string, string> = {};

  for (const page of pages) {
    const { data: blocksRaw } = await supabase
      .from("content_blocks")
      .select("block_type, content, order_index")
      .eq("page_id", page.id)
      .eq("is_visible", true)
      .order("order_index");

    const blocks = (blocksRaw ?? []) as { block_type: string; content: Record<string, unknown>; order_index: number }[];

    const html = buildPage({
      title: page.meta_title ?? page.title,
      siteName: site.name,
      siteId,
      pages,
      blocks,
      whatsappNum,
      chatEnabled,
      chatGreeting,
    });

    // Netlify: home page → /index.html, others → /slug/index.html
    const filePath = page.slug === "home" ? "/index.html" : `/${page.slug}/index.html`;
    files[filePath] = html;
  }

  if (Object.keys(files).length === 0) {
    return NextResponse.json({ error: "אין עמודים מפורסמים" }, { status: 400 });
  }

  // Deploy to Netlify Files API
  // POST /api/v1/sites/{site_id}/deploys with files as base64-encoded map
  const filesPayload: Record<string, string> = {};
  for (const [path, html] of Object.entries(files)) {
    filesPayload[path] = Buffer.from(html, "utf-8").toString("base64");
  }

  const netlifyRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${site.netlify_site_id}/deploys`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${netlifyToken}`,
      },
      body: JSON.stringify({
        files: filesPayload,
        async: false,
        draft: false,
      }),
    }
  );

  if (!netlifyRes.ok) {
    const errText = await netlifyRes.text().catch(() => "Unknown error");
    return NextResponse.json({ error: `Netlify: ${netlifyRes.status} — ${errText}` }, { status: 502 });
  }

  const deploy = await netlifyRes.json() as { id: string; deploy_url?: string; ssl_url?: string };

  // Update site with deploy URL if available
  const deployUrl = deploy.ssl_url ?? deploy.deploy_url ?? site.netlify_url;
  if (deployUrl) {
    await supabase.from("sites").update({ netlify_url: deployUrl, status: "active" }).eq("id", siteId);
  } else {
    await supabase.from("sites").update({ status: "active" }).eq("id", siteId);
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "site.exported_netlify",
    resource_type: "sites",
    resource_id: siteId,
    metadata: { site_name: site.name, deploy_id: deploy.id, pages: Object.keys(files).length },
  });

  return NextResponse.json({
    success: true,
    deploy_id: deploy.id,
    url: deployUrl,
    pages_exported: Object.keys(files).length,
    message: `${Object.keys(files).length} עמודים יוצאו ל-Netlify בהצלחה`,
  });
}
