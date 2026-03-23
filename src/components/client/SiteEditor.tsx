"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe,
  Settings,
  Save,
  Send,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Edit3,
  Image as ImageIcon,
  Type,
  Layout,
  Phone,
  Star,
  HelpCircle,
  Video,
  Layers,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import BlockEditor from "./BlockEditor";
import SettingsEditor from "./SettingsEditor";

type SitePage = {
  id: string;
  site_id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_desc: string | null;
  is_published: boolean;
  order_index: number;
};

type ContentBlock = {
  id: string;
  page_id: string;
  site_id: string;
  block_type: string;
  label: string | null;
  content: Record<string, unknown>;
  order_index: number;
  is_visible: boolean;
  is_editable: boolean;
};

type Site = {
  id: string;
  name: string;
  domain: string | null;
  netlify_url: string | null;
  status: string;
};

type TabType = "pages" | "settings";

const BLOCK_TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  hero:         { label: "כותרת ראשית", icon: <Layout className="h-4 w-4" />, color: "bg-purple-100 text-purple-700" },
  text:         { label: "טקסט",         icon: <Type className="h-4 w-4" />, color: "bg-blue-100 text-blue-700" },
  image:        { label: "תמונה",         icon: <ImageIcon className="h-4 w-4" />, color: "bg-green-100 text-green-700" },
  gallery:      { label: "גלריה",         icon: <Layers className="h-4 w-4" />, color: "bg-teal-100 text-teal-700" },
  cta:          { label: "קריאה לפעולה",  icon: <Send className="h-4 w-4" />, color: "bg-orange-100 text-orange-700" },
  contact:      { label: "צור קשר",       icon: <Phone className="h-4 w-4" />, color: "bg-red-100 text-red-700" },
  services:     { label: "שירותים",       icon: <Star className="h-4 w-4" />, color: "bg-yellow-100 text-yellow-700" },
  faq:          { label: "שאלות נפוצות",  icon: <HelpCircle className="h-4 w-4" />, color: "bg-indigo-100 text-indigo-700" },
  testimonials: { label: "המלצות",        icon: <Star className="h-4 w-4" />, color: "bg-pink-100 text-pink-700" },
  video:        { label: "וידאו",          icon: <Video className="h-4 w-4" />, color: "bg-gray-100 text-gray-700" },
};

