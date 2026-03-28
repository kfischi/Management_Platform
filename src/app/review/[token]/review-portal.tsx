"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, MessageSquare, Loader2, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  token: string;
  siteId: string;
  siteName: string;
  reviewStatus: string;
  reviewComment: string;
}

export default function ReviewPortal({
  token,
  siteId,
  siteName,
  reviewStatus: initialStatus,
  reviewComment: initialComment,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [comment, setComment] = useState(initialComment);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [decision, setDecision] = useState<"approved" | "changes_requested" | null>(null);

  async function handleSubmit(newStatus: "approved" | "changes_requested") {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/review/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, comment }),
      });
      if (res.ok) {
        setStatus(newStatus);
        setDecision(newStatus);
        setSubmitted(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isAlreadyDecided = status !== "pending";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50" dir="rtl">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Eye className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{siteName}</p>
              <p className="text-xs text-slate-400">תצוגה מקדימה לאישור</p>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Already decided banner */}
        {isAlreadyDecided && !submitted && (
          <div className={cn(
            "rounded-2xl p-5 flex items-center gap-3",
            status === "approved" ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"
          )}>
            {status === "approved" ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            ) : (
              <MessageSquare className="h-6 w-6 text-orange-600 shrink-0" />
            )}
            <div>
              <p className={cn("font-semibold", status === "approved" ? "text-green-700" : "text-orange-700")}>
                {status === "approved" ? "אישרת את האתר" : "ביקשת שינויים"}
              </p>
              {initialComment && (
                <p className="text-sm text-slate-600 mt-0.5">{initialComment}</p>
              )}
            </div>
          </div>
        )}

        {/* Success state */}
        {submitted && (
          <div className={cn(
            "rounded-2xl p-8 text-center border",
            decision === "approved" ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
          )}>
            {decision === "approved" ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">מעולה! האתר אושר 🎉</h2>
                <p className="text-green-600">נעדכן אותך כשהאתר יעלה לאוויר.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-orange-700 mb-2">קיבלנו את הערותיך</h2>
                <p className="text-orange-600">נעבד את השינויים ונשלח לך גרסה מעודכנת בקרוב.</p>
              </>
            )}
          </div>
        )}

        {/* Site preview */}
        {siteId && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded text-xs text-slate-400 text-center py-0.5 px-3 font-mono">
                {siteName.toLowerCase().replace(/\s/g, "-")}.co.il
              </div>
            </div>
            {/* Preview iframe */}
            <iframe
              src={`/sites/${siteId}`}
              className="w-full"
              style={{ height: "600px", border: "none" }}
              title={`תצוגה מקדימה — ${siteName}`}
            />
          </div>
        )}

        {/* Review panel */}
        {!submitted && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-800">מה דעתך?</h3>

            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">
                הערות ושינויים (אופציונלי)
              </label>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[100px]"
                placeholder="תאר כאן כל שינוי שתרצה — צבע, טקסט, תמונות, מבנה..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                disabled={isAlreadyDecided}
              />
            </div>

            {!isAlreadyDecided && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSubmit("changes_requested")}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-orange-200 bg-orange-50 text-orange-700 font-semibold py-3 hover:bg-orange-100 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ThumbsDown className="h-5 w-5" />}
                  יש לי שינויים
                </button>
                <button
                  onClick={() => handleSubmit("approved")}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 text-green-700 font-semibold py-3 hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ThumbsUp className="h-5 w-5" />}
                  אני מאשר!
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1">
        <CheckCircle2 className="h-3.5 w-3.5" /> מאושר
      </span>
    );
  }
  if (status === "changes_requested") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
        <MessageSquare className="h-3.5 w-3.5" /> שינויים נדרשים
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1">
      <Eye className="h-3.5 w-3.5" /> ממתין לאישורך
    </span>
  );
}
