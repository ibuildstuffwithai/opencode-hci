"use client";

import { useState } from "react";

interface InlineErrorProps {
  title: string;
  message: string;
  type?: "network" | "api" | "rate-limit" | "generic";
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ERROR_INFO: Record<string, { icon: string; suggestion: string }> = {
  network: {
    icon: "📡",
    suggestion: "Check your internet connection and try again.",
  },
  api: {
    icon: "🔧",
    suggestion: "The AI service may be temporarily unavailable. Try again in a moment.",
  },
  "rate-limit": {
    icon: "⏳",
    suggestion: "Too many requests. Please wait a moment before trying again.",
  },
  generic: {
    icon: "❌",
    suggestion: "Something unexpected happened. Try again or refresh the page.",
  },
};

export function InlineError({ title, message, type = "generic", onRetry, onDismiss }: InlineErrorProps) {
  const [dismissed, setDismissed] = useState(false);
  const info = ERROR_INFO[type] || ERROR_INFO.generic;

  if (dismissed) return null;

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[85%] rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
        <div className="flex items-start gap-2.5">
          <span className="text-lg mt-0.5">{info.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-400">{title}</p>
            <p className="text-xs text-red-400/70 mt-0.5">{message}</p>
            <p className="text-[11px] text-muted mt-1.5 italic">{info.suggestion}</p>
            <div className="flex gap-2 mt-2.5">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Retry
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={() => {
                    setDismissed(true);
                    onDismiss();
                  }}
                  className="px-3 py-1.5 text-xs text-muted hover:text-white rounded-lg hover:bg-surface-hover transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
