'use client';

/**
 * Work Panel - Right panel showing real-time agent activity
 * File tree, code editor (Monaco), terminal output, verification results
 */

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAgentStore } from '@/store/agent-store';
import type { FileNode, VerificationResult } from '@/types';

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// ── File Tree ───────────────────────────────────────────────────────────────

function FileTree({ files, onSelect, activeFile }: {
  files: FileNode[];
  onSelect: (path: string) => void;
  activeFile: string | null;
}) {
  // Build tree structure from flat paths
  const tree = buildTree(files);

  return (
    <div className="py-2">
      {tree.map((node) => (
        <FileTreeNode key={node.path} node={node} depth={0} onSelect={onSelect} activeFile={activeFile} />
      ))}
    </div>
  );
}

function buildTree(files: FileNode[]): FileNode[] {
  const root: FileNode[] = [];
  const dirs: Record<string, FileNode> = {};

  for (const file of files) {
    const parts = file.path.split('/');
    if (parts.length === 1) {
      root.push(file);
    } else {
      const dirPath = parts.slice(0, -1).join('/');
      if (!dirs[dirPath]) {
        dirs[dirPath] = {
          name: parts[parts.length - 2],
          path: dirPath,
          type: 'directory',
          children: [],
        };
        root.push(dirs[dirPath]);
      }
      dirs[dirPath].children!.push(file);
    }
  }

  return root;
}

function FileTreeNode({ node, depth, onSelect, activeFile }: {
  node: FileNode;
  depth: number;
  onSelect: (path: string) => void;
  activeFile: string | null;
}) {
  const [expanded, setExpanded] = useState(true);
  const isActive = node.path === activeFile;
  const isDir = node.type === 'directory';

  const icon = isDir
    ? (expanded ? '📂' : '📁')
    : node.language === 'typescript' ? '📄' : node.language === 'json' ? '⚙️' : '📝';

  return (
    <div>
      <button
        onClick={() => isDir ? setExpanded(!expanded) : onSelect(node.path)}
        className={`w-full text-left flex items-center gap-1.5 px-3 py-1 text-xs hover:bg-white/5 transition-colors ${
          isActive ? 'bg-indigo-500/10 text-indigo-300' : 'text-white/50'
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <span className="text-[10px]">{icon}</span>
        <span className="truncate">{node.name}</span>
      </button>
      {isDir && expanded && node.children?.map((child) => (
        <FileTreeNode key={child.path} node={child} depth={depth + 1} onSelect={onSelect} activeFile={activeFile} />
      ))}
    </div>
  );
}

// ── Terminal Output ─────────────────────────────────────────────────────────

function TerminalView() {
  const terminal = useAgentStore((s) => s.currentTask?.terminal ?? []);

  return (
    <div className="font-mono text-xs p-3 space-y-0.5 overflow-y-auto h-full bg-black/30">
      {terminal.length === 0 && (
        <p className="text-white/20">Terminal output will appear here...</p>
      )}
      {terminal.map((line) => (
        <div key={line.id} className={`${
          line.type === 'command' ? 'text-emerald-400' :
          line.type === 'error' ? 'text-red-400' :
          line.type === 'info' ? 'text-indigo-400' :
          'text-white/50'
        }`}>
          {line.text}
        </div>
      ))}
    </div>
  );
}

// ── Verification Results ────────────────────────────────────────────────────

function VerificationView({ results }: { results: VerificationResult[] }) {
  if (results.length === 0) return null;

  return (
    <div className="p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">✅ Verification Results</p>
      {results.map((v, i) => (
        <div key={i} className={`rounded-lg border p-2.5 ${
          v.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${v.passed ? 'text-emerald-400' : 'text-red-400'}`}>
              {v.passed ? '✓' : '✗'}
            </span>
            <span className="text-xs font-medium text-white/70">{v.title}</span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">{v.content}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main Work Panel ─────────────────────────────────────────────────────────

type Tab = 'editor' | 'terminal' | 'verification';

export default function WorkPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const task = useAgentStore((s) => s.currentTask);
  const activeFilePath = useAgentStore((s) => s.activeFilePath);
  const setActiveFile = useAgentStore((s) => s.setActiveFile);

  const files = task?.files ?? [];
  const verifications = task?.verifications ?? [];
  const activeFile = files.find((f) => f.path === activeFilePath);

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'editor', label: 'Editor' },
    { key: 'terminal', label: 'Terminal', badge: task?.terminal.length },
    { key: 'verification', label: 'Verification', badge: verifications.length },
  ];

  return (
    <div className="flex-1 flex h-full bg-[#0e0e10]">
      {/* File tree sidebar */}
      <div className="w-48 border-r border-white/5 overflow-y-auto">
        <div className="px-3 py-2 border-b border-white/5">
          <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">Files</p>
        </div>
        {files.length === 0 ? (
          <p className="px-3 py-4 text-xs text-white/20 text-center">No files yet</p>
        ) : (
          <FileTree files={files} onSelect={setActiveFile} activeFile={activeFilePath} />
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-xs font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/10 text-[9px]">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'editor' && (
            activeFile ? (
              <MonacoEditor
                height="100%"
                language={activeFile.language || 'typescript'}
                value={activeFile.content || ''}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  padding: { top: 12 },
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white/20 text-sm">
                {files.length > 0 ? 'Select a file to view' : 'Files will appear here as the agent works'}
              </div>
            )
          )}

          {activeTab === 'terminal' && <TerminalView />}
          {activeTab === 'verification' && <VerificationView results={verifications} />}
        </div>
      </div>
    </div>
  );
}
