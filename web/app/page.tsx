"use client";

import { useStore } from "./store";
import { LandingScreen } from "./components/LandingScreen";
import { ChatPanel } from "./components/ChatPanel";
import { WorkspacePanel } from "./components/WorkspacePanel";
import { ActivityPanel } from "./components/ActivityPanel";
import { PillarDashboard } from "./components/PillarDashboard";
import { ControlBar } from "./components/ControlBar";
import { ToastContainer } from "./components/ToastContainer";
import { CommandPalette } from "./components/CommandPalette";
import { VerificationPanel } from "./components/VerificationPanel";
import { SettingsPage } from "./components/SettingsPage";
import { HistoryPage } from "./components/HistoryPage";
import { useState, useEffect, useCallback } from "react";

type RightTab = "activity" | "workspace";

export default function Home() {
  const view = useStore((s) => s.view);
  const phase = useStore((s) => s.phase);
  const setCommandPaletteOpen = useStore((s) => s.setCommandPaletteOpen);
  const commandPaletteOpen = useStore((s) => s.commandPaletteOpen);
  const mobilePanel = useStore((s) => s.mobilePanel);
  const setMobilePanel = useStore((s) => s.setMobilePanel);
  const [rightTab, setRightTab] = useState<RightTab>("activity");

  // Global keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd+K or Ctrl+K for command palette
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setCommandPaletteOpen(!commandPaletteOpen);
    }
    // Escape to close panels
    if (e.key === "Escape") {
      setCommandPaletteOpen(false);
    }
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Toasts + Command Palette are global
  const globalOverlays = (
    <>
      <ToastContainer />
      <CommandPalette />
      <VerificationPanel />
    </>
  );

  if (view === "landing") {
    return (
      <>
        {globalOverlays}
        <LandingScreen />
      </>
    );
  }

  if (view === "settings") {
    return (
      <>
        {globalOverlays}
        <SettingsPage />
      </>
    );
  }

  if (view === "history") {
    return (
      <>
        {globalOverlays}
        <HistoryPage />
      </>
    );
  }

  return (
    <>
      {globalOverlays}
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-2.5 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-accent/20">
              OC
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-white">OpenCode HCI</h1>
              <p className="text-[10px] text-muted">Human-Centered Coding Agent</p>
            </div>
          </div>
          <ControlBar />
        </header>

        {/* Main Content — Desktop */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Chat — hidden on mobile when viewing other panels */}
          <div className={`w-full md:w-[420px] md:min-w-[320px] border-r border-border flex flex-col ${
            mobilePanel !== "chat" ? "hidden md:flex" : "flex"
          }`}>
            <ChatPanel />
          </div>

          {/* Right: Activity + Workspace — Desktop only OR mobile panel */}
          <div className={`flex-1 flex-col overflow-hidden ${
            mobilePanel === "chat" ? "hidden md:flex" : "flex"
          }`}>
            {/* Right panel tabs — Desktop */}
            <div className="hidden md:flex items-center border-b border-border px-4 bg-surface">
              <button
                onClick={() => setRightTab("activity")}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                  rightTab === "activity"
                    ? "text-white border-accent"
                    : "text-muted border-transparent hover:text-white"
                }`}
              >
                ⚡ Activity Feed
              </button>
              <button
                onClick={() => setRightTab("workspace")}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                  rightTab === "workspace"
                    ? "text-white border-accent"
                    : "text-muted border-transparent hover:text-white"
                }`}
              >
                💻 Workspace
              </button>
              {phase !== "idle" && (
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-muted">Live</span>
                </div>
              )}
            </div>

            {/* Mobile: show based on mobilePanel */}
            <div className="flex-1 overflow-hidden md:hidden">
              {mobilePanel === "activity" && <ActivityPanel />}
              {mobilePanel === "workspace" && <WorkspacePanel />}
            </div>

            {/* Desktop: show based on rightTab */}
            <div className="hidden md:flex flex-1 overflow-hidden">
              {rightTab === "activity" ? <ActivityPanel /> : <WorkspacePanel />}
            </div>
          </div>
        </div>

        {/* Bottom: Pillars — hidden on very small screens */}
        <div className="hidden sm:block">
          <PillarDashboard />
        </div>

        {/* Mobile Bottom Nav */}
        <div className="sm:hidden border-t border-border bg-surface">
          <div className="flex items-center justify-around py-2">
            {([
              { key: "chat" as const, icon: "💬", label: "Chat" },
              { key: "activity" as const, icon: "⚡", label: "Activity" },
              { key: "workspace" as const, icon: "💻", label: "Code" },
            ]).map((item) => (
              <button
                key={item.key}
                onClick={() => setMobilePanel(item.key)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
                  mobilePanel === item.key
                    ? "text-accent"
                    : "text-muted"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[9px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
