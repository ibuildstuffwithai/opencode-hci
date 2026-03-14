"use client";

import { useStore } from "../store";

export function VerificationPanel() {
  const open = useStore((s) => s.verificationOpen);
  const setOpen = useStore((s) => s.setVerificationOpen);
  const testResults = useStore((s) => s.testResults);
  const diffs = useStore((s) => s.diffs);
  const pillars = useStore((s) => s.pillars);

  if (!open || !testResults) return null;

  const totalAdditions = diffs.reduce((s, d) => s + d.additions, 0);
  const totalDeletions = diffs.reduce((s, d) => s + d.deletions, 0);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "fadeIn 0.2s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <span className="text-sm">✅</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Verification Report</h2>
              <p className="text-[10px] text-muted">Pillar 3: Proof of correctness</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground text-sm transition-colors p-1">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Test Results */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Test Results</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">{testResults.passed}</p>
                <p className="text-xs text-emerald-400/70 mt-1">Passed</p>
              </div>
              <div className={`border rounded-xl p-4 text-center ${
                testResults.failed > 0 ? "bg-red-500/10 border-red-500/20" : "bg-surface border-border"
              }`}>
                <p className={`text-2xl font-bold ${testResults.failed > 0 ? "text-red-400" : "text-muted"}`}>
                  {testResults.failed}
                </p>
                <p className="text-xs text-muted mt-1">Failed</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">{testResults.coverage || 0}%</p>
                <p className="text-xs text-blue-400/70 mt-1">Coverage</p>
              </div>
            </div>
            {/* Coverage bar */}
            {testResults.coverage !== undefined && (
              <div className="mt-3">
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      testResults.coverage >= 80 ? "bg-emerald-500" : testResults.coverage >= 60 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${testResults.coverage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Diff Summary */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Changes</h3>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-xs text-emerald-400">+{totalAdditions} additions</span>
              <span className="text-xs text-red-400">-{totalDeletions} deletions</span>
              <span className="text-xs text-muted">{diffs.length} files</span>
            </div>
            <div className="space-y-2">
              {diffs.map((d, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 bg-background rounded-lg border border-border">
                  <span className="text-xs font-mono text-foreground flex-1 truncate">{d.file}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-mono">+{d.additions}</span>
                    <span className="text-[10px] text-red-400 font-mono">-{d.deletions}</span>
                    {/* Mini bar */}
                    <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${d.additions / (d.additions + d.deletions + 1) * 100}%` }} />
                      <div className="h-full bg-red-500" style={{ width: `${d.deletions / (d.additions + d.deletions + 1) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pillar Summary */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Pillar Scores</h3>
            <div className="grid grid-cols-2 gap-3">
              {(["alignment", "steerability", "verification", "adaptability"] as const).map((key) => {
                const p = pillars[key];
                const icons = { alignment: "🎯", steerability: "🎮", verification: "✅", adaptability: "🧠" };
                const colors = {
                  alignment: "from-blue-500 to-cyan-500",
                  steerability: "from-purple-500 to-pink-500",
                  verification: "from-emerald-500 to-green-500",
                  adaptability: "from-orange-500 to-yellow-500",
                };
                return (
                  <div key={key} className="bg-background rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs">{icons[key]}</span>
                      <span className="text-xs font-semibold text-foreground capitalize">{key}</span>
                      <span className="ml-auto text-xs font-mono text-muted">{Math.round(p.score * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${colors[key]} transition-all duration-700`}
                        style={{ width: `${p.score * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted mt-1">{p.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-lg text-sm text-muted hover:text-foreground border border-border hover:bg-surface-hover transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-lg text-sm text-foreground bg-accent hover:bg-accent/90 transition-colors"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
