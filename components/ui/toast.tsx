"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertTriangle, Check, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastApi = {
  push: (input: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);
const DEFAULT_DURATION = 3200;

const toneStyles: Record<ToastTone, { wrap: string; icon: string; Icon: typeof Check }> = {
  success: { wrap: "border-lime-300/20 bg-[#121416]", icon: "bg-lime-300/15 text-lime-300", Icon: Check },
  error: { wrap: "border-red-300/20 bg-[#161113]", icon: "bg-red-300/15 text-red-300", Icon: AlertTriangle },
  info: { wrap: "border-white/10 bg-[#121416]", icon: "bg-white/[.06] text-zinc-300", Icon: Info },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((input: ToastInput) => {
    const id = crypto.randomUUID();
    const toast: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      tone: input.tone ?? "info",
    };
    setToasts((current) => [...current.slice(-3), toast]);
    window.setTimeout(() => dismiss(id), input.durationMs ?? DEFAULT_DURATION);
  }, [dismiss]);

  const api = useMemo<ToastApi>(() => ({
    push,
    success: (title, description) => push({ title, description, tone: "success" }),
    error: (title, description) => push({ title, description, tone: "error" }),
    info: (title, description) => push({ title, description, tone: "info" }),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-0 sm:items-end sm:p-6" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => {
          const style = toneStyles[toast.tone];
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                "pointer-events-auto flex w-full max-w-[360px] items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl shadow-black/40 animate-rise",
                style.wrap,
              )}
            >
              <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", style.icon)}>
                <style.Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-zinc-100">{toast.title}</p>
                {toast.description && <p className="mt-1 text-xs leading-5 text-zinc-500">{toast.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg text-zinc-600 transition hover:bg-white/[.06] hover:text-zinc-300"
                aria-label="Dismiss notification"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

/** Optional helper for pages that may render outside the provider during tests. */
export function useOptionalToast() {
  return useContext(ToastContext);
}
