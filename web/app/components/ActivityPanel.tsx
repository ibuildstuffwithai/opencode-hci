"use client";

import { useStore, ActivityCategory, FileNode } from "../store";
import { useRef, useEffect } from "react";

const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  search: "🔍",
  write: "📝",
  test: "🧪",
  fix: "🔧",
  think: "🧠",
  verify: "✅",
  info: "📊",
};

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  search: "text-blue-400",
  write: "text-emerald-400",
  test: "text-yellow-400",
  fix: "text-orange-400",
  think: "text-purple-400",
  verify: "text-green-400",
  info: "text-indigo-400",
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function FileTreeMini({ nodes, depth = 0 }: { nodes: FileNode[]; depth?: number }) {
  return (
    <div>
      {nodes.map((n) => (
        <div key={n.path}>
          <div
            className={`flex items-center gap-1 text-[11px] py-0.5 ${n.touched ? "text-emerald-400" : "text-muted"}`}
            style={{ paddingLeft: `${depth * 12 + 4}px` }}
          >
            <span className="text-[9px]">{n.type === "folder" ? "📁" : n.touched ? "✏️" : "📄"}</span>
            <span>{n.name}</span>
            {n.touched && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded ml-1">modified</span>}
          </div>
          {n.children && <FileTreeMini nodes={n.children} depth={depth + 1} />}
        </div>
      ))}
    </div>
  );
}

export function ActivityPanel() {
  const activities = useStore((s) => s.activities);
  const toggleDetail = useStore((s) => s.toggleActivityDetail);
  const pillars = useStore((s) => s.pillars);
  const progressPercent = useStore((s) => s.progressPercent);
  const phase = useStore((s) => s.phase);
  const files = useStore((s) => s.files);
  const testResults = useStore((s) => s.testResults);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activities]);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main activity feed */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Progress bar */}
        {phase !== "idle" && (
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-muted uppercase tracking-wider">Task Progress</span>
              <span className="text-[11px] font-mono text-white">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-purple transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Pillar scores live */}
        {phase !== "idle" && (
          <div className="px-4 py-2 grid grid-cols-4 gap-2">
            {(["alignment", "steerability", "verification", "adaptability"] as const).map((key) => {
              const p = pillars[key];
              const icons = { alignment: "🎯", steerability: "🎮", verification: "✅", adaptability: "🧠" };
              return (
                <div key={key} className="bg-surface rounded-lg px-2 py-1.5 border border-border">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]">{icons[key]}</span>
                    <span className="text-[10px] font-semibold text-white capitalize">{key.slice(0, 5)}</span>
                    <span className="ml-auto text-[10px] font-mono text-muted">
                      {p.score > 0 ? Math.round(p.score * 100) + "%" : "—"}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        p.status === "green" ? "bg-green-500" : p.status === "yellow" ? "bg-yellow-500" : p.status === "red" ? "bg-red-500" : "bg-gray-600"
                      }`}
                      style={{ width: `${p.score * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Activity entries */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-3xl mb-3">⚡</span>
              <p className="text-sm text-muted">Activity feed will appear here</p>
              <p className="text-[10px] text-muted mt-1">Real-time updates as the agent works</p>
            </div>
          ) : (
            activities.map((entry) => (
              <div key={entry.id} className="animate-fade-in">
                <button
                  onClick={() => entry.detail && toggleDetail(entry.id)}
                  className={`w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                    entry.detail ? "hover:bg-surface-hover cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span className="text-[10px] text-muted font-mono mt-0.5 shrink-0 w-16">
                    {formatTime(entry.timestamp)}
                  </span>
                  <span className={`text-xs ${CATEGORY_COLORS[entry.category]}`}>
                    {CATEGORY_ICONS[entry.category]}
                  </span>
                  <span className="text-xs text-gray-300 flex-1">{entry.message}</span>
                  {entry.detail && (
                    <span className="text-[10px] text-muted shrink-0">{entry.expanded ? "▼" : "▶"}</span>
                  )}
                </button>
                {entry.expanded && entry.detail && (
                  <div className="ml-20 mr-2 mb-2 px-3 py-2 bg-[#0a0a0c] rounded-lg border border-border">
                    <pre className="text-[11px] text-gray-400 font-mono whitespace-pre-wrap">{entry.detail}</pre>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Test results summary */}
        {testResults && (
          <div className="px-4 py-2 border-t border-border bg-surface">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-white">Test Results</span>
              <span className="text-xs text-green-400">{testResults.passed} passed</span>
              {testResults.failed > 0 && <span className="text-xs text-red-400">{testResults.failed} failed</span>}
              {testResults.coverage !== undefined && (
                <span className="text-xs text-muted ml-auto">{testResults.coverage}% coverage</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar: file tree */}
      {files.length > 0 && (
        <div className="w-48 border-l border-border overflow-y-auto py-2 bg-surface/50">
          <p className="px-3 py-1 text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Files Touched</p>
          <FileTreeMini nodes={files} />
        </div>
      )}
    </div>
  );
}
