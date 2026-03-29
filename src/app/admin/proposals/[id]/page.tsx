/**
 * /admin/proposals/[id]
 * Printable proposal / invoice page.
 * Opens in a new tab → File > Print → Save as PDF
 */
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Database } from "@/types/database";

type ProposalRow = Database["public"]["Tables"]["proposals"]["Row"];
type ServiceLine = { id: string; name: string; description: string; price: number; qty: number };

export default async function ProposalPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: rawProposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .single();

  const proposal = rawProposal as ProposalRow | null;
  if (!proposal) notFound();

  const services = (proposal.services as unknown as ServiceLine[]) ?? [];
  const total = services.reduce((s, srv) => s + srv.price * srv.qty, 0);

  const { data: agencyRaw } = await supabase
    .from("agency_settings")
    .select("key, value")
    .in("key", ["agency_name", "agency_email", "agency_phone", "agency_address", "agency_logo"]);

  const agency: Record<string, string> = {};
  for (const row of (agencyRaw ?? []) as { key: string; value: string | null }[]) {
    if (row.value) agency[row.key] = row.value;
  }

  const now = new Date();
  const validUntil = new Date(proposal.created_at);
  validUntil.setDate(validUntil.getDate() + proposal.valid_days);

  const fmtDate = (d: Date) => d.toLocaleDateString("he-IL");
  const statusLabel: Record<string, string> = {
    draft: "טיוטה", sent: "נשלחה", accepted: "אושרה", rejected: "נדחתה",
  };

  return (
    <html lang="he" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>הצעת מחיר — {proposal.project_name}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, Arial, sans-serif; color: #1e293b; background: #fff; }
          @media print {
            body { font-size: 12px; }
            .no-print { display: none !important; }
            @page { margin: 20mm; }
          }
          .page { max-width: 800px; margin: 0 auto; padding: 40px 32px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; }
          .agency { font-size: 13px; color: #64748b; line-height: 1.6; }
          .agency strong { font-size: 18px; color: #1e293b; display: block; margin-bottom: 4px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
          .badge.draft { background:#f8fafc; color:#64748b; border-color:#e2e8f0; }
          .badge.sent { background:#eff6ff; color:#2563eb; border-color:#bfdbfe; }
          .badge.rejected { background:#fef2f2; color:#dc2626; border-color:#fecaca; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
          .meta-box { background: #f8fafc; border-radius: 12px; padding: 16px; }
          .meta-box h3 { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; margin-bottom: 8px; }
          .meta-box p { font-size: 14px; color: #1e293b; line-height: 1.6; }
          .meta-box strong { font-size: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #1e293b; color: #fff; padding: 10px 14px; font-size: 13px; text-align: right; }
          th:last-child { text-align: left; }
          td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          tr:nth-child(even) td { background: #f8fafc; }
          .td-right { text-align: left; font-weight: 600; }
          .total-row { background: #f0fdf4 !important; font-weight: 700; }
          .total-row td { border-bottom: none; font-size: 15px; }
          .notes { background: #fffbeb; border-right: 3px solid #f59e0b; padding: 14px 16px; border-radius: 0 8px 8px 0; font-size: 13px; color: #78350f; margin-bottom: 32px; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding-top: 24px; border-top: 1px solid #e2e8f0; }
          .print-btn { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #4f46e5; color: #fff; border: none; padding: 12px 32px; border-radius: 9999px; font-size: 15px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 16px rgba(79,70,229,.4); }
        `}</style>
      </head>
      <body>
        <div className="page">
          {/* Header */}
          <div className="header">
            <div className="agency">
              <strong>{agency.agency_name ?? "הסוכנות"}</strong>
              {agency.agency_email && <span>{agency.agency_email}<br /></span>}
              {agency.agency_phone && <span>{agency.agency_phone}<br /></span>}
              {agency.agency_address && <span>{agency.agency_address}</span>}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#4f46e5", marginBottom: 6 }}>הצעת מחיר</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>#{id.slice(-8).toUpperCase()}</div>
              <span className={`badge ${proposal.status}`}>{statusLabel[proposal.status] ?? proposal.status}</span>
            </div>
          </div>

          {/* Meta */}
          <div className="meta">
            <div className="meta-box">
              <h3>לקוח</h3>
              <p>
                <strong>{proposal.client_name}</strong><br />
                {proposal.client_company && <>{proposal.client_company}<br /></>}
                {proposal.client_email}
              </p>
            </div>
            <div className="meta-box">
              <h3>פרטי הצעה</h3>
              <p>
                <strong>{proposal.project_name}</strong><br />
                {proposal.project_type}<br />
                תאריך: {fmtDate(new Date(proposal.created_at))}<br />
                בתוקף עד: {fmtDate(validUntil)}
              </p>
            </div>
          </div>

          {/* Services table */}
          <table>
            <thead>
              <tr>
                <th>שירות / מוצר</th>
                <th>תיאור</th>
                <th style={{ textAlign: "center" }}>כמות</th>
                <th style={{ textAlign: "left" }}>מחיר ליחידה</th>
                <th style={{ textAlign: "left" }}>סה״כ</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: "#64748b" }}>{s.description}</td>
                  <td style={{ textAlign: "center" }}>{s.qty}</td>
                  <td className="td-right">₪{s.price.toLocaleString()}</td>
                  <td className="td-right">₪{(s.price * s.qty).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan={4} style={{ textAlign: "right" }}>סה״כ לתשלום</td>
                <td className="td-right" style={{ color: "#16a34a", fontSize: 17 }}>₪{total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Notes */}
          {proposal.notes && (
            <div className="notes">
              <strong>הערות:</strong><br />
              {proposal.notes}
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            <p>הצעה זו בתוקף עד {fmtDate(validUntil)} · {agency.agency_name ?? "הסוכנות"}</p>
            <p style={{ marginTop: 4 }}>נוצר על ידי Management Platform</p>
          </div>
        </div>

        {/* Print button */}
        <button
          className="print-btn no-print"
          onClick={() => typeof window !== "undefined" && window.print()}
        >
          🖨️ הדפס / שמור PDF
        </button>
        <script dangerouslySetInnerHTML={{ __html: `
          document.querySelector('.print-btn')?.addEventListener('click', () => window.print());
        `}} />
      </body>
    </html>
  );
}
