"use client";

import { useStore, ToastType } from "../store";
import { useEffect, useState } from "react";

const TOAST_STYLES: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: { bg: "bg-emerald-500/10", icon: "✅", border: "border-emerald-500/30" },
  error: { bg: "bg-red-500/10", icon: "❌", border: "border-red-500/30" },
  warning: { bg: "bg-yellow-500/10", icon: "⚠️", border: "border-yellow-500/30" },
  info: { bg: "bg-blue-500/10", icon: "ℹ️", border: "border-blue-500/30" },
};

function ToastItem({ id, type, title, message, timestamp }: {
  id: string; type: ToastType; title: string; message?: string; timestamp: number;
}) {
  const removeToast = useStore((s) => s.removeToast);
  const [exiting, setExiting] = useState(false);
  const style = TOAST_STYLES[type];

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => removeToast(id), 300);
  };

  useEffect(() => {
    // Auto-dismiss is handled by store, but we animate exit
    const timer = setTimeout(() => setExiting(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${style.bg} ${style.border} backdrop-blur-md shadow-xl transition-all duration-300 ${
        exiting ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"
      }`}
      style={{ animation: "slideInRight 0.3s ease-out" }}
    >
      <span className="text-sm mt-0.5">{style.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {message && <p className="text-xs text-muted mt-0.5">{message}</p>}
        <p className="text-[9px] text-muted mt-1">
          {new Date(timestamp).toLocaleTimeString()}
        </p>
      </div>
      <button
        onClick={handleClose}
        className="text-muted hover:text-foreground text-xs transition-colors p-1"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem {...toast} />
        </div>
      ))}
    </div>
  );
}
