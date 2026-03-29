import type { BlockType } from "@/types/database";

export interface SiteTemplateBlock {
  block_type: BlockType;
  label: string;
  content: Record<string, unknown>;
  order_index: number;
}

export interface SiteTemplatePage {
  slug: string;
  title: string;
  meta_title?: string;
  meta_desc?: string;
  order_index: number;
  blocks: SiteTemplateBlock[];
}

export interface SiteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  pages: SiteTemplatePage[];
}

export const SITE_TEMPLATES: SiteTemplate[] = [
  /* ──────────── מסעדה / Restaurant ──────────── */
  {
    id: "restaurant",
    name: "מסעדה / קפה",
    description: "אתר מקצועי למסעדה או בית קפה עם תפריט, גלריה ויצירת קשר",
    category: "עסקים",
    icon: "🍽️",
    color: "from-orange-500 to-red-500",
    pages: [
      {
        slug: "home",
        title: "ראשי",
        meta_title: "ברוכים הבאים למסעדה שלנו",
        meta_desc: "חוויה קולינרית ייחודית",
        order_index: 0,
        blocks: [
          {
            block_type: "hero",
            label: "Hero ראשי",
            content: {
              title: "ברוכים הבאים אל {{שם המסעדה}}",
              subtitle: "חוויה קולינרית ייחודית — טעמים אותנטיים, אווירה חמה",
              cta_text: "לתפריט שלנו",
              cta_link: "/menu",
              bg_overlay: 0.5,
            },
            order_index: 0,
          },
          {
            block_type: "text",
            label: "אודות",
            content: {
              heading: "הסיפור שלנו",
              body: "מאז {{שנת הקמה}}, אנו מגישים מנות מסורתיות עם טוויסט מודרני. השף שלנו משתמש רק בחומרי גלם טריים מהשוק המקומי.",
              align: "center",
            },
            order_index: 1,
          },
          {
            block_type: "services",
            label: "שירותים",
            content: {
              heading: "מה אנו מציעים",
              items: [
                { icon: "🍴", title: "ארוחות מקומיות", desc: "תפריט עשיר ומגוון לכל שעות היום" },
                { icon: "🥂", title: "אירועים פרטיים", desc: "אולם לאירועים עד 120 איש" },
                { icon: "🚗", title: "משלוחים", desc: "משלוח מהיר לאזור המרכז" },
              ],
            },
            order_index: 2,
          },
          {
            block_type: "gallery",
            label: "גלריה",
            content: {
              heading: "מהמטבח שלנו",
              images: [],
            },
            order_index: 3,
          },
          {
            block_type: "testimonials",
            label: "ביקורות",
            content: {
              heading: "מה אומרים עלינו",
              items: [
                { name: "דנה כ.", rating: 5, text: "אוכל מדהים ואווירה נעימה! נחזור בוודאי." },
                { name: "רון מ.", rating: 5, text: "השף עשה פלאים. כל מנה היתה חוויה." },
              ],
            },
            order_index: 4,
          },
          {
            block_type: "contact",
            label: "יצירת קשר",
            content: {
              heading: "הגיעו אלינו",
              address: "{{כתובת}}",
              phone: "{{טלפון}}",
              email: "{{אימייל}}",
              hours: "א׳-ה׳: 12:00-23:00 | ו׳: 12:00-00:00 | ש׳: 13:00-23:00",
            },
            order_index: 5,
          },
        ],
      },
      {
        slug: "menu",
        title: "תפריט",
        meta_title: "התפריט שלנו",
        order_index: 1,
        blocks: [
          {
            block_type: "hero",
            label: "כותרת תפריט",
            content: { title: "התפריט שלנו", subtitle: "כל המנות מוכנות טרי מדי יום" },
            order_index: 0,
          },
          {
            block_type: "text",
            label: "תפריט PDF / קישור",
            content: {
              heading: "ראו את התפריט המלא",
              body: "לחצו על הכפתור להצגת התפריט המלא שלנו.",
              cta_text: "הורידו תפריט",
              cta_link: "/menu.pdf",
            },
            order_index: 1,
          },
        ],
      },
    ],
  },

  /* ──────────── משרד עורכי דין / Law Firm ──────────── */
  {
    id: "law-firm",
    name: "משרד עורכי דין",
    description: "אתר מקצועי ואמין למשרד עורכי דין עם תחומי עיסוק וייעוץ מקוון",
    category: "מקצועי",
    icon: "⚖️",
    color: "from-slate-700 to-slate-900",
    pages: [
      {
        slug: "home",
        title: "ראשי",
        meta_title: "{{שם המשרד}} — עורכי דין",
        meta_desc: "ייעוץ משפטי מקצועי ואמין",
        order_index: 0,
        blocks: [
          {
            block_type: "hero",
            label: "Hero",
            content: {
              title: "{{שם המשרד}}",
              subtitle: "ניסיון של שנים, מחויבות ללקוח. מייצגים אתכם בכל שלב.",
              cta_text: "לייעוץ ראשוני חינם",
              cta_link: "/contact",
            },
            order_index: 0,
          },
          {
            block_type: "services",
            label: "תחומי עיסוק",
            content: {
              heading: "תחומי עיסוק",
              items: [
                { icon: "🏢", title: "דיני חברות", desc: "הקמה, ניהול ומיזוגים של חברות ועסקים" },
                { icon: "🏠", title: "נדל\"ן", desc: "עסקאות מקרקעין, חוזים ורישום" },
                { icon: "👨‍👩‍👧", title: "דיני משפחה", desc: "גירושין, ירושה ואפוטרופסות" },
                { icon: "⚖️", title: "ליטיגציה", desc: "ייצוג בבתי משפט בכל הערכאות" },
              ],
            },
            order_index: 1,
          },
          {
            block_type: "text",
            label: "אודות המשרד",
            content: {
              heading: "למה לבחור בנו?",
              body: "משרדנו מתמחה במתן פתרונות משפטיים מקצועיים עם דגש על שירות אישי. צוות עורכי הדין שלנו בעל ניסיון רב בתחומים מגוונים ומחויב להשגת התוצאות הטובות ביותר עבור לקוחותינו.",
            },
            order_index: 2,
          },
          {
            block_type: "testimonials",
            label: "לקוחות ממליצים",
            content: {
              heading: "לקוחות ממליצים",
              items: [
                { name: "יוסי א.", text: "טיפול מקצועי ויסודי. ממליץ בחום!" },
                { name: "שרה ל.", text: "עורכי הדין היו זמינים ועזרו לנו בכל שלב." },
              ],
            },
            order_index: 3,
          },
          {
            block_type: "contact",
            label: "יצירת קשר",
            content: {
              heading: "צרו קשר לייעוץ ראשוני חינם",
              phone: "{{טלפון}}",
              email: "{{אימייל}}",
              address: "{{כתובת}}",
            },
            order_index: 4,
          },
        ],
      },
      {
        slug: "about",
        title: "אודות",
        order_index: 1,
        blocks: [
          { block_type: "text", label: "אודות המשרד", content: { heading: "אודות {{שם המשרד}}", body: "פסקה המתארת את המשרד, ההיסטוריה והערכים." }, order_index: 0 },
        ],
      },
    ],
  },

  /* ──────────── נדל"ן / Real Estate ──────────── */
  {
    id: "real-estate",
    name: "נדל\"ן",
    description: "אתר לסוכנות נדל\"ן עם גלריית נכסים, חיפוש ויצירת קשר",
    category: "עסקים",
    icon: "🏡",
    color: "from-green-600 to-teal-600",
    pages: [
      {
        slug: "home",
        title: "ראשי",
        meta_title: "{{שם הסוכנות}} — נדל\"ן",
        meta_desc: "נכסים למכירה ולהשכרה",
        order_index: 0,
        blocks: [
          {
            block_type: "hero",
            label: "Hero",
            content: {
              title: "מצאו את הבית המושלם שלכם",
              subtitle: "{{שם הסוכנות}} — מעל {{מספר}} נכסים זמינים",
              cta_text: "חפשו נכסים",
              cta_link: "/properties",
            },
            order_index: 0,
          },
          {
            block_type: "services",
            label: "שירותים",
            content: {
              heading: "השירותים שלנו",
              items: [
                { icon: "🏠", title: "מכירה", desc: "ליווי מקצועי במכירת הנכס שלכם" },
                { icon: "🔑", title: "השכרה", desc: "נכסים להשכרה לטווח קצר וארוך" },
                { icon: "📊", title: "הערכת שווי", desc: "הערכת שווי חינם לנכס שלכם" },
              ],
            },
            order_index: 1,
          },
          {
            block_type: "gallery",
            label: "נכסים נבחרים",
            content: { heading: "נכסים נבחרים", images: [] },
            order_index: 2,
          },
          {
            block_type: "testimonials",
            label: "לקוחות מספרים",
            content: {
              heading: "לקוחות מספרים",
              items: [
                { name: "משה כ.", text: "מצאנו את דירת החלומות שלנו תוך שבועיים!" },
                { name: "אורית ש.", text: "מקצועיות ושירות ברמה גבוהה." },
              ],
            },
            order_index: 3,
          },
          {
            block_type: "contact",
            label: "צרו קשר",
            content: {
              heading: "השאירו פרטים ונחזור אליכם",
              phone: "{{טלפון}}",
              email: "{{אימייל}}",
            },
            order_index: 4,
          },
        ],
      },
      {
        slug: "properties",
        title: "נכסים",
        order_index: 1,
        blocks: [
          { block_type: "text", label: "כותרת", content: { heading: "כל הנכסים הזמינים", body: "עדכון שוטף של הנכסים הזמינים למכירה ולהשכרה." }, order_index: 0 },
          { block_type: "gallery", label: "גלריית נכסים", content: { heading: "", images: [] }, order_index: 1 },
        ],
      },
    ],
  },

  /* ──────────── פורטפוליו / Portfolio ──────────── */
  {
    id: "portfolio",
    name: "פורטפוליו / פרילנסר",
    description: "אתר אישי לפרילנסר, מעצב, מתכנת או יוצר תוכן",
    category: "יצירתי",
    icon: "🎨",
    color: "from-purple-600 to-pink-600",
    pages: [
      {
        slug: "home",
        title: "ראשי",
        meta_title: "{{שם}} — {{תפקיד}}",
        meta_desc: "פורטפוליו עבודות ויצירת קשר",
        order_index: 0,
        blocks: [
          {
            block_type: "hero",
            label: "Hero אישי",
            content: {
              title: "היי, אני {{שם}} 👋",
              subtitle: "{{תפקיד}} — {{תחום התמחות}}. יוצר חוויות דיגיטליות ייחודיות.",
              cta_text: "ראו את העבודות שלי",
              cta_link: "/portfolio",
            },
            order_index: 0,
          },
          {
            block_type: "services",
            label: "מה אני עושה",
            content: {
              heading: "מה אני עושה",
              items: [
                { icon: "💻", title: "{{שירות 1}}", desc: "{{תיאור}}" },
                { icon: "🎯", title: "{{שירות 2}}", desc: "{{תיאור}}" },
                { icon: "📱", title: "{{שירות 3}}", desc: "{{תיאור}}" },
              ],
            },
            order_index: 1,
          },
          {
            block_type: "gallery",
            label: "עבודות נבחרות",
            content: { heading: "עבודות נבחרות", images: [] },
            order_index: 2,
          },
          {
            block_type: "testimonials",
            label: "לקוחות אומרים",
            content: {
              heading: "מה אומרים עלי",
              items: [
                { name: "{{לקוח}}", text: "{{המלצה}}" },
              ],
            },
            order_index: 3,
          },
          {
            block_type: "contact",
            label: "נדברים?",
            content: {
              heading: "נדברים?",
              email: "{{אימייל}}",
              body: "אשמח לשמוע על הפרויקט שלכם!",
            },
            order_index: 4,
          },
        ],
      },
      {
        slug: "portfolio",
        title: "עבודות",
        order_index: 1,
        blocks: [
          { block_type: "gallery", label: "כל העבודות", content: { heading: "כל העבודות", images: [] }, order_index: 0 },
        ],
      },
    ],
  },

  /* ──────────── עמוד נחיתה / Landing Page ──────────── */
  {
    id: "landing",
    name: "עמוד נחיתה",
    description: "עמוד נחיתה ממיר עם CTA ברור לקמפיינים פרסומיים",
    category: "שיווק",
    icon: "🚀",
    color: "from-blue-600 to-indigo-600",
    pages: [
      {
        slug: "home",
        title: "ראשי",
        meta_title: "{{שם המוצר/שירות}}",
        meta_desc: "{{הבטחת ערך}}}",
        order_index: 0,
        blocks: [
          {
            block_type: "hero",
            label: "Hero ראשי",
            content: {
              title: "{{כותרת ראשית — הבטחת ערך ברורה}}",
              subtitle: "{{כותרת משנה — פירוט הפתרון והיתרון העיקרי}}",
              cta_text: "{{קריאה לפעולה — לחצו כאן}}",
              cta_link: "#contact",
              show_badge: true,
              badge_text: "✓ ללא התחייבות",
            },
            order_index: 0,
          },
          {
            block_type: "services",
            label: "יתרונות",
            content: {
              heading: "למה {{שם המוצר}}?",
              items: [
                { icon: "⚡", title: "מהיר", desc: "{{יתרון 1}}" },
                { icon: "💎", title: "איכותי", desc: "{{יתרון 2}}" },
                { icon: "💰", title: "משתלם", desc: "{{יתרון 3}}" },
              ],
            },
            order_index: 1,
          },
          {
            block_type: "testimonials",
            label: "המלצות",
            content: {
              heading: "מה אומרים הלקוחות",
              items: [
                { name: "{{לקוח}}", rating: 5, text: "{{המלצה}}" },
                { name: "{{לקוח}}", rating: 5, text: "{{המלצה}}" },
              ],
            },
            order_index: 2,
          },
          {
            block_type: "faq",
            label: "שאלות נפוצות",
            content: {
              heading: "שאלות נפוצות",
              items: [
                { q: "{{שאלה 1}}?", a: "{{תשובה 1}}" },
                { q: "{{שאלה 2}}?", a: "{{תשובה 2}}" },
                { q: "{{שאלה 3}}?", a: "{{תשובה 3}}" },
              ],
            },
            order_index: 3,
          },
          {
            block_type: "contact",
            label: "CTA סופי",
            content: {
              heading: "מוכנים להתחיל?",
              body: "השאירו פרטים ונחזור אליכם תוך 24 שעות",
              cta_text: "שלחו פרטים",
            },
            order_index: 4,
          },
        ],
      },
    ],
  },

  /* ──────────── עסק כללי / Business ──────────── */
  {
    id: "business",
    name: "עסק כללי",
    description: "אתר תדמית מקצועי לכל סוג עסק — חברה, מרפאה, מכון, סטודיו",
    category: "עסקים",
    icon: "🏢",
    color: "from-cyan-600 to-blue-700",
    pages: [
      {
        slug: "home",
        title: "ראשי",
        meta_title: "{{שם העסק}}",
        meta_desc: "{{תיאור קצר}}",
        order_index: 0,
        blocks: [
          {
            block_type: "hero",
            label: "Hero",
            content: {
              title: "ברוכים הבאים ל{{שם העסק}}",
              subtitle: "{{תיאור קצר ומושך של העסק}}",
              cta_text: "צרו קשר",
              cta_link: "#contact",
            },
            order_index: 0,
          },
          {
            block_type: "text",
            label: "אודות",
            content: {
              heading: "מי אנחנו",
              body: "{{פסקה המתארת את העסק, הניסיון, הערכים והייחודיות.}}",
            },
            order_index: 1,
          },
          {
            block_type: "services",
            label: "שירותים",
            content: {
              heading: "השירותים שלנו",
              items: [
                { icon: "✅", title: "{{שירות 1}}", desc: "{{תיאור}}" },
                { icon: "✅", title: "{{שירות 2}}", desc: "{{תיאור}}" },
                { icon: "✅", title: "{{שירות 3}}", desc: "{{תיאור}}" },
              ],
            },
            order_index: 2,
          },
          {
            block_type: "testimonials",
            label: "המלצות",
            content: {
              heading: "לקוחות ממליצים",
              items: [
                { name: "{{לקוח}}", text: "{{המלצה}}" },
              ],
            },
            order_index: 3,
          },
          {
            block_type: "contact",
            label: "צרו קשר",
            content: {
              heading: "צרו קשר",
              phone: "{{טלפון}}",
              email: "{{אימייל}}",
              address: "{{כתובת}}",
            },
            order_index: 4,
          },
        ],
      },
      {
        slug: "about",
        title: "אודות",
        order_index: 1,
        blocks: [
          { block_type: "text", label: "אודות", content: { heading: "אודות {{שם העסק}}", body: "{{פסקה מפורטת}}" }, order_index: 0 },
        ],
      },
      {
        slug: "contact",
        title: "צרו קשר",
        order_index: 2,
        blocks: [
          { block_type: "contact", label: "צרו קשר", content: { heading: "נשמח לשמוע מכם", phone: "{{טלפון}}", email: "{{אימייל}}" }, order_index: 0 },
        ],
      },
    ],
  },
];

export const SITE_TEMPLATE_CATEGORIES = [...new Set(SITE_TEMPLATES.map((t) => t.category))];
