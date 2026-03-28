"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe, Settings, Send, Eye, EyeOff, Edit3, Image as ImageIcon,
  Type, Layout, Phone, Star, HelpCircle, Video, Layers,
  CheckCircle2, Loader2, ExternalLink, Bot, Plus, Trash2,
  GripVertical, RefreshCw, X, PanelRight, FilePlus,
} from "lucide-react";
import BlockEditor from "./BlockEditor";
import SettingsEditor from "./SettingsEditor";
import { FULL_PERMISSIONS, BLOCK_PERMISSION, type ClientPermissions } from "@/lib/permissions";
import { cn } from "@/lib/utils";

/* ─── types ─── */
type SitePage = {
  id: string; site_id: string; slug: string; title: string;
  meta_title: string | null; meta_desc: string | null;
  is_published: boolean; order_index: number;
};
type ContentBlock = {
  id: string; page_id: string; site_id: string; block_type: string;
  label: string | null; content: Record<string, unknown>;
  order_index: number; is_visible: boolean; is_editable: boolean;
};
type Site = {
  id: string; name: string; domain: string | null;
  netlify_url: string | null; status: string;
};

/* ─── block meta ─── */
const BLOCK_META: Record<string, { label: string; icon: React.ReactNode; color: string; emoji: string }> = {
  hero:         { label: "כותרת ראשית",   icon: <Layout className="h-4 w-4" />,     color: "bg-purple-100 text-purple-700",  emoji: "🦸" },
  text:         { label: "טקסט",           icon: <Type className="h-4 w-4" />,       color: "bg-blue-100 text-blue-700",      emoji: "📝" },
  image:        { label: "תמונה",           icon: <ImageIcon className="h-4 w-4" />, color: "bg-green-100 text-green-700",    emoji: "🖼️" },
  gallery:      { label: "גלריה",           icon: <Layers className="h-4 w-4" />,    color: "bg-teal-100 text-teal-700",      emoji: "🎨" },
  cta:          { label: "קריאה לפעולה",   icon: <Send className="h-4 w-4" />,       color: "bg-orange-100 text-orange-700",  emoji: "🚀" },
  contact:      { label: "צור קשר",         icon: <Phone className="h-4 w-4" />,      color: "bg-red-100 text-red-700",        emoji: "📞" },
  services:     { label: "שירותים",         icon: <Star className="h-4 w-4" />,       color: "bg-yellow-100 text-yellow-700",  emoji: "⭐" },
  faq:          { label: "שאלות נפוצות",   icon: <HelpCircle className="h-4 w-4" />, color: "bg-indigo-100 text-indigo-700",  emoji: "❓" },
  testimonials: { label: "המלצות",          icon: <Star className="h-4 w-4" />,       color: "bg-pink-100 text-pink-700",      emoji: "💬" },
  video:        { label: "וידאו",            icon: <Video className="h-4 w-4" />,      color: "bg-gray-100 text-gray-700",      emoji: "🎥" },
};

/* ─── Add Block modal ─── */
function AddBlockModal({
  onAdd,
  onClose,
}: {
  onAdd: (type: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        dir="rtl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900">הוסף בלוק חדש</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(BLOCK_META).map(([type, meta]) => (
            <button
              key={type}
              onClick={() => { onAdd(type); onClose(); }}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-right hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              <span className="text-2xl">{meta.emoji}</span>
              <div>
                <p className="text-sm font-medium text-slate-800">{meta.label}</p>
                <p className="text-xs text-slate-400">{type}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Add Page modal ─── */
function AddPageModal({
  siteId,
  onAdd,
  onClose,
}: {
  siteId: string;
  onAdd: (page: SitePage) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ title: "", slug: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) { setErr("כותרת וslug חובה"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/content/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_id: siteId, title: form.title, slug: form.slug, order_index: 99 }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const page: SitePage = await res.json();
      onAdd(page);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        dir="rtl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">הוסף עמוד חדש</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">כותרת עמוד</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="לדוגמה: שירותים"
              className="input-field mt-1"
              dir="rtl"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Slug (URL)</label>
            <input
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s/g, "-") }))}
              placeholder="לדוגמה: services"
              className="input-field mt-1"
              dir="ltr"
            />
          </div>
          {err && <p className="text-xs text-red-600">{err}</p>}
          <Button type="submit" disabled={saving} className="w-full gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus className="h-4 w-4" />}
            הוסף עמוד
          </Button>
        </form>
      </div>
    </div>
  );
}

