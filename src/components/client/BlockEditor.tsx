"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Upload, X, ImageIcon, Bot } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Block = {
  id: string;
  site_id: string;
  block_type: string;
  content: Record<string, unknown>;
};

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "color" | "list" | "image";
  placeholder?: string;
};

const BLOCK_FIELDS: Record<string, FieldDef[]> = {
  hero: [
    { key: "heading",    label: "כותרת ראשית",    type: "text",     placeholder: "ברוכים הבאים אל..." },
    { key: "subheading", label: "תת כותרת",        type: "textarea", placeholder: "תיאור קצר..." },
    { key: "cta_text",   label: "טקסט כפתור CTA",  type: "text",     placeholder: "צרו קשר" },
    { key: "cta_link",   label: "קישור כפתור",      type: "url",      placeholder: "https://..." },
    { key: "image_url",  label: "תמונת רקע",        type: "image",    placeholder: "https://..." },
  ],
  text: [
    { key: "heading", label: "כותרת",  type: "text",     placeholder: "..." },
    { key: "body",    label: "תוכן",   type: "textarea", placeholder: "הכנס טקסט כאן..." },
  ],
  image: [
    { key: "url",     label: "תמונה",        type: "image", placeholder: "https://..." },
    { key: "alt",     label: "תיאור נגישות", type: "text",  placeholder: "תיאור התמונה" },
    { key: "caption", label: "כיתוב",         type: "text",  placeholder: "..." },
  ],
  gallery: [
    { key: "heading", label: "כותרת", type: "text", placeholder: "הגלריה שלנו" },
    { key: "images",  label: "תמונות (URL, שורה אחת לכל תמונה)", type: "list", placeholder: "https://...\nhttps://..." },
  ],
  cta: [
    { key: "heading",  label: "כותרת",       type: "text",     placeholder: "מוכנים להתחיל?" },
    { key: "body",     label: "טקסט",         type: "textarea", placeholder: "..." },
    { key: "btn_text", label: "טקסט כפתור",   type: "text",     placeholder: "צרו קשר" },
    { key: "btn_link", label: "קישור כפתור",  type: "url",      placeholder: "https://..." },
  ],
  contact: [
    { key: "phone",    label: "טלפון",    type: "text", placeholder: "050-0000000" },
    { key: "email",    label: "אימייל",   type: "text", placeholder: "info@example.com" },
    { key: "address",  label: "כתובת",    type: "text", placeholder: "רחוב, עיר" },
    { key: "whatsapp", label: "WhatsApp", type: "text", placeholder: "972500000000" },
  ],
  services: [
    { key: "heading",  label: "כותרת",    type: "text", placeholder: "השירותים שלנו" },
    { key: "services", label: "שירותים (שורה לכל שירות: שם|תיאור)", type: "list", placeholder: "עיצוב אתרים|אנחנו בונים...\nקידום אורגני|..." },
  ],
  faq: [
    { key: "heading", label: "כותרת", type: "text", placeholder: "שאלות נפוצות" },
    { key: "items",   label: "שאלות ותשובות (שאלה|תשובה, שורה לכל זוג)", type: "list", placeholder: "מה המחיר?|המחיר מתחיל מ...\nכמה זמן לוקח?|..." },
  ],
  testimonials: [
    { key: "heading",      label: "כותרת",  type: "text", placeholder: "מה אומרים עלינו" },
    { key: "testimonials", label: "המלצות (שם|המלצה, שורה לכל המלצה)", type: "list", placeholder: "דנה כ.|שירות מעולה!\nיוסי ל.|ממליץ בחום" },
  ],
  video: [
    { key: "url",     label: "קישור וידאו (YouTube/Vimeo)", type: "url",      placeholder: "https://youtube.com/..." },
    { key: "caption", label: "כיתוב",                       type: "text",     placeholder: "..." },
  ],
  chatbot: [
    { key: "greeting",       label: "הודעת פתיחה",            type: "textarea", placeholder: "שלום! כיצד אוכל לעזור לך היום?" },
    { key: "fallback",       label: "הודעה כשאין תשובה",      type: "textarea", placeholder: "מצטער, לא הבנתי. נסה שוב או השאר פרטים." },
    { key: "contact_email",  label: "אימייל ליצירת קשר",      type: "text",     placeholder: "info@example.com" },
    { key: "contact_phone",  label: "טלפון ליצירת קשר",       type: "text",     placeholder: "050-0000000" },
    { key: "knowledge_base", label: "שאלות ותשובות (שאלה|תשובה)", type: "list", placeholder: "מה שעות הפעילות?|פתוחים א׳-ה׳ 9-18\nמה המחיר?|מחיר מותאם אישית" },
    { key: "quick_replies",  label: "כפתורי תשובה מהירה",     type: "list",     placeholder: "מחירון\nצור קשר\nשירותים\nשאלות נפוצות" },
  ],
};