export default function SiteEditor({
  site,
  initialPages,
  initialSettings,
}: {
  site: Site;
  initialPages: SitePage[];
  initialSettings: Record<string, unknown>;
}) {
  const [tab, setTab] = useState<TabType>("pages");
  const [pages, setPages] = useState<SitePage[]>(initialPages);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(
    initialPages[0]?.id ?? null
  );
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [blocksLoaded, setBlocksLoaded] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [publishStatus, setPublishStatus] = useState<string | null>(null);

  const selectedPage = pages.find((p) => p.id === selectedPageId) ?? null;
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;

  // Load blocks when page changes
  const loadBlocks = useCallback(async (pageId: string) => {
    if (blocksLoaded === pageId) return;
    const res = await fetch(`/api/content/blocks?pageId=${pageId}`);
    if (res.ok) {
      const data: ContentBlock[] = await res.json();
      setBlocks((prev) => [
        ...prev.filter((b) => b.page_id !== pageId),
        ...data,
      ]);
      setBlocksLoaded(pageId);
    }
  }, [blocksLoaded]);

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    setSelectedBlockId(null);
    loadBlocks(pageId);
  };

  const pageBlocks = blocks
    .filter((b) => b.page_id === selectedPageId)
    .sort((a, b) => a.order_index - b.order_index);

  // Save a single block's content
  const saveBlock = async (blockId: string, content: Record<string, unknown>) => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/content/blocks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: blockId, content }),
      });
      if (!res.ok) throw new Error();
      const updated: ContentBlock = await res.json();
      setBlocks((prev) => prev.map((b) => (b.id === blockId ? updated : b)));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  // Toggle block visibility
  const toggleBlockVisibility = async (block: ContentBlock) => {
    const res = await fetch("/api/content/blocks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: block.id, is_visible: !block.is_visible }),
    });
    if (res.ok) {
      const updated: ContentBlock = await res.json();
      setBlocks((prev) => prev.map((b) => (b.id === block.id ? updated : b)));
    }
  };

  // Move block up/down
  const moveBlock = async (blockId: string, direction: "up" | "down") => {
    const list = [...pageBlocks];
    const idx = list.findIndex((b) => b.id === blockId);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === list.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newOrder = list[swapIdx].order_index;
    const oldOrder = list[idx].order_index;

    await Promise.all([
      fetch("/api/content/blocks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: blockId, order_index: newOrder }),
      }),
      fetch("/api/content/blocks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: list[swapIdx].id, order_index: oldOrder }),
      }),
    ]);

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === blockId) return { ...b, order_index: newOrder };
        if (b.id === list[swapIdx].id) return { ...b, order_index: oldOrder };
        return b;
      })
    );
  };

  // Save settings key
  const saveSetting = async (key: string, value: unknown) => {
    const res = await fetch("/api/content/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_id: site.id, key, value }),
    });
    if (res.ok) {
      setSettings((prev) => ({ ...prev, [key]: value }));
    }
  };

  // Publish site
  const publishSite = async () => {
    setPublishing(true);
    setPublishStatus(null);
    try {
      const res = await fetch(`/api/content/publish/${site.id}`, { method: "POST" });
      const data = await res.json();
      setPublishStatus(data.message ?? "פורסם בהצלחה");
      // Mark all pages as published in local state
      setPages((prev) => prev.map((p) => ({ ...p, is_published: true })));
    } catch {
      setPublishStatus("שגיאה בפרסום");
    } finally {
      setPublishing(false);
    }
  };

  const hasUnpublished = pages.some((p) => !p.is_published);

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Edit3 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">{site.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">עורך תוכן</p>
          </div>
          {site.netlify_url && (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild>
              <a href={site.netlify_url} target="_blank" rel="noopener noreferrer">
                <Globe className="h-3 w-3" />
                צפה באתר
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" /> נשמר
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs text-red-600">שגיאה בשמירה</span>
          )}
          {saving && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> שומר...
            </span>
          )}
          <Button
            onClick={publishSite}
            disabled={publishing}
            size="sm"
            className="gap-2"
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {publishing ? "מפרסם..." : "פרסם אתר"}
            {hasUnpublished && !publishing && (
              <Badge variant="warning" className="text-xs px-1.5 py-0 h-4">!</Badge>
            )}
          </Button>
        </div>
      </div>

      {publishStatus && (
        <div className="mx-4 mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {publishStatus}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b px-4 bg-background">
        <button
          onClick={() => setTab("pages")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "pages"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            עמודים
          </span>
        </button>
        <button
          onClick={() => setTab("settings")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "settings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            הגדרות אתר
          </span>
        </button>
      </div>

      {tab === "settings" ? (
        <div className="p-4 overflow-y-auto">
          <SettingsEditor
            siteId={site.id}
            settings={settings}
            onSave={saveSetting}
          />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden min-h-[500px]">
          {/* Left: Pages List */}
          <div className="w-44 shrink-0 border-r overflow-y-auto bg-muted/20">
            <div className="p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">עמודים</p>
              <div className="space-y-1">
                {pages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    אין עמודים עדיין.
                    <br />
                    בקש מהמנהל להוסיף.
                  </p>
                ) : (
                  pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => handleSelectPage(page.id)}
                      className={`w-full text-right px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between gap-1 ${
                        selectedPageId === page.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <span className="truncate">{page.title}</span>
                      {!page.is_published && (
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" title="לא פורסם" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Center: Blocks List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {!selectedPage ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                בחר עמוד מהצד שמאל
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold">{selectedPage.title}</h2>
                    <p className="text-xs text-muted-foreground">/{selectedPage.slug}</p>
                  </div>
                  <Badge variant={selectedPage.is_published ? "success" : "warning"}>
                    {selectedPage.is_published ? "מפורסם" : "טיוטה"}
                  </Badge>
                </div>

                {pageBlocks.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground text-sm">
                      אין בלוקים בעמוד זה עדיין.
                      <br />
                      בקש מהמנהל להוסיף סקשנים.
                    </CardContent>
                  </Card>
                ) : (
                  pageBlocks.map((block, idx) => {
                    const meta = BLOCK_TYPE_META[block.block_type] ?? {
                      label: block.block_type,
                      icon: <Layers className="h-4 w-4" />,
                      color: "bg-gray-100 text-gray-700",
                    };
                    const isSelected = selectedBlockId === block.id;

                    return (
                      <Card
                        key={block.id}
                        className={`transition-all cursor-pointer ${
                          isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
                        } ${!block.is_visible ? "opacity-50" : ""}`}
                        onClick={() => setSelectedBlockId(isSelected ? null : block.id)}
                      >
                        <CardHeader className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.color}`}>
                              {meta.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm">
                                {block.label || meta.label}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground">{meta.label}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "up"); }}
                                disabled={idx === 0}
                                title="הזז למעלה"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "down"); }}
                                disabled={idx === pageBlocks.length - 1}
                                title="הזז למטה"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => { e.stopPropagation(); toggleBlockVisibility(block); }}
                                title={block.is_visible ? "הסתר" : "הצג"}
                              >
                                {block.is_visible ? (
                                  <Eye className="h-3 w-3" />
                                ) : (
                                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                                )}
                              </Button>
                              {block.is_editable && (
                                <Button
                                  variant={isSelected ? "default" : "ghost"}
                                  size="sm"
                                  className="h-7 px-2 text-xs gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBlockId(isSelected ? null : block.id);
                                  }}
                                >
                                  <Edit3 className="h-3 w-3" />
                                  ערוך
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })
                )}
              </>
            )}
          </div>

          {/* Right: Block Editor Panel */}
          {selectedBlock && (
            <div className="w-80 shrink-0 border-r overflow-y-auto bg-background">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-medium text-sm">
                  {selectedBlock.label || BLOCK_TYPE_META[selectedBlock.block_type]?.label || "ערוך בלוק"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setSelectedBlockId(null)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-4">
                <BlockEditor
                  block={selectedBlock}
                  onSave={(content) => saveBlock(selectedBlock.id, content)}
                  saving={saving}
                />
              </div>
              <div className="p-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  שינויים נשמרים אוטומטית.
                  <br />
                  לחץ &ldquo;פרסם אתר&rdquo; למעלה להפעיל את השינויים באתר.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
