"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStore, FileNode } from "../store";
import { ConfirmDialog } from "./ConfirmDialog";

function InlineInput({
  initialValue,
  onSubmit,
  onCancel,
  placeholder,
}: {
  initialValue?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState(initialValue || "");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    if (initialValue) ref.current?.select();
  }, [initialValue]);

  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && value.trim()) onSubmit(value.trim());
        if (e.key === "Escape") onCancel();
      }}
      onBlur={() => {
        if (value.trim()) onSubmit(value.trim());
        else onCancel();
      }}
      placeholder={placeholder}
      className="w-full bg-surface border border-accent/50 text-foreground text-xs px-1.5 py-0.5 rounded outline-none"
    />
  );
}

function ContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: { label: string; icon: string; action: () => void; danger?: boolean }[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-[#1a1a20] border border-border rounded-lg shadow-xl py-1 min-w-[160px] animate-fade-in"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => {
            item.action();
            onClose();
          }}
          className={`flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs transition-colors ${
            item.danger
              ? "text-red-400 hover:bg-red-500/10"
              : "text-muted hover:text-foreground hover:bg-surface-hover"
          }`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function FileTreeItem({
  node,
  depth = 0,
}: {
  node: FileNode;
  depth?: number;
}) {
  const [open, setOpen] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const activeFile = useStore((s) => s.activeFile);
  const setActiveFile = useStore((s) => s.setActiveFile);
  const deleteFile = useStore((s) => s.deleteFile);
  const renameFile = useStore((s) => s.renameFile);
  const addFile = useStore((s) => s.addFile);
  const addToast = useStore((s) => s.addToast);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const menuItems =
    node.type === "folder"
      ? [
          { label: "New File", icon: "📄", action: () => { setCreating("file"); setOpen(true); } },
          { label: "New Folder", icon: "📁", action: () => { setCreating("folder"); setOpen(true); } },
          { label: "Rename", icon: "✏️", action: () => setRenaming(true) },
          {
            label: "Delete",
            icon: "🗑️",
            danger: true,
            action: () => setConfirmDelete(true),
          },
        ]
      : [
          { label: "Rename", icon: "✏️", action: () => setRenaming(true) },
          {
            label: "Delete",
            icon: "🗑️",
            danger: true,
            action: () => setConfirmDelete(true),
          },
        ];

  if (node.type === "folder") {
    return (
      <div>
        {renaming ? (
          <div style={{ paddingLeft: `${depth * 14 + 8}px` }} className="py-0.5 px-2">
            <InlineInput
              initialValue={node.name}
              onSubmit={(val) => {
                renameFile(node.path, val);
                setRenaming(false);
              }}
              onCancel={() => setRenaming(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setOpen(!open)}
            onContextMenu={handleContextMenu}
            className="flex items-center gap-1.5 w-full text-left px-2 py-1 text-xs text-muted hover:text-foreground hover:bg-surface-hover transition-colors group"
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
          >
            <span className="text-[10px] w-3 text-center">
              {open ? "▼" : "▶"}
            </span>
            <span className="text-xs">{open ? "📂" : "📁"}</span>
            <span className="font-medium flex-1">{node.name}</span>
            <span
              className="opacity-0 group-hover:opacity-100 text-[10px] text-muted hover:text-foreground px-1"
              onClick={(e) => {
                e.stopPropagation();
                setCreating("file");
                setOpen(true);
              }}
              title="New file"
            >
              +
            </span>
          </button>
        )}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={menuItems}
            onClose={() => setContextMenu(null)}
          />
        )}
        <ConfirmDialog
          open={confirmDelete}
          title={`Delete ${node.type === "folder" ? "folder" : "file"}?`}
          message={`"${node.name}" ${node.type === "folder" ? "and all its contents " : ""}will be permanently removed.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => {
            deleteFile(node.path);
            addToast("info", `Deleted ${node.type}: ${node.name}`);
            setConfirmDelete(false);
          }}
          onCancel={() => setConfirmDelete(false)}
        />
        {open && (
          <>
            {node.children?.map((c) => (
              <FileTreeItem key={c.path} node={c} depth={depth + 1} />
            ))}
            {creating && (
              <div
                style={{ paddingLeft: `${(depth + 1) * 14 + 8}px` }}
                className="py-0.5 px-2 flex items-center gap-1.5"
              >
                <span className="text-xs">
                  {creating === "folder" ? "📁" : "📄"}
                </span>
                <InlineInput
                  placeholder={creating === "folder" ? "folder name" : "filename.ext"}
                  onSubmit={(val) => {
                    addFile(node.path, val, creating);
                    setCreating(null);
                    addToast("success", `Created ${creating}: ${val}`);
                  }}
                  onCancel={() => setCreating(null)}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  const ext = node.name.split(".").pop() || "";
  const icon =
    ext === "html"
      ? "🌐"
      : ext === "css"
      ? "🎨"
      : ext === "js"
      ? "⚡"
      : ext === "ts" || ext === "tsx"
      ? "📘"
      : ext === "json"
      ? "📋"
      : "📄";

  return (
    <>
      {renaming ? (
        <div style={{ paddingLeft: `${depth * 14 + 8}px` }} className="py-0.5 px-2">
          <InlineInput
            initialValue={node.name}
            onSubmit={(val) => {
              renameFile(node.path, val);
              setRenaming(false);
            }}
            onCancel={() => setRenaming(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setActiveFile(node.path)}
          onContextMenu={handleContextMenu}
          className={`flex items-center gap-1.5 w-full text-left px-2 py-1 text-xs transition-colors group ${
            activeFile === node.path
              ? "text-foreground bg-accent/15 border-r-2 border-accent"
              : node.touched
              ? "text-emerald-400 hover:text-foreground hover:bg-surface-hover"
              : "text-muted hover:text-foreground hover:bg-surface-hover"
          }`}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          <span className="text-xs">{node.touched ? "✏️" : icon}</span>
          <span className="flex-1">{node.name}</span>
        </button>
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={menuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete file?"
        message={`"${node.name}" will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          deleteFile(node.path);
          addToast("info", `Deleted file: ${node.name}`);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

export function FileTree() {
  const files = useStore((s) => s.files);
  const addFile = useStore((s) => s.addFile);
  const addToast = useStore((s) => s.addToast);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);

  return (
    <div className="flex flex-col h-full">
      {/* Header with actions */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border shrink-0">
        <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
          Files
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCreating("file")}
            className="w-5 h-5 flex items-center justify-center rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            title="New File"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M9 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V5L9 1zm0 1.5L12.5 6H9V2.5zM7.5 8.5v2h-1v-2h-2v-1h2v-2h1v2h2v1h-2z" />
            </svg>
          </button>
          <button
            onClick={() => setCreating("folder")}
            className="w-5 h-5 flex items-center justify-center rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            title="New Folder"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14 4H8l-1-1H2a1 1 0 00-1 1v8a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1zm-3 5.5h-1.5V11h-1V9.5H7v-1h1.5V7h1v1.5H11v1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto py-1">
        {files.length === 0 && !creating ? (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <div className="text-2xl mb-2 opacity-30">📂</div>
              <p className="text-[11px] text-muted">No files yet</p>
              <p className="text-[10px] text-muted mt-1">
                Ask the AI to build something
              </p>
              <p className="text-[10px] text-muted mt-0.5">
                or right-click to create files
              </p>
            </div>
          </div>
        ) : (
          <>
            {files.map((f) => (
              <FileTreeItem key={f.path} node={f} />
            ))}
          </>
        )}
        {creating && (
          <div className="py-0.5 px-2 flex items-center gap-1.5">
            <span className="text-xs">
              {creating === "folder" ? "📁" : "📄"}
            </span>
            <InlineInput
              placeholder={creating === "folder" ? "folder name" : "filename.ext"}
              onSubmit={(val) => {
                addFile(null, val, creating);
                setCreating(null);
                addToast("success", `Created ${creating}: ${val}`);
              }}
              onCancel={() => setCreating(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
