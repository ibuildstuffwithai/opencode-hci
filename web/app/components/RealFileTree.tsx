"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "../store";

const OPENCODE_PROXY = "/api/opencode";

interface RealFileNode {
  name: string;
  type: "file" | "directory";
  path: string;
  size?: number;
}

interface TreeNode extends RealFileNode {
  children?: TreeNode[];
  expanded?: boolean;
  loaded?: boolean;
  depth: number;
}

export function RealFileTree() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [rootDir, setRootDir] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const setActiveFile = useStore((s) => s.setActiveFile);
  const setActiveFileContent = useStore((s) => s.setActiveFileContent);
  const addOpenTab = useStore((s) => s.addOpenTab);
  const activeFile = useStore((s) => s.activeFile);

  // Load root directory
  const loadRoot = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const pathRes = await fetch(`${OPENCODE_PROXY}/path`);
      if (!pathRes.ok) {
        setError("OpenCode server not available");
        setLoading(false);
        return;
      }
      const pathInfo = (await pathRes.json()) as { directory: string };
      setRootDir(pathInfo.directory);

      const filesRes = await fetch(`${OPENCODE_PROXY}/file?path=${encodeURIComponent(pathInfo.directory)}`);
      if (!filesRes.ok) {
        setError("Failed to load files");
        setLoading(false);
        return;
      }
      const files = (await filesRes.json()) as RealFileNode[];

      const nodes: TreeNode[] = files
        .filter((f) => !f.name.startsWith(".") && f.name !== "node_modules" && f.name !== ".git")
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
          return a.name.localeCompare(b.name);
        })
        .map((f) => ({
          ...f,
          depth: 0,
          expanded: false,
          loaded: false,
        }));

      setTree(nodes);
      setLoading(false);
    } catch {
      setError("Cannot connect to OpenCode server");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoot();
  }, [loadRoot]);

  // Expand/collapse directory
  const toggleDir = useCallback(
    async (path: string) => {
      setTree((prev) => {
        const toggle = (nodes: TreeNode[]): TreeNode[] =>
          nodes.map((n) => {
            if (n.path === path) {
              return { ...n, expanded: !n.expanded };
            }
            if (n.children) {
              return { ...n, children: toggle(n.children) };
            }
            return n;
          });
        return toggle(prev);
      });

      // Load children if not yet loaded
      const findNode = (nodes: TreeNode[], p: string): TreeNode | undefined => {
        for (const n of nodes) {
          if (n.path === p) return n;
          if (n.children) {
            const found = findNode(n.children, p);
            if (found) return found;
          }
        }
        return undefined;
      };

      const node = findNode(tree, path);
      if (node && !node.loaded) {
        try {
          const res = await fetch(`${OPENCODE_PROXY}/file?path=${encodeURIComponent(path)}`);
          if (res.ok) {
            const children = (await res.json()) as RealFileNode[];
            const childNodes: TreeNode[] = children
              .filter((f) => !f.name.startsWith(".") && f.name !== "node_modules")
              .sort((a, b) => {
                if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
                return a.name.localeCompare(b.name);
              })
              .map((f) => ({
                ...f,
                depth: (node.depth || 0) + 1,
                expanded: false,
                loaded: false,
              }));

            setTree((prev) => {
              const addChildren = (nodes: TreeNode[]): TreeNode[] =>
                nodes.map((n) => {
                  if (n.path === path) {
                    return { ...n, children: childNodes, loaded: true, expanded: true };
                  }
                  if (n.children) {
                    return { ...n, children: addChildren(n.children) };
                  }
                  return n;
                });
              return addChildren(prev);
            });
          }
        } catch {
          // Silent fail
        }
      }
    },
    [tree]
  );

  // Open file
  const openFile = useCallback(
    async (path: string) => {
      try {
        const res = await fetch(`${OPENCODE_PROXY}/file/content?path=${encodeURIComponent(path)}`);
        if (res.ok) {
          const data = (await res.json()) as { content: string; path: string };
          setActiveFile(path);
          setActiveFileContent(data.content);
          addOpenTab(path);
        }
      } catch {
        // Silent fail
      }
    },
    [setActiveFile, setActiveFileContent, addOpenTab]
  );

  // Search files
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${OPENCODE_PROXY}/find/file?query=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const results = (await res.json()) as string[];
          setSearchResults(results);
        }
      } catch {
        // Silent fail
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const renderNode = (node: TreeNode): JSX.Element => {
    const isDir = node.type === "directory";
    const isActive = activeFile === node.path;
    const indent = (node.depth || 0) * 12;

    return (
      <div key={node.path}>
        <button
          onClick={() => (isDir ? toggleDir(node.path) : openFile(node.path))}
          className={`w-full text-left px-2 py-0.5 text-xs flex items-center gap-1.5 hover:bg-white/[0.06] transition-colors ${
            isActive ? "bg-indigo-500/20 text-indigo-300" : "text-foreground/70"
          }`}
          style={{ paddingLeft: `${8 + indent}px` }}
        >
          <span className="text-[10px] w-3 text-center flex-shrink-0">
            {isDir ? (node.expanded ? "▾" : "▸") : ""}
          </span>
          <span className="flex-shrink-0">{getIcon(node.name, isDir)}</span>
          <span className="truncate">{node.name}</span>
        </button>
        {isDir && node.expanded && node.children && (
          <div>{node.children.map(renderNode)}</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-3 text-xs text-foreground/40">
        <div className="animate-pulse">Loading file tree...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3">
        <div className="text-xs text-amber-400/80 mb-2">{error}</div>
        <button
          onClick={loadRoot}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-wider text-foreground/40 mb-1.5">
          {rootDir.split("/").pop() || "Project"}
        </div>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files..."
          className="w-full bg-white/[0.06] border border-white/10 rounded px-2 py-1 text-xs text-foreground/80 placeholder:text-foreground/30 outline-none focus:border-indigo-500/50"
        />
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="border-b border-white/10 max-h-40 overflow-y-auto">
          {searchResults.map((path) => (
            <button
              key={path}
              onClick={() => {
                openFile(path);
                setSearchQuery("");
              }}
              className="w-full text-left px-3 py-1 text-xs text-foreground/70 hover:bg-white/[0.06] truncate"
            >
              {path.replace(rootDir + "/", "")}
            </button>
          ))}
        </div>
      )}

      {/* File tree */}
      <div className="flex-1 overflow-y-auto py-1">{tree.map(renderNode)}</div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-white/10 text-[10px] text-foreground/30">
        {tree.length} items • Real filesystem
      </div>
    </div>
  );
}

function getIcon(name: string, isDir: boolean): string {
  if (isDir) return "📁";
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
      return "🔷";
    case "js":
    case "jsx":
      return "🟨";
    case "json":
      return "📋";
    case "md":
      return "📝";
    case "css":
      return "🎨";
    case "html":
      return "🌐";
    case "svg":
    case "png":
    case "jpg":
      return "🖼️";
    default:
      return "📄";
  }
}
