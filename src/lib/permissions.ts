/**
 * Client content-editing permissions.
 *
 * Stored in site_settings as key="client_permissions", value=ClientPermissions JSON.
 * The admin sets them per site; the client editor reads them and enforces UI restrictions.
 */

export type ClientPermissions = {
  // Content editing — per block type
  edit_text: boolean;          // hero, text, video, cta (text fields)
  edit_images: boolean;        // image, gallery blocks + image fields in hero
  edit_chatbot: boolean;       // chatbot block
  edit_contact: boolean;       // contact block
  edit_services: boolean;      // services block
  edit_faq: boolean;           // faq block
  edit_testimonials: boolean;  // testimonials block
  edit_cta: boolean;           // cta block

  // Site management
  reorder_blocks: boolean;     // move blocks up / down
  toggle_visibility: boolean;  // show / hide blocks
  publish_site: boolean;       // "פרסם אתר" button
  edit_settings: boolean;      // fonts, colors, logo in the Settings tab
};

// Which permission key controls each block type
export const BLOCK_PERMISSION: Record<string, keyof ClientPermissions> = {
  hero:         "edit_text",
  text:         "edit_text",
  video:        "edit_text",
  image:        "edit_images",
  gallery:      "edit_images",
  chatbot:      "edit_chatbot",
  contact:      "edit_contact",
  services:     "edit_services",
  faq:          "edit_faq",
  testimonials: "edit_testimonials",
  cta:          "edit_cta",
};

// Full access — used for admin preview or when no permissions are set
export const FULL_PERMISSIONS: ClientPermissions = {
  edit_text: true,
  edit_images: true,
  edit_chatbot: true,
  edit_contact: true,
  edit_services: true,
  edit_faq: true,
  edit_testimonials: true,
  edit_cta: true,
  reorder_blocks: true,
  toggle_visibility: true,
  publish_site: true,
  edit_settings: true,
};

// ── Presets ──────────────────────────────────────────────────────────────────

export type PresetKey = "maintenance" | "standard" | "full";

export type Preset = {
  key: PresetKey;
  label: string;
  description: string;
  badge: string;    // short label for the badge
  color: "blue" | "purple" | "green";
  permissions: ClientPermissions;
};

export const PERMISSION_PRESETS: Preset[] = [
  {
    key: "maintenance",
    label: "תחזוקה",
    description: "לקוח ששילם תחזוקה חודשית — עריכה מינימלית בלבד",
    badge: "תחזוקה",
    color: "blue",
    permissions: {
      edit_text: true,
      edit_images: false,
      edit_chatbot: false,
      edit_contact: true,
      edit_services: false,
      edit_faq: false,
      edit_testimonials: false,
      edit_cta: false,
      reorder_blocks: false,
      toggle_visibility: false,
      publish_site: false,      // admin publishes after review
      edit_settings: false,
    },
  },
  {
    key: "standard",
    label: "סטנדרטי",
    description: "לקוח עם חבילת עריכה בסיסית — עריכת תוכן ופרסום עצמאי",
    badge: "סטנדרטי",
    color: "purple",
    permissions: {
      edit_text: true,
      edit_images: true,
      edit_chatbot: true,
      edit_contact: true,
      edit_services: true,
      edit_faq: true,
      edit_testimonials: true,
      edit_cta: true,
      reorder_blocks: false,
      toggle_visibility: false,
      publish_site: true,
      edit_settings: false,
    },
  },
  {
    key: "full",
    label: "מורחב",
    description: "לקוח ששילם על ממשק עריכה מורחב — שליטה מלאה",
    badge: "מורחב",
    color: "green",
    permissions: {
      edit_text: true,
      edit_images: true,
      edit_chatbot: true,
      edit_contact: true,
      edit_services: true,
      edit_faq: true,
      edit_testimonials: true,
      edit_cta: true,
      reorder_blocks: true,
      toggle_visibility: true,
      publish_site: true,
      edit_settings: true,
    },
  },
];

// Grouped labels for the checklist UI
export type PermissionGroup = {
  label: string;
  items: { key: keyof ClientPermissions; label: string; hint?: string }[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: "עריכת תוכן",
    items: [
      { key: "edit_text",         label: "טקסטים",        hint: "כותרות, גוף טקסט, CTA, וידאו" },
      { key: "edit_images",       label: "תמונות",         hint: "העלאת תמונות, גלריה" },
      { key: "edit_contact",      label: "פרטי קשר",       hint: "טלפון, מייל, כתובת, WhatsApp" },
      { key: "edit_services",     label: "שירותים",        hint: "רשימת שירותים ותיאורים" },
      { key: "edit_faq",          label: "שאלות נפוצות",   hint: "שאלות ותשובות" },
      { key: "edit_testimonials", label: "המלצות",          hint: "ציטוטים ושמות לקוחות" },
      { key: "edit_cta",          label: "כפתורי CTA",      hint: "כותרת, טקסט, קישור" },
      { key: "edit_chatbot",      label: "צ׳אטבוט",         hint: "הודעות, שאלות ותשובות, כפתורים" },
    ],
  },
  {
    label: "ניהול האתר",
    items: [
      { key: "publish_site",      label: "פרסום עצמאי",    hint: "הלקוח לוחץ 'פרסם אתר' בעצמו" },
      { key: "reorder_blocks",    label: "שינוי סדר בלוקים", hint: "חצים למעלה/למטה" },
      { key: "toggle_visibility", label: "הסתרת/הצגת בלוקים", hint: "כפתור עין על כל בלוק" },
      { key: "edit_settings",     label: "הגדרות אתר",      hint: "צבעים, פונטים, לוגו" },
    ],
  },
];
