"use client";

import * as React from "react";
import { Phone, Mail, MapPin, Clock, Star, ChevronDown, ChevronUp, Play } from "lucide-react";

/* ─── shared types ─── */
export interface BlockProps {
  content: Record<string, unknown>;
}

function str(v: unknown): string { return typeof v === "string" ? v : ""; }
function num(v: unknown, fallback = 0): number { return typeof v === "number" ? v : fallback; }
function arr<T>(v: unknown): T[] { return Array.isArray(v) ? v as T[] : []; }
function bool(v: unknown): boolean { return v === true; }

/* ────────────────── HERO ────────────────── */
export function HeroBlock({ content }: BlockProps) {
  const title    = str(content.title)    || "ברוכים הבאים";
  const subtitle = str(content.subtitle) || "";
  const ctaText  = str(content.cta_text) || "צרו קשר";
  const ctaLink  = str(content.cta_link) || "#contact";
  const badge    = str(content.badge_text);
  const showBadge = bool(content.show_badge) && badge;
  const overlay  = num(content.bg_overlay, 0.45);

  return (
    <section
      className="relative min-h-[80vh] flex items-center justify-center text-white overflow-hidden"
      style={{ background: `linear-gradient(135deg, #1e293b ${Math.round(overlay * 100)}%, #312e81)` }}
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-white/5" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center" dir="rtl">
        {showBadge && (
          <span className="inline-block mb-5 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            {badge}
          </span>
        )}
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed">{subtitle}</p>
        )}
        <a
          href={ctaLink}
          className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 font-semibold px-8 py-3.5 text-base shadow-lg hover:bg-indigo-50 transition-all hover:scale-105"
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}

