"use client";

import * as React from "react";
import { Users, Building, Mail, Phone, Tag, Globe, FileText, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CollectionView, ColDef, BulkAction } from "@/components/admin/collection-view";
import { RecordPanel, FieldDef, ActivityEntry } from "@/components/admin/record-panel";

/* ───────────── types ───────────── */

export interface Client {
  id: string;
  contact_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: "active" | "inactive" | "lead";
  tags: string[] | null;
  created_at: string;
  updated_at?: string;
}

/* ───────────── status config ───────────── */

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  active:   { label: "פעיל",    className: "bg-green-50 text-green-700 border-green-200",  dot: "bg-green-500" },
  inactive: { label: "לא פעיל", className: "bg-slate-50 text-slate-600 border-slate-200",  dot: "bg-slate-400" },
  lead:     { label: "ליד",     className: "bg-blue-50 text-blue-700 border-blue-200",      dot: "bg-blue-500" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ───────────── columns ───────────── */

const COLUMNS: ColDef<Client>[] = [
  {
    key: "contact_name",
    title: "שם",
    sortable: true,
    render: (_, row) => (
      <div>
        <p className="text-sm font-medium text-slate-800">{row.contact_name}</p>
        {row.company_name && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Building className="h-3 w-3" />
            {row.company_name}
          </p>
        )}
      </div>
    ),
  },
  {
    key: "email",
    title: "אימייל",
    sortable: true,
    render: (_, row) => (
      <div className="space-y-0.5">
        <a
          href={`mailto:${row.email}`}
          className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Mail className="h-3 w-3" />
          {row.email}
        </a>
        {row.phone && (
          <a
            href={`tel:${row.phone}`}
            className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="h-3 w-3" />
            {row.phone}
          </a>
        )}
      </div>
    ),
  },
  {
    key: "status",
    title: "סטטוס",
    sortable: true,
    render: (value) => <StatusBadge status={String(value)} />,
  },
  {
    key: "tags",
    title: "תגיות",
    hidden: false,
    render: (value) => {
      const tags = Array.isArray(value) ? value : [];
      if (!tags.length) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((t: string) => (
            <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{t}</span>
          ))}
          {tags.length > 3 && (
            <span className="text-[11px] text-muted-foreground">+{tags.length - 3}</span>
          )}
        </div>
      );
    },
  },
  {
    key: "created_at",
    title: "נוסף",
    sortable: true,
    render: (value) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(String(value))}
      </span>
    ),
  },
];

/* ───────────── record panel fields ───────────── */

const PANEL_FIELDS: FieldDef[] = [
  { key: "contact_name", label: "שם איש קשר",  type: "text",     icon: <Users className="h-3.5 w-3.5" />,    section: "פרטי קשר" },
  { key: "company_name", label: "חברה",         type: "text",     icon: <Building className="h-3.5 w-3.5" />, section: "פרטי קשר" },
  { key: "email",        label: "אימייל",        type: "email",    icon: <Mail className="h-3.5 w-3.5" />,     section: "פרטי קשר", copyable: true },
  { key: "phone",        label: "טלפון",         type: "tel",      icon: <Phone className="h-3.5 w-3.5" />,    section: "פרטי קשר", copyable: true },
  { key: "address",      label: "כתובת",         type: "text",     icon: <Globe className="h-3.5 w-3.5" />,    section: "פרטי קשר" },
  {
    key: "status",
    label: "סטטוס",
    type: "badge",
    section: "מצב",
    options: [
      { value: "active",   label: "פעיל",    color: "bg-green-600 text-white" },
      { value: "lead",     label: "ליד",     color: "bg-blue-600 text-white" },
      { value: "inactive", label: "לא פעיל", color: "bg-slate-500 text-white" },
    ],
  },
  { key: "notes", label: "הערות", type: "textarea", icon: <FileText className="h-3.5 w-3.5" />, section: "מצב" },
  { key: "id",         label: "מזהה (ID)", type: "readonly", icon: <Hash className="h-3.5 w-3.5" />, section: "מטא-דאטה", copyable: true, readonly: true },
];

/* ───────────── mock data ───────────── */