/* ─── main component ─── */
export default function SiteEditor({
  site,
  initialPages,
  initialSettings,
  clientPermissions,
  isAdmin = false,
}: {
  site: Site;
  initialPages: SitePage[];
  initialSettings: Record<string, unknown>;
  clientPermissions?: ClientPermissions;
  isAdmin?: boolean;
}) {
  const perms: ClientPermissions = clientPermissions ?? FULL_PERMISSIONS;
  const [tab, setTab] = useState<"pages" | "settings">("pages");
  const [pages, setPages] = useState<SitePage[]>(initialPages);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(initialPages[0]?.id ?? null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [blocksLoaded, setBlocksLoaded] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showAddPage, setShowAddPage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // DnD state
  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);

  const selectedPage  = pages.find(p => p.id === selectedPageId) ?? null;
  const selectedBlock = blocks.find(b => b.id === selectedBlockId) ?? null;

  const loadBlocks = useCallback(async (pageId: string) => {
    if (blocksLoaded === pageId) return;
    const res = await fetch(`/api/content/blocks?pageId=${pageId}`);
    if (res.ok) {
      const data: ContentBlock[] = await res.json();
      setBlocks(prev => [...prev.filter(b => b.page_id !== pageId), ...data]);
      setBlocksLoaded(pageId);
    }
  }, [blocksLoaded]);

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    setSelectedBlockId(null);
    loadBlocks(pageId);
  };

  const pageBlocks = blocks
    .filter(b => b.page_id === selectedPageId)
    .sort((a, b) => a.order_index - b.order_index);

  /* ── save block ── */
  const saveBlock = async (blockId: string, content: Record<string, unknown>) => {
    setSaving(true); setSaveStatus("idle");
    try {
      const res = await fetch("/api/content/blocks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: blockId, content }),
      });
      if (!res.ok) throw new Error();
      const updated: ContentBlock = await res.json();
      setBlocks(prev => prev.map(b => b.id === blockId ? updated : b));
      setSaveStatus("saved");
      setPreviewKey(k => k + 1);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch { setSaveStatus("error"); }
    finally { setSaving(false); }
  };

  /* ── toggle visibility ── */
  const toggleVisibility = async (block: ContentBlock) => {
    const res = await fetch("/api/content/blocks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: block.id, is_visible: !block.is_visible }),
    });
    if (res.ok) {
      const updated: ContentBlock = await res.json();
      setBlocks(prev => prev.map(b => b.id === block.id ? updated : b));
      setPreviewKey(k => k + 1);
    }
  };

  /* ── add block ── */
  const addBlock = async (blockType: string) => {
    if (!selectedPageId || !selectedPage) return;
    const maxOrder = pageBlocks.length > 0 ? Math.max(...pageBlocks.map(b => b.order_index)) + 1 : 0;
    const res = await fetch("/api/content/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_id: selectedPageId,
        site_id: site.id,
        block_type: blockType,
        label: BLOCK_META[blockType]?.label ?? blockType,
        content: {},
        order_index: maxOrder,
        is_visible: true,
        is_editable: true,
      }),
    });
    if (res.ok) {
      const newBlock: ContentBlock = await res.json();
      setBlocks(prev => [...prev, newBlock]);
      setSelectedBlockId(newBlock.id);
      setPreviewKey(k => k + 1);
    }
  };

  /* ── delete block ── */
  const deleteBlock = async (blockId: string) => {
    if (!confirm("מחק בלוק זה?")) return;
    const res = await fetch(`/api/content/blocks?id=${blockId}`, { method: "DELETE" });
    if (res.ok) {
      setBlocks(prev => prev.filter(b => b.id !== blockId));
      if (selectedBlockId === blockId) setSelectedBlockId(null);
      setPreviewKey(k => k + 1);
    }
  };

  /* ── DnD reorder ── */
  const handleDragStart = (blockId: string) => { dragItem.current = blockId; };
  const handleDragOver  = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    dragOverItem.current = blockId;
  };
  const handleDrop = async () => {
    if (!dragItem.current || !dragOverItem.current || dragItem.current === dragOverItem.current) return;
    const list  = [...pageBlocks];
    const from  = list.findIndex(b => b.id === dragItem.current);
    const to    = list.findIndex(b => b.id === dragOverItem.current);
    if (from < 0 || to < 0) return;

    // Recompute order_index values
    const reordered = [...list];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const updates = reordered.map((b, i) => ({ id: b.id, order_index: i }));

    // Optimistic update
    setBlocks(prev => prev.map(b => {
      const u = updates.find(x => x.id === b.id);
      return u ? { ...b, order_index: u.order_index } : b;
    }));

    // Persist
    await Promise.all(updates.map(({ id, order_index }) =>
      fetch("/api/content/blocks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, order_index }),
      })
    ));
    setPreviewKey(k => k + 1);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  /* ── settings ── */
  const saveSetting = async (key: string, value: unknown) => {
    const res = await fetch("/api/content/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_id: site.id, key, value }),
    });
    if (res.ok) setSettings(prev => ({ ...prev, [key]: value }));
  };

  /* ── publish ── */
  const publishSite = async () => {
    setPublishing(true); setPublishStatus(null);
    try {
      const res = await fetch(`/api/content/publish/${site.id}`, { method: "POST" });
      const data = await res.json();
      setPublishStatus(data.message ?? "פורסם בהצלחה");
      setPages(prev => prev.map(p => ({ ...p, is_published: true })));
      setPreviewKey(k => k + 1);
    } catch { setPublishStatus("שגיאה בפרסום"); }
    finally { setPublishing(false); }
  };

  const hasUnpublished = pages.some(p => !p.is_published);

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Edit3 className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold leading-none truncate">{site.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">עורך תוכן</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" /> נשמר
            </span>
          )}
          {saving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}

          <Button
            variant="outline" size="sm"
            onClick={() => setShowPreview(v => !v)}
            className={cn("gap-1.5 text-xs", showPreview && "bg-indigo-50 border-indigo-300 text-indigo-700")}
          >
            <PanelRight className="h-3.5 w-3.5" />
            תצוגה
          </Button>

          {site.netlify_url && (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild>
              <a href={site.netlify_url} target="_blank" rel="noopener noreferrer">
                <Globe className="h-3 w-3" />
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}

          <Button
            onClick={publishSite}
            disabled={publishing || !perms.publish_site}
            size="sm" className="gap-2"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {publishing ? "מפרסם..." : "פרסם"}
            {hasUnpublished && !publishing && (
              <Badge variant="warning" className="text-xs px-1 py-0 h-4">!</Badge>
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

      {/* ── Tabs ── */}
      <div className="flex border-b px-4 bg-background">
        {([
          { key: "pages", label: "עמודים", icon: Layers, disabled: false },
          { key: "settings", label: "הגדרות", icon: Settings, disabled: !perms.edit_settings },
        ] as const).map(({ key, label, icon: Icon, disabled }) => (
          <button
            key={key}
            onClick={() => !disabled && setTab(key)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
              disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "settings" ? (
        <div className="p-4 overflow-y-auto">
          <SettingsEditor siteId={site.id} settings={settings} onSave={saveSetting} />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* ── Pages sidebar ── */}
          <div className="w-40 shrink-0 border-l overflow-y-auto bg-muted/20 flex flex-col">
            <div className="p-3 flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">עמודים</p>
              <div className="space-y-1">
                {pages.map(page => (
                  <button
                    key={page.id}
                    onClick={() => handleSelectPage(page.id)}
                    className={cn(
                      "w-full text-right px-2.5 py-2 rounded-md text-sm transition-colors flex items-center justify-between gap-1",
                      selectedPageId === page.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    )}
                  >
                    <span className="truncate">{page.title}</span>
                    {!page.is_published && (
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" title="לא פורסם" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            {isAdmin && (
              <div className="p-2 border-t">
                <button
                  onClick={() => setShowAddPage(true)}
                  className="w-full flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-2 text-xs text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  עמוד חדש
                </button>
              </div>
            )}
          </div>

          {/* ── Blocks list ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 min-w-0">
            {!selectedPage ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                בחר עמוד
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="font-semibold text-sm">{selectedPage.title}</h2>
                    <p className="text-xs text-muted-foreground">/{selectedPage.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedPage.is_published ? "success" : "warning"} className="text-xs">
                      {selectedPage.is_published ? "מפורסם" : "טיוטה"}
                    </Badge>
                    {isAdmin && (
                      <Button
                        size="sm" variant="outline"
                        onClick={() => setShowAddBlock(true)}
                        className="gap-1.5 text-xs h-7"
                      >
                        <Plus className="h-3 w-3" />
                        הוסף בלוק
                      </Button>
                    )}
                  </div>
                </div>

                {pageBlocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 gap-3 text-center">
                    <Layers className="h-8 w-8 text-slate-300" />
                    <p className="text-sm text-slate-400">אין בלוקים בעמוד זה</p>
                    {isAdmin && (
                      <Button size="sm" variant="outline" onClick={() => setShowAddBlock(true)} className="gap-1.5">
                        <Plus className="h-3 w-3" />
                        הוסף בלוק ראשון
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pageBlocks.map((block, idx) => {
                      const meta = BLOCK_META[block.block_type] ?? { label: block.block_type, icon: <Layers className="h-4 w-4" />, color: "bg-gray-100 text-gray-700", emoji: "📦" };
                      const isSelected = selectedBlockId === block.id;

                      return (
                        <div
                          key={block.id}
                          draggable={isAdmin}
                          onDragStart={() => handleDragStart(block.id)}
                          onDragOver={e => handleDragOver(e, block.id)}
                          onDrop={handleDrop}
                          className={cn(
                            "rounded-xl border bg-white transition-all cursor-pointer",
                            isSelected ? "ring-2 ring-primary border-primary" : "hover:shadow-sm hover:border-slate-300",
                            !block.is_visible && "opacity-50"
                          )}
                          onClick={() => setSelectedBlockId(isSelected ? null : block.id)}
                        >
                          <div className="flex items-center gap-2 px-3 py-3">
                            {/* Drag handle */}
                            {isAdmin && (
                              <GripVertical className="h-4 w-4 text-slate-300 cursor-grab shrink-0" />
                            )}

                            {/* Block type icon */}
                            <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg shrink-0", meta.color)}>
                              {meta.icon}
                            </div>

                            {/* Label */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {block.label || meta.label}
                              </p>
                              <p className="text-xs text-slate-400">{meta.label} · #{idx + 1}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => toggleVisibility(block)}
                                title={block.is_visible ? "הסתר" : "הצג"}
                                className="rounded-md p-1.5 hover:bg-slate-100 transition-colors"
                              >
                                {block.is_visible
                                  ? <Eye className="h-3.5 w-3.5 text-slate-400" />
                                  : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                              </button>

                              {block.is_editable && perms[BLOCK_PERMISSION[block.block_type] ?? "edit_text"] && (
                                <button
                                  onClick={() => setSelectedBlockId(isSelected ? null : block.id)}
                                  className={cn(
                                    "rounded-md p-1.5 transition-colors",
                                    isSelected ? "bg-primary text-primary-foreground" : "hover:bg-slate-100 text-slate-400"
                                  )}
                                  title="ערוך"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                              )}

                              {isAdmin && (
                                <button
                                  onClick={() => deleteBlock(block.id)}
                                  className="rounded-md p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                                  title="מחק בלוק"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Right: Block editor OR Live preview ── */}
          {(selectedBlock || showPreview) && (
            <div className="w-80 shrink-0 border-r flex flex-col bg-background overflow-hidden">
              {showPreview ? (
                <>
                  <div className="flex items-center justify-between border-b px-3 py-2 bg-slate-50">
                    <p className="text-xs font-medium text-slate-600">תצוגה מקדימה</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewKey(k => k + 1)}
                        title="רענן"
                        className="rounded p-1 hover:bg-slate-200 transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                      <a
                        href={`/sites/${site.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1 hover:bg-slate-200 transition-colors"
                        title="פתח בחלון חדש"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                      </a>
                    </div>
                  </div>
                  <iframe
                    key={previewKey}
                    src={`/sites/${site.id}${selectedPageId && selectedPage?.slug !== "home" ? `/${selectedPage?.slug}` : ""}`}
                    className="flex-1 w-full border-0"
                    title="תצוגה מקדימה"
                  />
                </>
              ) : selectedBlock ? (
                <>
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="font-medium text-sm">
                      {selectedBlock.label || BLOCK_META[selectedBlock.block_type]?.label || "ערוך בלוק"}
                    </h3>
                    <button
                      onClick={() => setSelectedBlockId(null)}
                      className="rounded-lg p-1 hover:bg-slate-100"
                    >
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                  <div className="p-4 overflow-y-auto flex-1">
                    <BlockEditor
                      block={selectedBlock}
                      onSave={content => saveBlock(selectedBlock.id, content)}
                      saving={saving}
                    />
                  </div>
                  <p className="px-4 pb-4 text-xs text-muted-foreground text-center">
                    שינויים נשמרים ומתעדכנים בתצוגה המקדימה.
                  </p>
                </>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showAddBlock && (
        <AddBlockModal
          onAdd={addBlock}
          onClose={() => setShowAddBlock(false)}
        />
      )}
      {showAddPage && (
        <AddPageModal
          siteId={site.id}
          onAdd={page => setPages(prev => [...prev, page])}
          onClose={() => setShowAddPage(false)}
        />
      )}
    </div>
  );
}