function parseListField(value: unknown): string {
  if (!value) return "";
  if (Array.isArray(value)) return value.join("\n");
  return String(value);
}

function serializeListField(raw: string): string[] {
  return raw.split("\n").map((l) => l.trim()).filter(Boolean);
}

// Upload an image file to Supabase Storage and return its public URL
async function uploadToStorage(file: File, siteId: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${siteId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("site-media")
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = supabase.storage
    .from("site-media")
    .getPublicUrl(data.path);

  return publicUrl;
}

// Single-image field: shows preview, upload button, and URL paste fallback
function ImageField({
  value,
  onChange,
  placeholder,
  siteId,
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  siteId: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      setError(null);
      try {
        const url = await uploadToStorage(file, siteId);
        onChange(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה בהעלאה");
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [siteId, onChange]
  );

  return (
    <div className="space-y-2">
      {/* Preview */}
      {value && (
        <div className="relative rounded-lg overflow-hidden border bg-muted/30 h-32 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="preview"
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            title="הסר תמונה"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {!value && (
        <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 text-muted-foreground">
          <div className="flex flex-col items-center gap-1">
            <ImageIcon className="h-6 w-6 opacity-40" />
            <span className="text-xs">אין תמונה</span>
          </div>
        </div>
      )}

      {/* Upload button */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="w-full gap-2"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        {uploading ? "מעלה..." : "העלה תמונה מהמחשב"}
      </Button>

      {/* URL fallback */}
      <div className="relative">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "או הדבק קישור URL..."}
          dir="ltr"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-xs text-muted-foreground"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

export default function BlockEditor({
  block,
  onSave,
  saving,
}: {
  block: Block;
  onSave: (content: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const fields = BLOCK_FIELDS[block.block_type] ?? [];
  const [form, setForm] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  // Init form from block.content
  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      if (field.type === "list") {
        initial[field.key] = parseListField(block.content[field.key]);
      } else {
        initial[field.key] = String(block.content[field.key] ?? "");
      }
    }
    setForm(initial);
    setDirty(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    const content: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.type === "list") {
        content[field.key] = serializeListField(form[field.key] ?? "");
      } else {
        content[field.key] = form[field.key] ?? "";
      }
    }
    onSave(content);
    setDirty(false);
  };

  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        אין שדות ניתנים לעריכה לסוג בלוק זה.
      </p>
    );
  }

  // Chatbot header
  const isChatbot = block.block_type === "chatbot";

  return (
    <div className="space-y-4">
      {isChatbot && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
          <Bot className="h-4 w-4 text-blue-600 shrink-0" />
          <p className="text-xs text-blue-700">
            הצ׳אטבוט מופעל באתר אוטומטית. עדכן כאן את תכני השיחה.
          </p>
        </div>
      )}

      {fields.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <label className="text-sm font-medium text-right block">{field.label}</label>

          {field.type === "image" ? (
            <ImageField
              value={form[field.key] ?? ""}
              onChange={(url) => handleChange(field.key, url)}
              placeholder={field.placeholder}
              siteId={block.site_id}
            />
          ) : field.type === "textarea" || field.type === "list" ? (
            <textarea
              value={form[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={field.type === "list" ? 5 : 3}
              dir="auto"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <input
              type={field.type === "url" ? "url" : field.type === "color" ? "color" : "text"}
              value={form[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              dir="auto"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}

          {field.type === "list" && (
            <p className="text-xs text-muted-foreground">שורה אחת לכל פריט</p>
          )}
        </div>
      ))}

      <Button
        onClick={handleSave}
        disabled={saving || !dirty}
        className="w-full gap-2"
        size="sm"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? "שומר..." : "שמור שינויים"}
      </Button>
    </div>
  );
}
