"use client";

import { useStore } from "../store";
import { useState, useEffect, useRef, useCallback } from "react";
import { runMockAgent } from "../mock-agent";
import { SCENARIOS } from "../scenarios";

interface Command {
  id: string;
  label: string;
  icon: string;
  category: string;
  action: () => void;
}

export function CommandPalette() {
  const open = useStore((s) => s.commandPaletteOpen);
  const setOpen = useStore((s) => s.setCommandPaletteOpen);
  const setView = useStore((s) => s.setView);
  const reset = useStore((s) => s.reset);
  const togglePause = useStore((s) => s.togglePause);
  const phase = useStore((s) => s.phase);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: "home", label: "Go to Landing", icon: "🏠", category: "Navigation", action: () => { reset(); setView("landing"); } },
    { id: "workspace", label: "Open Workspace", icon: "💻", category: "Navigation", action: () => setView("workspace") },
    { id: "settings", label: "Open Settings", icon: "⚙️", category: "Navigation", action: () => setView("settings") },
    { id: "history", label: "Session History", icon: "📊", category: "Navigation", action: () => setView("history") },
    { id: "reset", label: "Reset Session", icon: "🔄", category: "Actions", action: () => reset() },
    ...SCENARIOS.map((s) => ({
      id: `scenario-${s.id}`,
      label: `Demo: ${s.title}`,
      icon: s.icon,
      category: "Scenarios",
      action: () => { reset(); setView("workspace"); setTimeout(() => runMockAgent(s.prompt, s.id), 100); },
    })),
    ...(phase === "coding" ? [
      { id: "pause", label: "Pause Agent", icon: "⏸", category: "Agent", action: () => togglePause() },
    ] : []),
  ];

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const execute = useCallback((cmd: Command) => {
    cmd.action();
    setOpen(false);
  }, [setOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIdx]) {
      e.preventDefault();
      execute(filtered[selectedIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  if (!open) return null;

  // Group by category
  const categories = Array.from(new Set(filtered.map((c) => c.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "fadeIn 0.15s ease-out" }}
      >
        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <span className="text-muted text-sm">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-muted outline-none"
          />
          <kbd className="text-[10px] text-muted bg-surface-hover px-1.5 py-0.5 rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted">No commands found</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat}>
                <p className="px-4 py-1 text-[10px] font-semibold text-muted uppercase tracking-wider">{cat}</p>
                {filtered
                  .filter((c) => c.category === cat)
                  .map((cmd) => {
                    const idx = filtered.indexOf(cmd);
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => execute(cmd)}
                        onMouseEnter={() => setSelectedIdx(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                          idx === selectedIdx ? "bg-accent/10 text-white" : "text-gray-300 hover:bg-surface-hover"
                        }`}
                      >
                        <span className="text-sm">{cmd.icon}</span>
                        <span className="text-sm">{cmd.label}</span>
                      </button>
                    );
                  })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}
