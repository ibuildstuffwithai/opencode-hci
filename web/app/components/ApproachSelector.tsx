"use client";

import { useStore } from "../store";

export function ApproachSelector() {
  const approaches = useStore((s) => s.approaches);
  const selected = useStore((s) => s.selectedApproach);
  const selectApproach = useStore((s) => s.selectApproach);

  return (
    <div className="animate-fade-in space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-accent-purple font-medium px-2 py-0.5 rounded-full bg-purple-500/10">
          🎮 Steerability — Choose your approach
        </span>
      </div>
      {approaches.map((a) => (
        <button
          key={a.id}
          onClick={() => selectApproach(a.id)}
          className={`w-full text-left p-3 rounded-xl border transition-all ${
            selected === a.id
              ? "border-accent bg-accent/10"
              : "border-border bg-surface hover:bg-surface-hover"
          }`}
        >
          <p className="text-sm font-medium text-white">{a.title}</p>
          <p className="text-xs text-muted mt-0.5">{a.description}</p>
          <div className="flex gap-4 mt-2">
            <div className="flex-1">
              {a.pros.map((p, i) => (
                <p key={i} className="text-xs text-green-400">
                  + {p}
                </p>
              ))}
            </div>
            <div className="flex-1">
              {a.cons.map((c, i) => (
                <p key={i} className="text-xs text-red-400">
                  - {c}
                </p>
              ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
