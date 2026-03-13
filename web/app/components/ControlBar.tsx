"use client";

import { useStore } from "../store";

export function ControlBar() {
  const phase = useStore((s) => s.phase);
  const isPaused = useStore((s) => s.isPaused);
  const speedLevel = useStore((s) => s.speedLevel);
  const detailLevel = useStore((s) => s.detailLevel);
  const togglePause = useStore((s) => s.togglePause);
  const setSpeed = useStore((s) => s.setSpeed);
  const setDetail = useStore((s) => s.setDetail);
  const reset = useStore((s) => s.reset);

  const phaseLabel: Record<string, string> = {
    idle: "Ready",
    understanding: "📋 Analyzing",
    proposing: "💡 Proposing",
    coding: "⚡ Coding",
    verifying: "✅ Verifying",
    complete: "🎉 Complete",
  };

  return (
    <div className="flex items-center gap-4">
      {/* Phase */}
      <span className="text-xs font-medium text-muted">
        {phaseLabel[phase] || phase}
      </span>

      {/* Speed */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-muted">Speed</span>
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => setSpeed(n)}
            className={`w-5 h-5 rounded text-[10px] font-medium transition-colors ${
              speedLevel === n ? "bg-accent text-white" : "bg-surface-hover text-muted"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Detail */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-muted">Detail</span>
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => setDetail(n)}
            className={`w-5 h-5 rounded text-[10px] font-medium transition-colors ${
              detailLevel === n ? "bg-accent-purple text-white" : "bg-surface-hover text-muted"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Pause */}
      {phase === "coding" && (
        <button
          onClick={togglePause}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            isPaused ? "bg-yellow-500/20 text-yellow-400" : "bg-surface-hover text-muted hover:text-white"
          }`}
        >
          {isPaused ? "▶ Resume" : "⏸ Pause"}
        </button>
      )}

      {/* Reset */}
      <button
        onClick={reset}
        className="px-2.5 py-1 rounded text-xs text-muted hover:text-white bg-surface-hover transition-colors"
      >
        Reset
      </button>
    </div>
  );
}