/* ────────────────── TEXT ────────────────── */
export function TextBlock({ content }: BlockProps) {
  const heading = str(content.heading);
  const body    = str(content.body);
  const ctaText = str(content.cta_text);
  const ctaLink = str(content.cta_link);
  const align   = str(content.align) || "center";

  return (
    <section className="py-20 px-6 bg-white" dir="rtl">
      <div className={`max-w-3xl mx-auto ${align === "center" ? "text-center" : "text-right"}`}>
        {heading && (
          <h2 className="text-3xl font-bold text-slate-900 mb-5">{heading}</h2>
        )}
        {body && (
          <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">{body}</p>
        )}
        {ctaText && ctaLink && (
          <a
            href={ctaLink}
            className="mt-8 inline-block rounded-full bg-indigo-600 text-white font-semibold px-7 py-3 hover:bg-indigo-700 transition-colors"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

/* ────────────────── SERVICES ────────────────── */
interface ServiceItem { icon?: string; title?: string; desc?: string }

export function ServicesBlock({ content }: BlockProps) {
  const heading = str(content.heading) || "השירותים שלנו";
  const items   = arr<ServiceItem>(content.items);

  return (
    <section className="py-20 px-6 bg-slate-50" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">{heading}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-7 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              {item.icon && <div className="text-4xl mb-4">{item.icon}</div>}
              {item.title && <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>}
              {item.desc && <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────── GALLERY ────────────────── */
export function GalleryBlock({ content }: BlockProps) {
  const heading = str(content.heading) || "הגלריה שלנו";
  const images  = arr<string>(content.images);

  if (images.length === 0) {
    return (
      <section className="py-20 px-6 bg-white" dir="rtl">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">{heading}</h2>
          <p className="text-center text-slate-400 text-sm">תמונות יתווספו בקרוב</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-white" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">{heading}</h2>
        <div className="columns-2 sm:columns-3 gap-4 space-y-4">
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`gallery-${i + 1}`}
              className="w-full rounded-xl object-cover break-inside-avoid hover:opacity-90 transition-opacity"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────── TESTIMONIALS ────────────────── */
interface TestimonialItem { name?: string; text?: string; rating?: number }

export function TestimonialsBlock({ content }: BlockProps) {
  const heading = str(content.heading) || "לקוחות ממליצים";
  const items   = arr<TestimonialItem>(content.items);

  return (
    <section className="py-20 px-6 bg-indigo-950 text-white" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{heading}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-2xl bg-white/10 backdrop-blur-sm p-7 border border-white/10">
              {item.rating && item.rating > 0 && (
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: Math.min(5, item.rating) }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              )}
              {item.text && (
                <p className="text-white/85 text-sm leading-relaxed mb-4 italic">"{item.text}"</p>
              )}
              {item.name && (
                <p className="text-sm font-semibold text-indigo-300">— {item.name}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────── FAQ ────────────────── */
interface FaqItem { q?: string; a?: string }

export function FaqBlock({ content }: BlockProps) {
  const heading = str(content.heading) || "שאלות נפוצות";
  const items   = arr<FaqItem>(content.items);
  const [open, setOpen] = React.useState<number | null>(null);

  return (
    <section className="py-20 px-6 bg-slate-50" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">{heading}</h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <button
                type="button"
                className="flex w-full items-center justify-between px-6 py-4 text-right font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{item.q}</span>
                {open === i ? (
                  <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                )}
              </button>
              {open === i && item.a && (
                <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────── CONTACT ────────────────── */
export function ContactBlock({ content }: BlockProps) {
  const heading = str(content.heading) || "צרו קשר";
  const phone   = str(content.phone);
  const email   = str(content.email);
  const address = str(content.address);
  const hours   = str(content.hours);
  const body    = str(content.body);

  return (
    <section className="py-20 px-6 bg-white" id="contact" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">{heading}</h2>
        <div className="grid sm:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <div className="space-y-5">
            {body && <p className="text-slate-600 leading-relaxed">{body}</p>}
            {phone && (
              <a href={`tel:${phone}`} className="flex items-center gap-3 text-slate-700 hover:text-indigo-600 transition-colors group">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                  <Phone className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="font-medium" dir="ltr">{phone}</span>
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-3 text-slate-700 hover:text-indigo-600 transition-colors group">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                  <Mail className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="font-medium">{email}</span>
              </a>
            )}
            {address && (
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                </div>
                <span>{address}</span>
              </div>
            )}
            {hours && (
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                  <Clock className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-sm">{hours}</span>
              </div>
            )}
          </div>

          {/* Form */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [sent, setSent] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handled by ChatWidget / WhatsApp in full integration
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-semibold text-green-800">הפנייה נשלחה בהצלחה!</p>
        <p className="text-green-600 text-sm mt-1">נחזור אליכם בהקדם</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-7 space-y-4">
      <input
        type="text"
        placeholder="שם מלא *"
        required
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none transition-colors"
        dir="rtl"
      />
      <input
        type="tel"
        placeholder="מספר טלפון *"
        required
        value={form.phone}
        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none transition-colors"
        dir="rtl"
      />
      <textarea
        placeholder="כיצד נוכל לעזור?"
        rows={4}
        value={form.message}
        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none transition-colors resize-none"
        dir="rtl"
      />
      <button
        type="submit"
        className="w-full rounded-xl bg-indigo-600 text-white font-semibold py-3 hover:bg-indigo-700 transition-colors"
      >
        שלח פנייה
      </button>
    </form>
  );
}

/* ────────────────── CTA ────────────────── */
export function CtaBlock({ content }: BlockProps) {
  const heading = str(content.heading) || "מוכנים להתחיל?";
  const body    = str(content.body);
  const ctaText = str(content.cta_text) || "צרו קשר עכשיו";
  const ctaLink = str(content.cta_link) || "#contact";

  return (
    <section className="py-20 px-6 bg-indigo-600 text-white text-center" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">{heading}</h2>
        {body && <p className="text-indigo-200 mb-8 text-lg">{body}</p>}
        <a
          href={ctaLink}
          className="inline-block rounded-full bg-white text-indigo-700 font-bold px-9 py-4 text-base shadow-lg hover:bg-indigo-50 transition-all hover:scale-105"
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}

/* ────────────────── IMAGE ────────────────── */
export function ImageBlock({ content }: BlockProps) {
  const src     = str(content.src);
  const caption = str(content.caption);
  const alt     = str(content.alt) || "תמונה";

  if (!src) return null;

  return (
    <section className="py-16 px-6 bg-white" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full rounded-2xl shadow-md object-cover max-h-[60vh]" />
        {caption && <p className="text-center text-slate-400 text-sm mt-3">{caption}</p>}
      </div>
    </section>
  );
}

/* ────────────────── VIDEO ────────────────── */
export function VideoBlock({ content }: BlockProps) {
  const url     = str(content.url);
  const heading = str(content.heading);

  // Convert YouTube URL to embed URL
  const embedUrl = url
    .replace("watch?v=", "embed/")
    .replace("youtu.be/", "www.youtube.com/embed/");

  return (
    <section className="py-16 px-6 bg-slate-50" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {heading && <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">{heading}</h2>}
        {url ? (
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video rounded-2xl bg-slate-200 flex items-center justify-center">
            <Play className="h-12 w-12 text-slate-400" />
          </div>
        )}
      </div>
    </section>
  );
}

/* ────────────────── BLOCK ROUTER ────────────────── */
export function SiteBlock({ block_type, content }: { block_type: string; content: Record<string, unknown> }) {
  const props = { content };
  switch (block_type) {
    case "hero":         return <HeroBlock         {...props} />;
    case "text":         return <TextBlock         {...props} />;
    case "services":     return <ServicesBlock     {...props} />;
    case "gallery":      return <GalleryBlock      {...props} />;
    case "testimonials": return <TestimonialsBlock {...props} />;
    case "faq":          return <FaqBlock          {...props} />;
    case "contact":      return <ContactBlock      {...props} />;
    case "cta":          return <CtaBlock          {...props} />;
    case "image":        return <ImageBlock        {...props} />;
    case "video":        return <VideoBlock        {...props} />;
    default:             return null;
  }
}
