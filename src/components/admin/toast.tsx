"use client";

import * as React from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────── types ─────────────────────── */

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

/* ─────────────────────── context ─────────────────────── */

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

/* ─────────────────────── provider ─────────────────────── */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const add = React.useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...opts, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, opts.duration ?? 3500);
  }, []);

  const value = React.useMemo<ToastContextValue>(() => ({
    toast: add,
    success: (t, d) => add({ type: "success", title: t, description: d }),
    error:   (t, d) => add({ type: "error",   title: t, description: d }),
    warning: (t, d) => add({ type: "warning", title: t, description: d }),
    info:    (t, d) => add({ type: "info",    title: t, description: d }),
  }), [add]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Portal */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            toast={t}
            onDismiss={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ─────────────────────── item ─────────────────────── */

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />,
  error:   <XCircle     className="h-4 w-4 text-red-600 shrink-0" />,
  warning: <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />,
  info:    <Info        className="h-4 w-4 text-blue-600 shrink-0" />,
};

const STYLES: Record<ToastType, string> = {
  success: "border-green-200 bg-white",
  error:   "border-red-200 bg-white",
  warning: "border-amber-200 bg-white",
  info:    "border-blue-200 bg-white",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-in slide-in-from-right-4 fade-in-0",
        STYLES[toast.type]
      )}
    >
      {ICONS[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-slate-500 mt-0.5">{toast.description}</p>
        )}
      </div>
      <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
