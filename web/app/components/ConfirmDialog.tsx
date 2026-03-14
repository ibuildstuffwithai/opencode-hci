"use client";

import { useState, useEffect, useCallback } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES = {
  danger: {
    icon: "🗑️",
    confirmBg: "bg-red-500 hover:bg-red-600",
    border: "border-red-500/20",
    glow: "shadow-red-500/10",
  },
  warning: {
    icon: "⚠️",
    confirmBg: "bg-yellow-600 hover:bg-yellow-700",
    border: "border-yellow-500/20",
    glow: "shadow-yellow-500/10",
  },
  info: {
    icon: "ℹ️",
    confirmBg: "bg-accent hover:bg-accent/90",
    border: "border-accent/20",
    glow: "shadow-accent/10",
  },
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [closing, setClosing] = useState(false);
  const style = VARIANT_STYLES[variant];

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onCancel();
    }, 200);
  }, [onCancel]);

  const handleConfirm = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onConfirm();
    }, 200);
  }, [onConfirm]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "Enter") handleConfirm();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleClose, handleConfirm]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-opacity duration-200 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div
        className={`relative bg-[#1a1a1e] border ${style.border} rounded-2xl p-6 max-w-sm w-full shadow-2xl ${style.glow} transition-all duration-200 ${
          closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-xl shrink-0">
            {style.icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs text-muted hover:text-foreground bg-surface-hover rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-xs text-foreground rounded-lg transition-colors ${style.confirmBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for easy usage
export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: "danger" | "warning" | "info";
    resolve?: (confirmed: boolean) => void;
  }>({ open: false, title: "", message: "" });

  const confirm = useCallback(
    (opts: { title: string; message: string; confirmLabel?: string; variant?: "danger" | "warning" | "info" }) => {
      return new Promise<boolean>((resolve) => {
        setState({ ...opts, open: true, resolve });
      });
    },
    []
  );

  const dialog = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      variant={state.variant}
      onConfirm={() => {
        state.resolve?.(true);
        setState((s) => ({ ...s, open: false }));
      }}
      onCancel={() => {
        state.resolve?.(false);
        setState((s) => ({ ...s, open: false }));
      }}
    />
  );

  return { confirm, dialog };
}
