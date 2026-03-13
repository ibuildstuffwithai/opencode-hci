"use client";

import React, { useState } from "react";
import { useStore, FileNode } from "../store";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false }
);

function FileTreeItem({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [open, setOpen] = useState(true);
  const activeFile = useStore((s) => s.activeFile);
  const setActiveFile = useStore((s) => s.setActiveFile);

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 w-full text-left px-2 py-1 text-xs text-muted hover:text-white transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <span className="text-[10px]">{open ? "▼" : "▶"}</span>
          <span>📁</span>
          {node.name}
        </button>
        {open &&
          node.children?.map((c) => (
            <FileTreeItem key={c.path} node={c} depth={depth + 1} />
          ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => setActiveFile(node.path)}
      className={`flex items-center gap-1.5 w-full text-left px-2 py-1 text-xs transition-colors ${
        activeFile === node.path
          ? "text-white bg-accent/10"
          : node.touched
          ? "text-emerald-400 hover:text-white"
          : "text-muted hover:text-white"
      }`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <span>{node.touched ? "✏️" : "📄"}</span>
      {node.name}
    </button>
  );
}

type WorkspaceTab = "editor" | "terminal" | "diffs";

export function WorkspacePanel() {
  const [tab, setTab] = useState<WorkspaceTab>("terminal");
  const files = useStore((s) => s.files);
  const activeFileContent = useStore((s) => s.activeFileContent);
  const activeFile = useStore((s) => s.activeFile);
  const openTabs = useStore((s) => s.openTabs);
  const setActiveFile = useStore((s) => s.setActiveFile);
  const closeTab = useStore((s) => s.closeTab);
  const terminalOutput = useStore((s) => s.terminalOutput);
  const diffs = useStore((s) => s.diffs);
  const testResults = useStore((s) => s.testResults);

  const tabs: { key: WorkspaceTab; label: string }[] = [
    { key: "editor", label: "Code" },
    { key: "terminal", label: "Terminal" },
    { key: "diffs", label: "Changes" },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      {/* File Tree */}
      {files.length > 0 && (
        <div className="w-48 min-w-[160px] border-r border-border overflow-y-auto py-2">
          <p className="px-3 py-1 text-[10px] font-semibold text-muted uppercase tracking-wider">
            Files
          </p>
          {files.map((f) => (
            <FileTreeItem key={f.path} node={f} />
          ))}
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Workspace tabs */}
        <div className="flex items-center border-b border-border px-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
                tab === t.key
                  ? "text-white border-accent"
                  : "text-muted border-transparent hover:text-white"
              }`}
            >
              {t.label}
              {t.key === "diffs" && diffs.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">
                  {diffs.length}
                </span>
              )}
            </button>
          ))}
          {testResults && (
            <span className="ml-auto text-xs text-muted px-2">
              Tests: <span className="text-green-400">{testResults.passed}✓</span>
              {testResults.failed > 0 && (
                <span className="text-red-400 ml-1">{testResults.failed}✗</span>
              )}
              {testResults.coverage !== undefined && (
                <span className="text-muted ml-2">{testResults.coverage}% cov</span>
              )}
            </span>
          )}
        </div>

        {/* Open file tabs */}
        {tab === "editor" && openTabs.length > 0 && (
          <div className="flex items-center border-b border-border bg-[#0a0a0c] overflow-x-auto">
            {openTabs.map((t) => {
              const name = t.split("/").pop() || t;
              return (
                <div
                  key={t}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs cursor-pointer border-r border-border transition-colors ${
                    activeFile === t
                      ? "bg-surface text-white"
                      : "text-muted hover:text-white"
                  }`}
                  onClick={() => setActiveFile(t)}
                >
                  <span>{name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(t);
                    }}
                    className="text-[10px] text-muted hover:text-white ml-1"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {tab === "editor" && (
            <div className="h-full">
              {activeFile ? (
                <MonacoEditor
                  height="100%"
                  language={
                    activeFile.endsWith(".tsx") || activeFile.endsWith(".ts")
                      ? "typescript"
                      : activeFile.endsWith(".json")
                      ? "json"
                      : "markdown"
                  }
                  theme="vs-dark"
                  value={activeFileContent}
                  options={{
                    readOnly: true,
                    fontSize: 13,
                    minimap: { enabled: false },
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    padding: { top: 12 },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted text-sm">
                  Select a file to view
                </div>
              )}
            </div>
          )}

          {tab === "terminal" && (
            <div className="h-full overflow-y-auto p-4 font-mono text-xs space-y-0.5 bg-[#0a0a0c]">
              {terminalOutput.length === 0 ? (
                <p className="text-muted">Agent output will appear here...</p>
              ) : (
                terminalOutput.map((line, i) => (
                  <div
                    key={i}
                    className={`animate-fade-in ${
                      line.startsWith("✓") || line.includes("PASS")
                        ? "text-green-400"
                        : line.startsWith("$")
                        ? "text-accent"
                        : "text-gray-400"
                    }`}
                  >
                    {line}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "diffs" && (
            <div className="h-full overflow-y-auto p-4 space-y-3">
              {diffs.length === 0 ? (
                <p className="text-muted text-sm">No changes yet</p>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10">
                      Pillar 3: Verification
                    </span>
                    <span className="text-xs text-muted">
                      {diffs.reduce((s, d) => s + d.additions, 0)} additions,{" "}
                      {diffs.reduce((s, d) => s + d.deletions, 0)} deletions across{" "}
                      {diffs.length} files
                    </span>
                  </div>
                  {diffs.map((d, i) => (
                    <div key={i} className="rounded-lg border border-border bg-surface p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white font-mono">
                          {d.file}
                        </span>
                        <span className="text-xs">
                          <span className="text-green-400">+{d.additions}</span>{" "}
                          <span className="text-red-400">-{d.deletions}</span>
                        </span>
                      </div>
                      <pre className="text-xs text-gray-400 font-mono overflow-x-auto whitespace-pre-wrap">
                        {d.content}
                      </pre>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
