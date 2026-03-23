"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

type Block = {
  id: string;
  block_type: string;
  content: Record<string, unknown>;
};

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "color" | "list";
  placeholder?: string;
};

const BLOCK_FIELDS: Record<string, FieldDef[]> = {
  hero: [
    { key: "heading",    label: "כותרת ראשית",    type: "text",     placeholder: "ברוכים הבאים אל..." },
    { key: "subheading", label: "תת כותרת",        type: "textarea", placeholder: "תיאור קצר..." },
    { key: "cta_text",   label: 'טקסט כפתור CTA',  type: "text",     placeholder: "צרו קשר" },
    { key: "cta_link",   label: 'קישור כפתור',      type: "url",      placeholder: "https://..." },
    { key: "image_url",  label: "תמונת רקע (URL)",  type: "url",      placeholder: "https://..." },
  ],
  text: [
    { key: "heading", label: "כותרת",    type: "text",     placeholder: "..." },
    { key: "body",    label: "תוכן",     type: "textarea", placeholder: "הכנס טקסט כאן..." },
  ],
  image: [
    { key: "url",     label: "קישור תמונה", type: "url",  placeholder: "https://..." },
    { key: "alt",     label: "תיאור נגישות",type: "text", placeholder: "תיאור התמונה" },
    { key: "caption", label: "כיתוב",        type: "text", placeholder: "..." },
  ],
  gallery: [
    { key: "heading", label: "כותרת",       type: "text", placeholder: "הגלריה שלנו" },
    { key: "images",  label: "תמונות (URL, שורה אחת לכל תמונה)", type: "list", placeholder: "https://...\nhttps://..." },
  ],
  cta: [
    { key: "heading",  label: "כותרת",        type: "text",     placeholder: "מוכנים להתחיל?" },
    { key: "body",     label: "טקסט",          type: "textarea", placeholder: "..." },
    { key: "btn_text", label: "טקסט כפתור",    type: "text",     placeholder: "צרו קשר" },
    { key: "btn_link", label: "קישור כפתור",   type: "url",      placeholder: "https://..." },
  ],
  contact: [
    { key: "phone",   label: "טלפון",          type: "text", placeholder: "050-0000000" },
    { key: "email",   label: "אימייל",          type: "text", placeholder: "info@example.com" },
    { key: "address", label: "כתובת",           type: "text", placeholder: "רחוב, עיר" },
    { key: "whatsapp",label: "WhatsApp",         type: "text", placeholder: "972500000000" },
  ],
  services: [
    { key: "heading",  label: "כותרת",           type: "text",     placeholder: "השירותים שלנו" },
    { key: "services", label: "שירותים (שורה לכל שירות: שם|תיאור)", type: "list", placeholder: "עיצוב אתרים|אנחנו בונים...\nקידום אורגני|..." },
  ],
  faq: [
    { key: "heading", label: "כותרת",             type: "text", placeholder: "שאלות נפוצות" },
    { key: "items",   label: "שאלות ותשובות (שאלה|תשובה, שורה לכל זוג)", type: "list", placeholder: "מה המחיר?|המחיר מתחיל מ...\nכמה זמן לוקח?|..." },
  ],
  testimonials: [
    { key: "heading",      label: "כותרת",         type: "text", placeholder: "מה אומרים עלינו" },
    { key: "testimonials", label: "המלצות (שם|המלצה, שורה לכל המלצה)", type: "list", placeholder: "דנה כ.|שירות מעולה!\nיוסי ל.|ממליץ בחום" },
  ],
  video: [
    { key: "url",     label: "קישור וידאו (YouTube/Vimeo)", type: "url",      placeholder: "https://youtube.com/..." },
    { key: "caption", label: "כיתוב",                        type: "text",     placeholder: "..." },
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

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <label className="text-sm font-medium text-right block">{field.label}</label>
          {field.type === "textarea" || field.type === "list" ? (
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
