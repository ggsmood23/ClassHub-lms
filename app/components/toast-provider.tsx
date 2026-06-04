"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: number;
  title: string;
  message?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now();

    setToasts((currentToasts) => [...currentToasts, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((currentToast) => currentToast.id !== id),
      );
    }, 3600);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-fade-up rounded-3xl border border-white/70 bg-white/85 p-4 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/85"
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 size-2.5 rounded-full ${
                  toast.variant === "success"
                    ? "bg-emerald-400"
                    : toast.variant === "error"
                      ? "bg-rose-400"
                      : "bg-cyan-400"
                }`}
              />
              <div>
                <p className="text-sm font-black text-slate-950 dark:text-white">
                  {toast.title}
                </p>
                {toast.message ? (
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                    {toast.message}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
