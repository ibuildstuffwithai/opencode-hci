"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { saveProject, getProjectData } from "../lib/persistence";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SaveProjectModal({ open, onClose }: Props) {
  const state = useStore.getState();
  const addToast = useStore((s) => s.addToast);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const setCurrentProjectId = useStore((s) => s.setCurrentProjectId);
  const messages = useStore((s) => s.messages);
  const files = useStore((s) => s.files);

  const defaultName = messages.find((m) => m.role === "user")?.content.slice(0, 60) || "Untitled Project";
  const [name, setName] = useState(defaultName);
  const [desc, setDesc] = useState(`${files.length} files`);

  useEffect(() => {
    if (open) {
      setName(messages.find((m) => m.role === "user")?.content.slice(0, 60) || "Untitled Project");
      setDesc(`${files.length} files`);
    }
  }, [open, messages, files]);

  if (!open) return null;

  const handleSave = () => {
    const data = getProjectData(useStore.getState());
    const project = saveProject(name, desc, data, currentProjectId || undefined);
    setCurrentProjectId(project.id);
    addToast("success", "Project Saved", `"${name}" saved successfully`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-scale-in" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-white mb-4">💾 Save Project</h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted block mb-1">Project Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent transition-colors"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Description (optional)</label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-accent to-accent-purple text-white hover:opacity-90 transition-opacity"
          >
            {currentProjectId ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
