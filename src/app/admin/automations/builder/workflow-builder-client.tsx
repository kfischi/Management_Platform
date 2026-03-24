"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Settings2, GitBranch, Zap, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { WorkflowCanvas, type WorkflowData } from "@/components/admin/workflow-canvas";
import { TEMPLATES } from "../automation-templates";
import { cn } from "@/lib/utils";

interface Automation {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  is_active: boolean;
  workflow_json?: WorkflowData;
  n8n_workflow_id?: string;
  run_count?: number;
  last_run_at?: string;
}

interface Props {
  automation: Automation | null;
  templateId: string | null;
}

export default function WorkflowBuilderClient({ automation, templateId }: Props) {
  const router = useRouter();
  const [name, setName] = React.useState(automation?.name ?? "");
  const [description, setDescription] = React.useState(automation?.description ?? "");
  const [triggerType, setTriggerType] = React.useState(automation?.trigger_type ?? "manual");
  const [n8nId, setN8nId] = React.useState(automation?.n8n_workflow_id ?? "");
  const [isActive, setIsActive] = React.useState(automation?.is_active ?? false);
  const [showMeta, setShowMeta] = React.useState(!automation);
  const [saving, setSaving] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Resolve initial workflow data
  const initialTemplate = templateId ? TEMPLATES.find((t) => t.id === templateId) : null;
  const initialWorkflow: WorkflowData = automation?.workflow_json ??
    initialTemplate?.workflow ?? { nodes: [], edges: [] };

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave(workflowData: WorkflowData) {
    if (!name.trim()) { showToast("error", "שם הוא שדה חובה"); return; }
    setSaving(true);
    try {
      const isNew = !automation;
      const url = isNew ? "/api/admin/automations" : `/api/admin/automations/${automation!.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          trigger_type: triggerType,
          n8n_workflow_id: n8nId || null,
          is_active: isActive,
          workflow_json: workflowData,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "שגיאה בשמירה");
      showToast("success", "נשמר בהצלחה!");
      if (isNew) router.push(`/admin/automations/builder?id=${json.id}`);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "שגיאה");
    } finally {
      setSaving(false);
    }
  }

  async function handleRun(workflowData: WorkflowData) {
    if (!automation) {
      showToast("error", "שמור קודם לפני הפעלה");
      throw new Error("לא שמור");
    }
    setRunning(true);
    try {
      // Auto-save first
      await handleSave(workflowData);
      const res = await fetch(`/api/admin/automations/${automation.id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger_data: {} }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "שגיאה בהפעלה");
      showToast("success", `הרצה הושלמה! Run ID: ${json.run_id?.slice(0, 8)}`);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "שגיאה");
      throw err;
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-800 bg-slate-950 shrink-0">
        <button
          onClick={() => router.push("/admin/automations")}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          אוטומציות
        </button>
        <span className="text-slate-700">/</span>

        {/* Editable name */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="שם האוטומציה..."
          className="flex-1 bg-transparent text-sm font-semibold text-white placeholder:text-slate-600 focus:outline-none max-w-[300px]"
        />

        <div className="flex items-center gap-2 mr-auto">
          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">פעיל</span>
            <div
              onClick={() => setIsActive(!isActive)}
              className={cn(
                "relative w-9 h-5 rounded-full transition-colors cursor-pointer",
                isActive ? "bg-green-600" : "bg-slate-700"
              )}
            >
              <div className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                isActive ? "translate-x-4" : "translate-x-0.5"
              )} />
            </div>
          </div>

          {/* Settings toggle */}
          <button
            onClick={() => setShowMeta(!showMeta)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
              showMeta
                ? "border-indigo-600 bg-indigo-900/30 text-indigo-400"
                : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
            )}
          >
            <Settings2 className="h-3.5 w-3.5" />
            הגדרות
          </button>

          {/* Run history link */}
          {automation && (
            <a
              href={`/admin/automations`}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              <Clock className="h-3.5 w-3.5" />
              היסטוריה
            </a>
          )}
        </div>
      </div>

      {/* Meta settings panel */}
      {showMeta && (
        <div className="border-b border-slate-800 bg-slate-900 px-4 py-3 shrink-0">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="min-w-[200px]">
              <label className="block text-xs font-medium text-slate-400 mb-1">תיאור</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="תיאור קצר..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">סוג טריגר</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="manual">ידני</option>
                <option value="webhook">Webhook</option>
                <option value="schedule">תזמון</option>
                <option value="lead">ליד חדש</option>
                <option value="payment">תשלום</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div className="min-w-[220px]">
              <label className="block text-xs font-medium text-slate-400 mb-1">n8n Workflow ID (אופציונלי)</label>
              <input
                value={n8nId}
                onChange={(e) => setN8nId(e.target.value)}
                placeholder="n8n workflow UUID"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>
            {automation && (
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-xs text-slate-500">ריצות</p>
                  <p className="text-sm font-bold text-white">{automation.run_count ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">אחרון</p>
                  <p className="text-xs text-slate-300">
                    {automation.last_run_at
                      ? new Date(automation.last_run_at).toLocaleString("he-IL")
                      : "מעולם"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <WorkflowCanvas
          initialData={initialWorkflow}
          onSave={handleSave}
          onRun={handleRun}
        />
      </div>

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-xl z-50 transition-all",
          toast.type === "success"
            ? "bg-green-900 border border-green-700 text-green-100"
            : "bg-red-900 border border-red-700 text-red-100"
        )}>
          {toast.type === "success"
            ? <CheckCircle2 className="h-4 w-4" />
            : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
