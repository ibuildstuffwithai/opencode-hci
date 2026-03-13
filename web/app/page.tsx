"use client";

import { ChatPanel } from "./components/ChatPanel";
import { WorkspacePanel } from "./components/WorkspacePanel";
import { PillarDashboard } from "./components/PillarDashboard";
import { ControlBar } from "./components/ControlBar";

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center text-white font-bold text-sm">
            OC
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">OpenCode HCI</h1>
            <p className="text-xs text-muted">Human-Centered Coding Agent</p>
          </div>
        </div>
        <ControlBar />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat */}
        <div className="w-[420px] min-w-[320px] border-r border-border flex flex-col">
          <ChatPanel />
        </div>

        {/* Right: Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <WorkspacePanel />
        </div>
      </div>

      {/* Bottom: Pillars */}
      <PillarDashboard />
    </div>
  );
}
