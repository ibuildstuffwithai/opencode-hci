"use client";

import React from "react";
import { useStore, FileNode } from "../store";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false }
);

function getLanguage(path: string): string {
  if (path.endsWith(".tsx") || path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".jsx") || path.endsWith(".js")) return "javascript";
  if (path.endsWith(".html") || path.endsWith(".htm")) return "html";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  if (path.endsWith(".py")) return "python";
  return "plaintext";
}

export function CodeEditor() {
  const activeFile = useStore((s) => s.activeFile);
  const activeFileContent = useStore((s) => s.activeFileContent);
  const openTabs = useStore((s) => s.openTabs);
  const setActiveFile = useStore((s) => s.setActiveFile);
  const closeTab = useStore((s) => s.closeTab);
  const files = useStore((s) => s.files);
  const setFiles = useStore((s) => s.setFiles);
  const setActiveFileContent = useStore((s) => s.setActiveFileContent);

  const handleEditorChange = (value: string | undefined) => {
    if (!value || !activeFile) return;
    setActiveFileContent(value);
    // Update file content in tree
    const updateContent = (nodes: FileNode[]): FileNode[] =>
      nodes.map((n) => {
        if (n.path === activeFile) return { ...n, content: value };
        if (n.children) return { ...n, children: updateContent(n.children) };
        return n;
      });
    setFiles(updateContent(files));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      {openTabs.length > 0 && (
        <div className="flex items-center border-b border-border bg-background overflow-x-auto shrink-0">
          {openTabs.map((t) => {
            const name = t.split("/").pop() || t;
            return (
              <div
                key={t}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer border-r border-border transition-colors shrink-0 ${
                  activeFile === t
                    ? "bg-surface text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
                onClick={() => setActiveFile(t)}
              >
                <span className="text-[10px]">
                  {t.endsWith(".html") ? "🌐" : t.endsWith(".css") ? "🎨" : t.endsWith(".js") ? "⚡" : "📄"}
                </span>
                <span>{name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(t);
                  }}
                  className="text-[10px] text-muted hover:text-foreground ml-1 opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {activeFile ? (
          <MonacoEditor
            height="100%"
            language={getLanguage(activeFile)}
            theme="vs-dark"
            value={activeFileContent}
            onChange={handleEditorChange}
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              padding: { top: 8 },
              wordWrap: "on",
              tabSize: 2,
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-center animate-fade-in">
            <div>
              <div className="relative inline-block mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/10 to-accent-purple/10 border border-accent/10 flex items-center justify-center">
                  <span className="text-2xl opacity-40">📝</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 font-medium">No file selected</p>
              <p className="text-[11px] text-muted mt-1.5">Generate code or select a file from the tree</p>
              <div className="mt-3 flex justify-center gap-1.5">
                <div className="skeleton w-16 h-1.5 rounded-full" />
                <div className="skeleton w-10 h-1.5 rounded-full" />
                <div className="skeleton w-12 h-1.5 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
