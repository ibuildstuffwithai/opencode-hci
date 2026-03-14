"use client";

import { useState, useEffect } from "react";

interface Shortcut {
  keys: string[];
  label: string;
}

interface ShortcutGroup {
  title: string;
  icon: string;
  shortcuts: Shortcut[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "General",
    icon: "⌨️",
    shortcuts: [
      { keys: ["⌘", "K"], label: "Open command palette" },
      { keys: ["?"], label: "Toggle keyboard shortcuts" },
      { keys: ["Esc"], label: "Close modal / overlay" },
    ],
  },
  {
    title: "Panels",
    icon: "📐",
    shortcuts: [
      { keys: ["⌘", "B"], label: "Toggle HCI dashboard" },
      { keys: ["⌘", "J"], label: "Toggle console / terminal" },
    ],
  },
  {
    title: "Editor",
    icon: "📝",
    shortcuts: [
      { keys: ["⌘", "S"], label: "Save current file" },
      { keys: ["⌘", "Z"], label: "Undo" },
      { keys: ["⌘", "⇧", "Z"], label: "Redo" },
      { keys: ["⌘", "D"], label: "Select next occurrence" },
      { keys: ["⌘", "/"], label: "Toggle line comment" },
      { keys: ["Tab"], label: "Indent selection" },
      { keys: ["⇧", "Tab"], label: "Outdent selection" },
    ],
  },
  {
    title: "Navigation",
    icon: "🧭",
    shortcuts: [
      { keys: ["⌘", "P"], label: "Quick file open (in editor)" },
      { keys: ["⌘", "G"], label: "Go to line" },
    ],
  },
];

// Global toggle for external triggers
let _externalToggle: (() => void) | null = null;
export function toggleKeyboardShortcuts() {
  _externalToggle?.();
}

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    _externalToggle = () => setOpen((o) => !o);
    return () => { _externalToggle = null; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only trigger on "?" when no input/textarea is focused
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "?" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl mx-4 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-lg">⌨️</span>
            <h2 className="text-sm font-semibold text-foreground">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-muted hover:text-foreground text-sm px-2 py-1 rounded hover:bg-surface-hover transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>{group.icon}</span>
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-surface-hover transition-colors"
                    >
                      <span className="text-xs text-gray-300">{shortcut.label}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, ki) => (
                          <kbd
                            key={ki}
                            className="min-w-[24px] h-6 flex items-center justify-center text-[10px] font-medium text-gray-300 bg-[#1a1a1e] border border-border rounded-md px-1.5 shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between">
          <p className="text-[10px] text-muted">
            Press <kbd className="text-[10px] bg-surface-hover px-1.5 py-0.5 rounded mx-0.5">?</kbd> to toggle this overlay
          </p>
          <p className="text-[10px] text-muted">
            <kbd className="text-[10px] bg-surface-hover px-1.5 py-0.5 rounded mx-0.5">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