const MOCK_CLIENTS: Client[] = [
  { id: "1", contact_name: "ישראל ישראלי", company_name: "טק סולושנס בע״מ", email: "israel@techsolutions.co.il", phone: "050-1234567", address: "תל אביב", notes: "לקוח VIP - מחדש חוזה כל שנה", status: "active", tags: ["VIP", "B2B", "פיתוח"], created_at: "2024-01-15T10:00:00Z", updated_at: "2025-03-10T14:30:00Z" },
  { id: "2", contact_name: "שרה כהן", company_name: "כהן מרקטינג", email: "sarah@cohenmarketing.com", phone: "052-9876543", address: "ירושלים", notes: "מתעניינת בחבילת SEO מורחבת", status: "lead", tags: ["SEO", "SMB"], created_at: "2024-02-20T09:00:00Z", updated_at: "2025-03-15T11:00:00Z" },
  { id: "3", contact_name: "דוד לוי", company_name: "לוי נדל״ן", email: "david@levirealestate.co.il", phone: "054-5551234", address: "חיפה", notes: "אתר נדל״ן עם מערכת ניהול נכסים", status: "active", tags: ["נדל״ן", "Enterprise"], created_at: "2023-11-05T08:00:00Z", updated_at: "2025-02-28T16:45:00Z" },
  { id: "4", contact_name: "מיכל אברהם", company_name: null, email: "michal@gmail.com", phone: "058-7778899", address: "רמת גן", notes: null, status: "inactive", tags: ["פרטי"], created_at: "2023-08-12T13:00:00Z", updated_at: "2024-06-01T09:00:00Z" },
  { id: "5", contact_name: "יוסי מנחם", company_name: "מנחם פינטק", email: "yossi@menchem-fintech.com", phone: "050-4443322", address: "הרצליה פיתוח", notes: "אינטגרציה עם מערכות פיננסיות", status: "active", tags: ["פינטק", "B2B", "VIP"], created_at: "2024-03-01T11:00:00Z", updated_at: "2025-03-20T10:15:00Z" },
  { id: "6", contact_name: "רחל גולד", company_name: "גולד קייטרינג", email: "rachel@goldcatering.co.il", phone: "053-2223344", address: "נתניה", notes: "אתר תדמית + מערכת הזמנות", status: "lead", tags: ["אוכל", "SMB"], created_at: "2025-01-18T14:00:00Z" },
  { id: "7", contact_name: "אבי שפירא", company_name: "שפירא לוגיסטיקס", email: "avi@shapira-logistics.com", phone: "052-6667788", address: "אשדוד", notes: "מערכת מעקב משלוחים בזמן אמת", status: "active", tags: ["לוגיסטיקה", "Enterprise", "B2B"], created_at: "2023-06-22T07:00:00Z", updated_at: "2025-03-01T09:00:00Z" },
  { id: "8", contact_name: "נועה בן-דוד", company_name: "בן-דוד סטודיו", email: "noa@bendavid-studio.com", phone: "054-1112233", address: "תל אביב", notes: null, status: "inactive", tags: ["עיצוב"], created_at: "2023-04-10T10:00:00Z", updated_at: "2024-01-15T12:00:00Z" },
  { id: "9", contact_name: "מרים חסן", company_name: "חסן אגרו", email: "miriam@hassan-agro.co.il", phone: "050-9990011", address: "באר שבע", notes: "פרויקט e-commerce חקלאות", status: "lead", tags: ["חקלאות", "e-commerce"], created_at: "2025-02-05T15:00:00Z" },
  { id: "10", contact_name: "גיל אורן", company_name: "אורן טכנולוגיות", email: "gil@oren-tech.com", phone: "058-4445566", address: "כפר סבא", notes: "שיפוץ מלא לאתר ישן", status: "active", tags: ["B2B", "Redesign"], created_at: "2024-07-30T09:30:00Z", updated_at: "2025-03-18T13:00:00Z" },
  { id: "11", contact_name: "שלי נגר", company_name: "נגר בוטיק", email: "shelly@nagar-boutique.com", phone: "052-3334455", address: "רחובות", notes: null, status: "active", tags: ["אופנה", "SMB"], created_at: "2024-09-12T11:00:00Z" },
  { id: "12", contact_name: "אריאל סמית", company_name: "סמית השקעות", email: "ariel@smith-investments.com", phone: "054-8889900", address: "תל אביב", notes: "מתעניין בניהול תיק דיגיטל", status: "lead", tags: ["פיננסים", "VIP"], created_at: "2025-03-10T08:00:00Z" },
];

