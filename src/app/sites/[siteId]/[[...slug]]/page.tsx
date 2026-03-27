import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteBlock } from "@/components/site-renderer/blocks";
import { WhatsAppButton } from "@/components/site-renderer/whatsapp-button";
import { ChatWidget } from "@/components/chat-widget";

/* ─── types ─── */
interface PageRow {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_desc: string | null;
  is_published: boolean;
  order_index: number;
}

interface BlockRow {
  id: string;
  block_type: string;
  label: string | null;
  content: Record<string, unknown>;
  order_index: number;
  is_visible: boolean;
}

interface SiteRow {
  id: string;
  name: string;
  domain: string | null;
}

/* ─── metadata ─── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ siteId: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { siteId, slug } = await params;
  const pageSlug = slug?.[0] ?? "home";
  const supabase = await createClient();

  const { data: pageRaw } = await supabase
    .from("site_pages")
    .select("title, meta_title, meta_desc")
    .eq("site_id", siteId)
    .eq("slug", pageSlug)
    .eq("is_published", true)
    .single();

  const page = pageRaw as { title: string; meta_title: string | null; meta_desc: string | null } | null;

  return {
    title: page?.meta_title ?? page?.title ?? "אתר",
    description: page?.meta_desc ?? undefined,
  };
}

/* ─── page ─── */
export default async function SitePage({
  params,
}: {
  params: Promise<{ siteId: string; slug?: string[] }>;
}) {
  const { siteId, slug } = await params;
  const pageSlug = slug?.[0] ?? "home";
  const supabase = await createClient();

  // Fetch site
  const { data: siteRaw } = await supabase
    .from("sites")
    .select("id, name, domain")
    .eq("id", siteId)
    .single();

  const site = siteRaw as SiteRow | null;
  if (!site) notFound();

  // Fetch page
  const { data: pageRaw } = await supabase
    .from("site_pages")
    .select("id, slug, title, meta_title, meta_desc, is_published, order_index")
    .eq("site_id", siteId)
    .eq("slug", pageSlug)
    .single();

  const page = pageRaw as PageRow | null;
  if (!page) notFound();

  // Fetch all pages for nav
  const { data: allPagesRaw } = await supabase
    .from("site_pages")
    .select("id, slug, title, order_index")
    .eq("site_id", siteId)
    .eq("is_published", true)
    .order("order_index");

  const allPages = (allPagesRaw ?? []) as PageRow[];

  // Fetch blocks
  const { data: blocksRaw } = await supabase
    .from("content_blocks")
    .select("id, block_type, label, content, order_index, is_visible")
    .eq("page_id", page.id)
    .eq("is_visible", true)
    .order("order_index");

  const blocks = (blocksRaw ?? []) as BlockRow[];

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

  const chatEnabled   = settings.chatbot_enabled === true;
  const chatGreeting  = typeof settings.chatbot_greeting === "string" ? settings.chatbot_greeting : "שלום! אשמח לעזור 😊";
  const whatsappNum   = typeof settings.whatsapp_number === "string" ? settings.whatsapp_number : "";

  const navPages = allPages.filter(p => p.slug !== "home").slice(0, 6);

  return (
    <div className="min-h-screen bg-white font-sans" dir="rtl">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href={`/sites/${siteId}`} className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">
            {site.name}
          </a>
          {navPages.length > 0 && (
            <div className="hidden sm:flex items-center gap-6">
              <a
                href={`/sites/${siteId}`}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >
                ראשי
              </a>
              {navPages.map(p => (
                <a
                  key={p.id}
                  href={`/sites/${siteId}/${p.slug}`}
                  className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  {p.title}
                </a>
              ))}
            </div>
          )}
          <a
            href="#contact"
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            צרו קשר
          </a>
        </div>
      </nav>

      {/* ── Content Blocks ── */}
      <main>
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400">
            <div className="text-6xl">🚧</div>
            <p className="text-lg">האתר בבנייה — בקרוב!</p>
          </div>
        ) : (
          blocks.map(block => (
            <SiteBlock
              key={block.id}
              block_type={block.block_type}
              content={block.content}
            />
          ))
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-slate-900 text-slate-400 py-10 px-6 text-center text-sm">
        <p>© {new Date().getFullYear()} {site.name}. כל הזכויות שמורות.</p>
        {site.domain && (
          <p className="mt-1 text-slate-500" dir="ltr">{site.domain}</p>
        )}
      </footer>

      {/* ── Floating: WhatsApp + Chatbot ── */}
      {whatsappNum && <WhatsAppButton number={whatsappNum} />}
      {chatEnabled && <ChatWidget siteId={siteId} greeting={chatGreeting} />}
    </div>
  );
}
