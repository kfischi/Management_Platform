"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Palette, Phone, Share2 } from "lucide-react";

type Props = {
  siteId: string;
  settings: Record<string, unknown>;
  onSave: (key: string, value: unknown) => Promise<void>;
};

type ContactSettings = {
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
};

type SocialSettings = {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
};

type ColorSettings = {
  primary?: string;
  secondary?: string;
  background?: string;
  text?: string;
};

export default function SettingsEditor({ settings, onSave }: Props) {
  const [contact, setContact] = useState<ContactSettings>(
    (settings.contact as ContactSettings) ?? {}
  );
  const [social, setSocial] = useState<SocialSettings>(
    (settings.social_links as SocialSettings) ?? {}
  );
  const [colors, setColors] = useState<ColorSettings>(
    (settings.colors as ColorSettings) ?? {
      primary: "#6366f1",
      secondary: "#a5b4fc",
      background: "#ffffff",
      text: "#111827",
    }
  );
  const [savingContact, setSavingContact] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [savingColors, setSavingColors] = useState(false);

  const handleSaveContact = async () => {
    setSavingContact(true);
    await onSave("contact", contact);
    setSavingContact(false);
  };

  const handleSaveSocial = async () => {
    setSavingSocial(true);
    await onSave("social_links", social);
    setSavingSocial(false);
  };

  const handleSaveColors = async () => {
    setSavingColors(true);
    await onSave("colors", colors);
    setSavingColors(false);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-lg font-semibold">הגדרות האתר</h2>
        <p className="text-sm text-muted-foreground">שינויים כאן ישפיעו על כל האתר לאחר פרסום.</p>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            פרטי יצירת קשר
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "phone",    label: "טלפון",    placeholder: "050-0000000" },
            { key: "email",    label: "אימייל",    placeholder: "info@example.com" },
            { key: "address",  label: "כתובת",     placeholder: "רחוב הרצל 1, תל אביב" },
            { key: "whatsapp", label: "WhatsApp",   placeholder: "972500000000 (ללא +)" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-sm font-medium block text-right">{label}</label>
              <input
                type="text"
                value={contact[key as keyof ContactSettings] ?? ""}
                onChange={(e) => setContact((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                dir="auto"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
          <Button onClick={handleSaveContact} disabled={savingContact} size="sm" className="gap-2 mt-1">
            {savingContact ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            שמור
          </Button>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            רשתות חברתיות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "facebook",  label: "Facebook",  placeholder: "https://facebook.com/..." },
            { key: "instagram", label: "Instagram",  placeholder: "https://instagram.com/..." },
            { key: "linkedin",  label: "LinkedIn",   placeholder: "https://linkedin.com/..." },
            { key: "twitter",   label: "X / Twitter",placeholder: "https://x.com/..." },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-sm font-medium block text-right">{label}</label>
              <input
                type="url"
                value={social[key as keyof SocialSettings] ?? ""}
                onChange={(e) => setSocial((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                dir="ltr"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
          <Button onClick={handleSaveSocial} disabled={savingSocial} size="sm" className="gap-2 mt-1">
            {savingSocial ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            שמור
          </Button>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            צבעי האתר
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "primary",    label: "צבע ראשי" },
            { key: "secondary",  label: "צבע משני" },
            { key: "background", label: "רקע" },
            { key: "text",       label: "טקסט" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors[key as keyof ColorSettings] ?? "#000000"}
                  onChange={(e) => setColors((p) => ({ ...p, [key]: e.target.value }))}
                  className="h-8 w-16 rounded cursor-pointer border border-input"
                />
                <input
                  type="text"
                  value={colors[key as keyof ColorSettings] ?? ""}
                  onChange={(e) => setColors((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-28 rounded-md border border-input bg-background px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  maxLength={7}
                />
              </div>
            </div>
          ))}
          <Button onClick={handleSaveColors} disabled={savingColors} size="sm" className="gap-2 mt-1">
            {savingColors ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            שמור
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
