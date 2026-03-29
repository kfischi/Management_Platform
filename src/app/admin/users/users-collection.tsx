"use client";

import * as React from "react";
import {
  Users, Shield, UserCheck, Edit3, Mail, Building2,
  Calendar, Hash, User, Phone, Globe, UserPlus, Loader2, X,
} from "lucide-react";
import { CollectionView, ColDef, BulkAction } from "@/components/admin/collection-view";
import { RecordPanel, FieldDef, ActivityEntry } from "@/components/admin/record-panel";
import { useToast } from "@/components/admin/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

/* ─────────── types ─────────── */

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: "admin" | "client" | "editor";
  company: string | null;
  phone: string | null;
  website: string | null;
  created_at: string;
}

/* ─────────── helpers ─────────── */

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" });
}

function initials(name: string | null, email: string) {
  if (name) return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

/* ─────────── role config ─────────── */

const ROLE_CFG = {
  admin:  { label: "Admin",  color: "bg-purple-600 text-white", bg: "bg-purple-50 border-purple-200 text-purple-700",  icon: Shield },
  client: { label: "Client", color: "bg-blue-600 text-white",   bg: "bg-blue-50 border-blue-200 text-blue-700",        icon: UserCheck },
  editor: { label: "Editor", color: "bg-slate-600 text-white",  bg: "bg-slate-100 border-slate-200 text-slate-700",    icon: Edit3 },
};

function RoleBadge({ role }: { role: string }) {
  const c = ROLE_CFG[role as keyof typeof ROLE_CFG] ?? ROLE_CFG.client;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${c.bg}`}>
      {c.label}
    </span>
  );
}

/* ─────────── mock data ─────────── */

const MOCK: Profile[] = [
  { id: "u1",  full_name: "יוני פישר",     email: "yoni@example.com",    avatar_url: null, role: "admin",  company: "Agency Pro",         phone: "050-1234567", website: "https://agencypro.co.il", created_at: "2023-01-01T10:00:00Z" },
  { id: "u2",  full_name: "ישראל ישראלי",  email: "israel@techsol.co.il", avatar_url: null, role: "client", company: "טק סולושנס",          phone: "052-2345678", website: "https://techsol.co.il",   created_at: "2024-01-05T10:00:00Z" },
  { id: "u3",  full_name: "שרה כהן",        email: "sara@cohen-mkt.com",  avatar_url: null, role: "client", company: "כהן מרקטינג",        phone: "054-3456789", website: null,                      created_at: "2024-03-01T09:00:00Z" },
  { id: "u4",  full_name: "דוד לוי",        email: "david@levy-re.co.il", avatar_url: null, role: "client", company: "לוי נדל״ן",           phone: "053-4567890", website: "https://levy-re.co.il",   created_at: "2024-12-15T11:00:00Z" },
  { id: "u5",  full_name: "יוסי מנחם",     email: "yossi@menachem.io",   avatar_url: null, role: "client", company: "מנחם פינטק",          phone: "058-5678901", website: null,                      created_at: "2024-12-20T14:00:00Z" },
  { id: "u6",  full_name: "מיכל ברק",      email: "michal@barak.studio", avatar_url: null, role: "editor", company: null,                  phone: "050-6789012", website: null,                      created_at: "2025-01-10T12:00:00Z" },
  { id: "u7",  full_name: "אבי שפירא",     email: "avi@shapira-log.com", avatar_url: null, role: "client", company: "שפירא לוגיסטיקס",    phone: "052-7890123", website: "https://shapira.co.il",   created_at: "2023-09-01T08:00:00Z" },
  { id: "u8",  full_name: "רוני גולן",     email: "roni@golan.dev",      avatar_url: null, role: "editor", company: null,                  phone: null,          website: "https://ronigolan.dev",   created_at: "2025-02-15T10:00:00Z" },
  { id: "u9",  full_name: "מרים חסן",      email: "miriam@hassan.agro",  avatar_url: null, role: "client", company: "חסן אגרו",             phone: "054-8901234", website: null,                      created_at: "2024-05-20T13:00:00Z" },
  { id: "u10", full_name: "גיל אורן",      email: "gil@oren-tech.co.il", avatar_url: null, role: "client", company: "אורן טכנולוגיות",    phone: "058-9012345", website: "https://oren.tech",       created_at: "2025-02-10T10:00:00Z" },
];

const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: "a1", action: "התחבר למערכת",          user: "מערכת", timestamp: "לפני שעתיים" },
  { id: "a2", action: "שינה תפקיד ל-client",    user: "אדמין", timestamp: "לפני 3 ימים" },
  { id: "a3", action: "הצטרף למערכת",           user: "מערכת", timestamp: "5 ינואר 2024" },
];

/* ─────────── columns ─────────── */

const COLUMNS: ColDef<Profile>[] = [
  {
    key: "full_name",
    title: "משתמש",
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={row.avatar_url ?? undefined} />
          <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
            {initials(row.full_name, row.email)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-slate-800">{row.full_name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "company",
    title: "חברה",
    sortable: true,
    render: (value) => (
      <span className="text-sm text-slate-600">{String(value ?? "—")}</span>
    ),
  },
  {
    key: "role",
    title: "תפקיד",
    sortable: true,
    render: (value) => <RoleBadge role={String(value)} />,
  },
  {
    key: "created_at",
    title: "הצטרף",
    sortable: true,
    render: (value) => (
      <span className="text-xs text-muted-foreground">{fmtDate(String(value))}</span>
    ),
  },
];

/* ─────────── panel fields ─────────── */

const PANEL_FIELDS: FieldDef[] = [
  { key: "full_name", label: "שם מלא",     type: "text",     icon: <User className="h-3.5 w-3.5" />,     section: "פרופיל" },
  { key: "email",     label: "אימייל",      type: "text",     icon: <Mail className="h-3.5 w-3.5" />,     section: "פרופיל", readonly: true, copyable: true },
  { key: "phone",     label: "טלפון",       type: "text",     icon: <Phone className="h-3.5 w-3.5" />,    section: "פרופיל" },
  { key: "company",   label: "חברה",        type: "text",     icon: <Building2 className="h-3.5 w-3.5" />, section: "פרופיל" },
  { key: "website",   label: "אתר",         type: "url",      icon: <Globe className="h-3.5 w-3.5" />,    section: "פרופיל" },
  {
    key: "role",
    label: "תפקיד",
    type: "badge",
    section: "הרשאות",
    options: [
      { value: "admin",  label: "Admin",  color: "bg-purple-600 text-white" },
      { value: "client", label: "Client", color: "bg-blue-600 text-white" },
      { value: "editor", label: "Editor", color: "bg-slate-600 text-white" },
    ],
  },
  { key: "created_at", label: "תאריך הצטרפות", type: "readonly", icon: <Calendar className="h-3.5 w-3.5" />, section: "מטא-דאטה", readonly: true },
  { key: "id",         label: "מזהה",           type: "readonly", icon: <Hash className="h-3.5 w-3.5" />,    section: "מטא-דאטה", readonly: true, copyable: true },
];

/* ─────────── InviteModal ─────────── */

function InviteModal({ open, onClose, onInvited }: { open: boolean; onClose: () => void; onInvited: (p: Profile) => void }) {
  const [form, setForm] = React.useState({ email: "", full_name: "", company: "", phone: "" });
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const { success, error: toastErr } = useToast();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.full_name) { setErr("אימייל ושם מלא הם שדות חובה"); return; }
    setLoading(true); setErr(null);
    const res = await fetch("/api/admin/invite-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      const { profile } = await res.json();
      success("הזמנה נשלחה בהצלחה!");
      onInvited(profile as Profile);
      onClose();
      setForm({ email: "", full_name: "", company: "", phone: "" });
    } else {
      const { error } = await res.json();
      setErr(error ?? "שגיאה בשליחת הזמנה"); toastErr("שגיאה");
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md rounded-2xl border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">הזמן לקוח חדש</h3>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">{err}</p>}
          {[
            { key: "email" as const,     label: "אימייל *",  placeholder: "client@example.com", type: "email" },
            { key: "full_name" as const, label: "שם מלא *",  placeholder: "ישראל ישראלי",       type: "text"  },
            { key: "company" as const,   label: "חברה",       placeholder: "שם החברה",           type: "text"  },
            { key: "phone" as const,     label: "טלפון",      placeholder: "050-0000000",         type: "tel"   },
          ].map(f => (
            <div key={f.key} className="space-y-1">
              <label className="text-xs font-medium text-slate-600">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={set(f.key)}
                placeholder={f.placeholder}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">הלקוח יקבל אימייל הזמנה עם קישור להגדרת סיסמה.</p>
          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1 gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              שלח הזמנה
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>ביטול</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────── component ─────────── */

export function UsersCollection({ initialData }: { initialData: Profile[] }) {
  const data = initialData.length > 0 ? initialData : MOCK;
  const [users, setUsers] = React.useState<Profile[]>(data);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Profile | null>(null);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const { success } = useToast();

  /* Role stats */
  const roleCounts = React.useMemo(() => ({
    admin:  users.filter((u) => u.role === "admin").length,
    client: users.filter((u) => u.role === "client").length,
    editor: users.filter((u) => u.role === "editor").length,
  }), [users]);

  async function handleSave(updated: Record<string, unknown>) {
    setUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? { ...u, ...(updated as Partial<Profile>) } : u))
    );
    await fetch(`/api/admin/users/${updated.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    success("הפרופיל עודכן");
    setPanelOpen(false);
    setSelected(null);
  }

  const bulkActions: BulkAction[] = [
    {
      label: "שנה תפקיד ל-Client",
      onClick: async (ids) => {
        setUsers((prev) =>
          prev.map((u) => ids.includes(u.id) ? { ...u, role: "client" as const } : u)
        );
        await Promise.all(ids.map((id) => fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "client" }) })));
        success(`${ids.length} משתמשים עודכנו`);
      },
    },
    {
      label: "מחק",
      variant: "destructive",
      onClick: async (ids) => {
        setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));
        await Promise.all(ids.map((id) => fetch(`/api/admin/users/${id}`, { method: "DELETE" })));
        success(`נמחקו ${ids.length} משתמשים`);
      },
    },
  ];

  return (
    <>
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={(p) => setUsers(prev => [p, ...prev])}
      />

      {/* Role summary */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {(Object.entries(ROLE_CFG) as [string, typeof ROLE_CFG["admin"]][]).map(([role, cfg]) => {
          const Icon = cfg.icon;
          const count = roleCounts[role as keyof typeof roleCounts];
          return (
            <div key={role} className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm min-w-[140px]">
              <div className="rounded-lg p-2 bg-slate-100">
                <Icon className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800 tabular-nums">{count}</p>
                <p className="text-xs text-muted-foreground">{cfg.label}s</p>
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm min-w-[140px]">
          <div className="rounded-lg p-2 bg-indigo-50">
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-indigo-700 tabular-nums">{users.length}</p>
            <p className="text-xs text-muted-foreground">סה״כ</p>
          </div>
        </div>
      </div>

      <CollectionView
        title="משתמשים"
        subtitle={`${users.length} משתמשים רשומים`}
        data={users as unknown as Record<string, unknown>[]}
        columns={COLUMNS as unknown as ColDef<Record<string, unknown>>[]}
        keyField="id"
        onRowClick={(row) => { setSelected(row as unknown as Profile); setPanelOpen(true); }}
        onNew={() => setInviteOpen(true)}
        newLabel="הזמן לקוח"
        bulkActions={bulkActions}
        filterFields={[
          { key: "full_name", label: "שם" },
          { key: "role",      label: "תפקיד" },
          { key: "company",   label: "חברה" },
        ]}
        pageSize={10}
        emptyIcon={<Users className="h-10 w-10 opacity-20" />}
        emptyText="לא נמצאו משתמשים"
      />

      <RecordPanel
        open={panelOpen}
        onClose={() => { setPanelOpen(false); setSelected(null); }}
        title={selected?.full_name ?? selected?.email ?? "משתמש חדש"}
        subtitle={selected?.company ?? selected?.role}
        record={selected as unknown as Record<string, unknown>}
        fields={PANEL_FIELDS}
        onSave={handleSave}
        onDelete={async () => {
          if (selected) {
            setUsers((prev) => prev.filter((u) => u.id !== selected.id));
            await fetch(`/api/admin/users/${selected.id}`, { method: "DELETE" });
            success("המשתמש נמחק");
            setPanelOpen(false);
          }
        }}
        activityLog={selected ? MOCK_ACTIVITY : []}
      />
    </>
  );
}
