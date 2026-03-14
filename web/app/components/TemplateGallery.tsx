"use client";

import { useState } from "react";
import { useStore } from "../store";
import { TEMPLATES, TEMPLATE_CATEGORIES, ProjectTemplate } from "../templates";
import { runStreamAgent } from "../stream-agent";
import { runMockAgent } from "../mock-agent";

const DIFFICULTY_COLORS = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function TemplateGallery() {
  const setView = useStore((s) => s.setView);
  const reset = useStore((s) => s.reset);
  const setFiles = useStore((s) => s.setFiles);
  const addToast = useStore((s) => s.addToast);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = TEMPLATES.filter((t) => {
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = async (template: ProjectTemplate) => {
    reset();
    setFiles(template.files);
    setView("workspace");
    addToast("success", "Template Loaded", `"${template.title}" — ${template.files.length} files ready`);
    // Kick off the agent with the template's prompt
    const ok = await runStreamAgent(template.prompt, {});
    if (!ok) {
      runMockAgent(template.prompt, template.id);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-border bg-surface shrink-0">
        <button
          onClick={() => setView("landing")}
          className="text-muted hover:text-foreground transition-colors text-sm"
        >
          ← Back
        </button>
        <div className="w-px h-4 bg-border" />
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-foreground">📋 Project Templates</h1>
          <p className="text-[10px] text-muted">Start with a scaffold — the agent fills in the rest</p>
        </div>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-48 px-3 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Category tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "bg-surface border border-border text-muted hover:text-foreground hover:border-accent/20"
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
            <span className="text-[10px] text-muted ml-2">
              {filtered.length} template{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Template grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-sm text-muted">No templates match your search</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="text-xs text-accent hover:text-accent/80 mt-2 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                  className={`relative rounded-xl border p-4 cursor-pointer transition-all hover-lift group ${
                    selectedTemplate?.id === template.id
                      ? "border-accent/50 bg-accent/5 shadow-lg shadow-accent/10"
                      : "border-border bg-surface hover:border-accent/30 hover:bg-surface-hover"
                  }`}
                >
                  {/* Icon + Title */}
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{template.title}</h3>
                      <p className="text-[10px] text-muted mt-0.5 line-clamp-2">{template.description}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${
                        DIFFICULTY_COLORS[template.difficulty]
                      }`}
                    >
                      {template.difficulty}
                    </span>
                    <span className="text-[9px] text-muted">
                      {countTemplateFiles(template.files)} files
                    </span>
                  </div>

                  {/* Expanded detail */}
                  {selectedTemplate?.id === template.id && (
                    <div className="mt-4 pt-3 border-t border-border space-y-3" style={{ animation: "fadeIn 0.15s ease-out" }}>
                      {/* File tree preview */}
                      <div>
                        <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1.5">File Structure</p>
                        <div className="bg-background rounded-lg p-2 text-[10px] font-mono text-muted space-y-0.5 max-h-32 overflow-y-auto">
                          {renderFileTree(template.files, 0)}
                        </div>
                      </div>

                      {/* Agent prompt preview */}
                      <div>
                        <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1.5">Agent Prompt</p>
                        <p className="text-[10px] text-muted bg-background rounded-lg p-2 line-clamp-3">
                          {template.prompt}
                        </p>
                      </div>

                      {/* Use button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseTemplate(template);
                        }}
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-accent to-accent-purple text-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        🚀 Use This Template
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function countTemplateFiles(nodes: import("../store").FileNode[]): number {
  let count = 0;
  for (const n of nodes) {
    if (n.type === "file") count++;
    if (n.children) count += countTemplateFiles(n.children);
  }
  return count;
}

function renderFileTree(nodes: import("../store").FileNode[], depth: number): JSX.Element[] {
  return nodes.flatMap((node) => {
    const indent = "  ".repeat(depth);
    const icon = node.type === "folder" ? "📁" : "📄";
    const elements = [
      <div key={node.path} className="whitespace-pre">
        {indent}{icon} {node.name}
      </div>,
    ];
    if (node.children) {
      elements.push(...renderFileTree(node.children, depth + 1));
    }
    return elements;
  });
}
