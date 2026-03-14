"use client";

import React, { useMemo, useState } from "react";
import { useStore, FileNode } from "../store";

function findFileContent(files: FileNode[], name: string): string | undefined {
  for (const f of files) {
    if (f.type === "file" && (f.name === name || f.path === name || f.path.endsWith("/" + name))) {
      return f.content;
    }
    if (f.children) {
      const result = findFileContent(f.children, name);
      if (result !== undefined) return result;
    }
  }
  return undefined;
}

export function PreviewPanel() {
  const files = useStore((s) => s.files);
  const activeFile = useStore((s) => s.activeFile);
  const activeFileContent = useStore((s) => s.activeFileContent);
  const [previewUrl, setPreviewUrl] = useState("");

  // Build combined HTML for preview
  const previewHtml = useMemo(() => {
    // Find HTML file - prefer index.html, then any .html
    let html = findFileContent(files, "index.html");
    if (!html) {
      for (const f of flattenFiles(files)) {
        if (f.path.endsWith(".html")) {
          html = f.content;
          break;
        }
      }
    }

    if (!html) {
      // If the active file is HTML, use it
      if (activeFile?.endsWith(".html") && activeFileContent) {
        html = activeFileContent;
      }
    }

    if (!html) return null;

    // Inject CSS if not already in HTML
    const css = findFileContent(files, "styles.css") || findFileContent(files, "style.css");
    if (css && !html.includes("<style") && !html.includes("styles.css")) {
      html = html.replace("</head>", `<style>\n${css}\n</style>\n</head>`);
      if (!html.includes("</head>")) {
        html = `<style>\n${css}\n</style>\n${html}`;
      }
    }

    // Inject JS if not already in HTML
    const js = findFileContent(files, "script.js") || findFileContent(files, "app.js");
    if (js && !html.includes("<script") && !html.includes("script.js")) {
      html = html.replace("</body>", `<script>\n${js}\n</script>\n</body>`);
      if (!html.includes("</body>")) {
        html = `${html}\n<script>\n${js}\n</script>`;
      }
    }

    return html;
  }, [files, activeFile, activeFileContent]);

  const srcDoc = previewHtml || undefined;

  return (
    <div className="flex flex-col h-full">
      {/* Preview header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">Preview</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder="localhost:3000"
            className="text-[10px] bg-background text-muted border border-border rounded px-2 py-0.5 w-32 outline-none focus:border-accent/30"
          />
          <button
            onClick={() => {
              // Force re-render
              const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
              if (iframe && srcDoc) {
                iframe.srcdoc = srcDoc;
              }
            }}
            className="text-[10px] text-muted hover:text-foreground px-1.5 py-0.5 rounded hover:bg-surface-hover transition-colors"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 bg-white relative">
        {srcDoc ? (
          <iframe
            id="preview-iframe"
            srcDoc={srcDoc}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-modals"
            title="Live Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-background">
            <div className="text-center animate-fade-in">
              <div className="relative inline-block mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-accent-purple/10 border border-accent/10 flex items-center justify-center">
                  <span className="text-3xl opacity-50">🖥️</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center">
                  <span className="text-[10px]">✨</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 font-medium">Live preview will appear here</p>
              <p className="text-[11px] text-muted mt-1.5">Generate HTML code to see it rendered</p>
              <div className="mt-4 flex justify-center gap-2">
                <div className="skeleton w-20 h-2 rounded-full" />
                <div className="skeleton w-14 h-2 rounded-full" />
                <div className="skeleton w-16 h-2 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function flattenFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  for (const n of nodes) {
    if (n.type === "file") result.push(n);
    if (n.children) result.push(...flattenFiles(n.children));
  }
  return result;
}
