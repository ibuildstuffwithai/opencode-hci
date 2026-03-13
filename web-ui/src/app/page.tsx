'use client';

/**
 * OpenCode HCI - Main Page
 * Three-panel layout: Chat | Work Area | Pillar Dashboard
 */

import ChatPanel from '@/components/ChatPanel';
import WorkPanel from '@/components/WorkPanel';
import PillarPanel from '@/components/PillarPanel';

export default function Home() {
  return (
    <main className="h-screen flex overflow-hidden">
      {/* Left: Chat/Prompt Panel */}
      <div className="w-[380px] min-w-[320px] border-r border-white/5 flex flex-col">
        <ChatPanel />
      </div>

      {/* Center: Work Area (File tree + Editor + Terminal) */}
      <div className="flex-1 flex flex-col min-w-0">
        <WorkPanel />
      </div>

      {/* Right: 4-Pillar Dashboard */}
      <PillarPanel />
    </main>
  );
}