const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: "1", action: "עדכן סטטוס ל-פעיל", user: "אדמין", timestamp: "לפני 2 ימים", detail: "status: lead → active" },
  { id: "2", action: "הוסיף הערה", user: "אדמין", timestamp: "לפני שבוע", detail: "לקוח VIP - מחדש חוזה כל שנה" },
  { id: "3", action: "יצר רשומה", user: "מערכת", timestamp: "ינואר 15, 2024" },
];

/* ───────────── main component ───────────── */

export function ClientsCollection({ initialData }: { initialData: Client[] }) {
  const data = initialData.length > 0 ? initialData : MOCK_CLIENTS;

  const [clients, setClients] = React.useState<Client[]>(data);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<Client | null>(null);

  function openRecord(row: Client) {
    setSelectedRecord(row);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setSelectedRecord(null);
  }

  async function handleSave(updated: Record<string, unknown>) {
    // Optimistic update
    setClients((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...(updated as Partial<Client>) } : c))
    );
    // TODO: await supabase.from("clients").update(updated).eq("id", updated.id)
    closePanel();
  }

  const bulkActions: BulkAction[] = [
    {
      label: "שנה סטטוס",
      onClick: (ids) => {
        // TODO: open status picker dialog
        console.log("bulk status change for", ids);
      },
    },
    {
      label: "מחק",
      variant: "destructive",
      onClick: (ids) => {
        setClients((prev) => prev.filter((c) => !ids.includes(c.id)));
      },
    },
  ];

  const stats = React.useMemo(() => ({
    active: clients.filter((c) => c.status === "active").length,
    lead:   clients.filter((c) => c.status === "lead").length,
    inactive: clients.filter((c) => c.status === "inactive").length,
  }), [clients]);

  return (
    <>
      {/* Summary row */}
      <div className="flex items-center gap-3 mb-5">
        {[
          { label: "פעילים",   value: stats.active,   dot: "bg-green-500", text: "text-green-700" },
          { label: "לידים",    value: stats.lead,     dot: "bg-blue-500",  text: "text-blue-700" },
          { label: "לא פעילים", value: stats.inactive, dot: "bg-slate-400", text: "text-slate-600" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm">
            <span className={`h-2 w-2 rounded-full ${s.dot}`} />
            <span className={`font-semibold ${s.text}`}>{s.value}</span>
            <span className="text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      <CollectionView
        title="לקוחות"
        subtitle={`${clients.length} רשומות במסד הנתונים`}
        data={clients as unknown as Record<string, unknown>[]}
        columns={COLUMNS as unknown as ColDef<Record<string, unknown>>[]}
        keyField="id"
        onRowClick={(row) => openRecord(row as unknown as Client)}
        onNew={() => {
          setSelectedRecord({
            id: crypto.randomUUID(),
            contact_name: "",
            company_name: "",
            email: "",
            phone: "",
            address: "",
            notes: "",
            status: "lead",
            tags: [],
            created_at: new Date().toISOString(),
          });
          setPanelOpen(true);
        }}
        newLabel="לקוח חדש"
        bulkActions={bulkActions}
        filterFields={[
          { key: "contact_name", label: "שם" },
          { key: "company_name", label: "חברה" },
          { key: "email",        label: "אימייל" },
          { key: "status",       label: "סטטוס" },
        ]}
        pageSize={10}
        emptyIcon={<Users className="h-10 w-10 opacity-20" />}
        emptyText="לא נמצאו לקוחות התואמים את החיפוש"
      />

      <RecordPanel
        open={panelOpen}
        onClose={closePanel}
        title={selectedRecord?.contact_name || "לקוח חדש"}
        subtitle={selectedRecord?.company_name ?? undefined}
        record={selectedRecord as unknown as Record<string, unknown>}
        fields={PANEL_FIELDS}
        onSave={handleSave}
        onDelete={() => {
          if (selectedRecord) {
            setClients((prev) => prev.filter((c) => c.id !== selectedRecord.id));
            closePanel();
          }
        }}
        activityLog={selectedRecord ? MOCK_ACTIVITY : []}
      />
    </>
  );
}

/* ───────────── helpers ───────────── */

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
