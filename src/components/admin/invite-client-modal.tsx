"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Check, Mail, User, Building2, Phone, Globe, Send } from "lucide-react";

type Site = {
  id: string;
  name: string;
  domain: string | null;
  owner_id: string | null;
};

type Props = {
  sites: Site[];
};

export function InviteClientModal({ sites }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    company: "",
    phone: "",
    site_id: "",
  });

  const unlinkedSites = sites.filter((s) => !s.owner_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/invite-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          full_name: form.full_name.trim(),
          company: form.company.trim() || null,
          phone: form.phone.trim() || null,
          site_id: form.site_id || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה לא ידועה");

      setSuccess(data.message);
      setForm({ full_name: "", email: "", company: "", phone: "", site_id: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSuccess(null);
    setError(null);
  };

  return (
    <>
      <Button className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        הזמן לקוח
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">הזמן לקוח חדש</h2>
                  <p className="text-sm text-muted-foreground">הלקוח יקבל מייל עם קישור כניסה</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClose}>✕</Button>
            </div>

            {/* Body */}
            <div className="p-6">
              {success ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-base">ההזמנה נשלחה!</p>
                    <p className="text-sm text-muted-foreground mt-1">{success}</p>
                  </div>
                  <Button onClick={handleClose} className="mt-2">סגור</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      שם מלא <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                      placeholder="ישראל ישראלי"
                      required
                      dir="auto"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      אימייל <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="client@example.com"
                      required
                      dir="ltr"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Company + Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        חברה
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                        placeholder="שם חברה"
                        dir="auto"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        טלפון
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="050-0000000"
                        dir="ltr"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  {/* Site */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      חבר לאתר
                    </label>
                    <select
                      value={form.site_id}
                      onChange={(e) => setForm((p) => ({ ...p, site_id: e.target.value }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">— ללא אתר בשלב זה —</option>
                      {unlinkedSites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}{site.domain ? ` (${site.domain})` : ""}
                        </option>
                      ))}
                    </select>
                    {unlinkedSites.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        כל האתרים כבר מחוברים ללקוח. צור אתר חדש קודם.
                      </p>
                    )}
                  </div>

                  {/* Info box */}
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 space-y-1">
                    <p className="font-medium">מה יקרה אחרי שליחה?</p>
                    <p>• Supabase ישלח ללקוח מייל הזמנה עם קישור</p>
                    <p>• הלקוח יגדיר סיסמה וייכנס לפאנל שלו</p>
                    <p>• הלקוח יראה <strong>רק</strong> את האתר שחיברת</p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                      ביטול
                    </Button>
                    <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {loading ? "שולח..." : "שלח הזמנה"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
