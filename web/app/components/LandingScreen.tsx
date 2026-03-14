"use client";

import { useState, useEffect } from "react";
import { useStore } from "../store";
import { runMockAgent } from "../mock-agent";
import { runStreamAgent } from "../stream-agent";
import { SCENARIOS } from "../scenarios";
import { listProjects, loadProject, deleteProject, loadAutoSave, clearAutoSave, SavedProject } from "../lib/persistence";

const PILLARS = [
  { icon: "🎯", name: "Alignment", desc: "Understands your intent before writing code" },
  { icon: "🎮", name: "Steerability", desc: "You stay in control — pause, redirect, branch" },
  { icon: "✅", name: "Verification", desc: "Proves correctness with tests and diffs" },
  { icon: "🧠", name: "Adaptability", desc: "Learns your style over time" },
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export function LandingScreen() {
  const setView = useStore((s) => s.setView);
  const sessions = useStore((s) => s.sessions);
  const preferences = useStore((s) => s.preferences);
  const reset = useStore((s) => s.reset);
  const setCurrentProjectId = useStore((s) => s.setCurrentProjectId);
  const addToast = useStore((s) => s.addToast);

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [autoSaveData, setAutoSaveData] = useState<{ data: any; savedAt: number } | null>(null);

  useEffect(() => {
    setSavedProjects(listProjects());
    setAutoSaveData(loadAutoSave());
  }, []);

  const handleStart = () => {
    setView("workspace");
  };

  const handleLoadProject = (project: SavedProject) => {
    reset();
    const d = project.data;
    const store = useStore.getState();
    // Restore state
    d.messages?.forEach((m: any) => store.addMessage(m.role, m.content, m));
    store.setFiles(d.files || []);
    if (d.activeFile) store.setActiveFile(d.activeFile);
    if (d.strategy) store.setStrategy(d.strategy as any);
    if (d.preferences) store.updatePreferences(d.preferences);
    if (d.activities) d.activities.forEach((a: any) => store.addActivity(a.category, a.message, a.detail));
    if (d.terminalOutput) d.terminalOutput.forEach((l: string) => store.addTerminalLine(l));
    if (d.diffs) store.setDiffs(d.diffs);
    if (d.testResults) store.setTestResults(d.testResults);
    if (d.phase) store.setPhase(d.phase as any);
    if (d.activeScenario) store.setActiveScenario(d.activeScenario);
    // Set open tabs
    (d.openTabs || []).forEach((t: string) => store.addOpenTab(t));
    store.setCurrentProjectId(project.id);
    setView("workspace");
    addToast("success", "Project Loaded", `"${project.name}" restored`);
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteProject(id);
    setSavedProjects(listProjects());
    addToast("info", "Project Deleted");
  };

  const handleRecoverAutoSave = () => {
    if (!autoSaveData) return;
    const project: SavedProject = {
      id: "autosave",
      name: "Recovered Session",
      description: "Auto-saved session",
      savedAt: autoSaveData.savedAt,
      updatedAt: autoSaveData.savedAt,
      data: autoSaveData.data,
    };
    handleLoadProject(project);
    clearAutoSave();
    setAutoSaveData(null);
  };

  const handleScenario = async (scenarioId: string, prompt: string) => {
    reset();
    setView("workspace");
    const ok = await runStreamAgent(prompt, { scenarioId });
    if (!ok) {
      runMockAgent(prompt, scenarioId);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background px-4 overflow-y-auto">
      <div className="max-w-2xl w-full space-y-10 py-12">
        {/* Hero */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center mx-auto mb-6 shadow-xl shadow-accent/20 hover-lift">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            OpenCode <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-purple">HCI</span>
          </h1>
          <p className="text-muted text-base md:text-lg max-w-md mx-auto">
            The first AI coding agent designed around <em>you</em> — not just the code.
            Built on the 4-pillar framework for human-centered interaction.
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted">
            <kbd className="px-1.5 py-0.5 bg-surface-hover rounded text-[10px]">⌘K</kbd>
            <span>Command Palette</span>
          </div>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
          {PILLARS.map((p) => (
            <div key={p.name} className="bg-surface border border-border rounded-xl p-3 text-center hover:border-accent/30 transition-all hover-lift hover:shadow-lg hover:shadow-accent/5 group">
              <span className="text-2xl group-hover:scale-110 inline-block transition-transform">{p.icon}</span>
              <p className="text-xs font-semibold text-white mt-2">{p.name}</p>
              <p className="text-[10px] text-muted mt-1">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleStart}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-purple text-white font-medium text-sm hover:opacity-90 transition-all hover:shadow-xl hover:shadow-accent/20"
          >
            Start New Session
          </button>
          <button
            onClick={() => setView("settings")}
            className="px-6 py-3 rounded-xl border border-border text-white font-medium text-sm hover:bg-surface-hover transition-colors"
          >
            ⚙️ Settings
          </button>
          <button
            onClick={() => setView("history")}
            className="px-6 py-3 rounded-xl border border-border text-white font-medium text-sm hover:bg-surface-hover transition-colors"
          >
            📊 History {sessions.length > 0 && <span className="text-accent ml-1">({sessions.length})</span>}
          </button>
        </div>

        {/* Demo Scenarios */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">🎬 Demo Scenarios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleScenario(scenario.id, scenario.prompt)}
                className="text-left p-4 rounded-xl border border-border hover:border-accent/30 bg-surface hover:bg-surface-hover transition-all group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg group-hover:scale-110 transition-transform">{scenario.icon}</span>
                  <span className="text-sm font-semibold text-white">{scenario.title}</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">{scenario.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Auto-save Recovery */}
        {autoSaveData && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-300">🔄 Unsaved Session Found</p>
                <p className="text-[10px] text-muted mt-0.5">Auto-saved {timeAgo(autoSaveData.savedAt)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { clearAutoSave(); setAutoSaveData(null); }}
                  className="px-3 py-1.5 rounded-lg text-xs text-muted hover:text-white transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleRecoverAutoSave}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                >
                  Recover
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Projects */}
        {savedProjects.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">💾 Saved Projects</h3>
            <div className="space-y-1">
              {savedProjects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => handleLoadProject(proj)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-border hover:bg-surface-hover transition-colors text-left group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white group-hover:text-accent transition-colors truncate">{proj.name}</p>
                    <p className="text-[10px] text-muted truncate">{proj.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] text-muted">{timeAgo(proj.updatedAt)}</span>
                    <button
                      onClick={(e) => handleDeleteProject(e, proj.id)}
                      className="text-[10px] text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                      title="Delete project"
                    >
                      🗑
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Coding DNA Preview */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">🧬 Your Coding DNA</h3>
            <button
              onClick={() => setView("settings")}
              className="text-[10px] text-accent hover:text-accent/80 transition-colors"
            >
              Edit →
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              preferences.preferredLanguage,
              preferences.framework,
              preferences.codeStyle,
              preferences.namingConvention,
              preferences.testingApproach,
            ].map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-1 rounded-full bg-accent/10 text-accent border border-accent/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
