"use client";

import { useStore } from "../store";
import { exportSessionMarkdown } from "../mock-agent";

export function ControlBar() {
  const phase = useStore((s) => s.phase);
  const isPaused = useStore((s) => s.isPaused);
  const speedLevel = useStore((s) => s.speedLevel);
  const togglePause = useStore((s) => s.togglePause);
  const setSpeed = useStore((s) => s.setSpeed);
  const reset = useStore((s) => s.reset);
  const setView = useStore((s) => s.setView);
  const progressPercent = useStore((s) => s.progressPercent);
  const redirectMode = useStore((s) => s.redirectMode);
  const setRedirectMode = useStore((s) => s.setRedirectMode);
  const redirectMessage = useStore((s) => s.redirectMessage);
  const setRedirectMessage = useStore((s) => s.setRedirectMessage);
  const addToast = useStore((s) => s.addToast);
  const setVerificationOpen = useStore((s) => s.setVerificationOpen);
  const testResults = useStore((s) => s.testResults);

  const phaseLabel: Record<string, string> = {
    idle: "Ready",
    understanding: "📋 Analyzing",
    proposing: "💡 Proposing",
    coding: "⚡ Coding",
    verifying: "✅ Verifying",
    complete: "🎉 Complete",
  };

  const handleExport = () => {
    const md = exportSessionMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `opencode-session-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("success", "Session Exported", "Markdown report downloaded");
  };

  return (
    <div className="flex items-center gap-3">
      {/* Phase */}
      <span className="text-xs font-medium text-muted">{phaseLabel[phase] || phase}</span>

      {/* Mini progress */}
      {phase !== "idle" && phase !== "complete" && (
        <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Speed */}
      <div className="hidden sm:flex items-center gap-1">
        <span className="text-[10px] text-muted">Speed</span>
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => setSpeed(n)}
            className={`w-5 h-5 rounded text-[10px] font-medium transition-colors ${
              speedLevel === n
                ? "bg-accent text-white"
                : "bg-surface-hover text-muted"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Pause + Redirect (Steerability) */}
      {phase === "coding" && (
        <>
          <button
            onClick={togglePause}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              isPaused
                ? "bg-yellow-500/20 text-yellow-400 shadow-lg shadow-yellow-500/10"
                : "bg-surface-hover text-muted hover:text-white"
            }`}
          >
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
          {isPaused && !redirectMode && (
            <button
              onClick={() => setRedirectMode(true)}
              className="px-2.5 py-1 rounded text-xs font-medium bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
            >
              🔄 Redirect
            </button>
          )}
          {isPaused && redirectMode && (
            <div className="flex items-center gap-1">
              <input
                value={redirectMessage}
                onChange={(e) => setRedirectMessage(e.target.value)}
                placeholder="New direction..."
                className="bg-surface border border-accent/30 rounded px-2 py-1 text-xs text-white placeholder:text-muted outline-none w-40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setRedirectMode(false);
                    setRedirectMessage("");
                  }
                }}
              />
              <button
                onClick={() => {
                  if (redirectMessage.trim()) {
                    // The mock-agent checks for redirect in its pause loop
                  }
                }}
                className="px-2 py-1 rounded text-xs bg-accent text-white"
              >
                Go
              </button>
            </div>
          )}
        </>
      )}

      {/* Verification */}
      {testResults && phase === "complete" && (
        <button
          onClick={() => setVerificationOpen(true)}
          className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
        >
          ✅ Report
        </button>
      )}

      {/* Export */}
      {phase === "complete" && (
        <button
          onClick={handleExport}
          className="px-2.5 py-1 rounded text-xs text-muted hover:text-white bg-surface-hover transition-colors"
        >
          📤 Export
        </button>
      )}

      {/* Reset */}
      <button
        onClick={() => reset()}
        className="px-2.5 py-1 rounded text-xs text-muted hover:text-white bg-surface-hover transition-colors"
      >
        Reset
      </button>

      {/* Home */}
      <button
        onClick={() => { reset(); setView("landing"); }}
        className="px-2 py-1 rounded text-xs text-muted hover:text-white transition-colors"
      >
        🏠
      </button>
    </div>
  );
}
