"use client";

import { useStore } from "../store";

export function TaskUnderstandingCard() {
  const task = useStore((s) => s.taskUnderstanding);
  const confirmAlignment = useStore((s) => s.confirmAlignment);

  if (!task) return null;

  return (
    <div className="animate-fade-in bg-surface border border-accent/30 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center text-accent text-xs">📋</div>
        <h3 className="text-sm font-semibold text-white">Task Understanding</h3>
        <span className="ml-auto text-xs text-accent font-medium px-2 py-0.5 rounded-full bg-accent/10">Pillar 1: Alignment</span>
      </div>

      <div>
        <p className="text-xs font-medium text-muted mb-1">Requirements</p>
        <ul className="space-y-1">
          {task.requirements.map((r, i) => (
            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span> {r}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium text-muted mb-1">Assumptions</p>
        <ul className="space-y-1">
          {task.assumptions.map((a, i) => (
            <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5">◆</span> {a}
            </li>
          ))}
        </ul>
      </div>

      {task.questions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted mb-1">Questions</p>
          <ul className="space-y-1">
            {task.questions.map((q, i) => (
              <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">?</span> {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={confirmAlignment}
        className="w-full mt-2 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
      >
        ✓ Looks correct — proceed
      </button>
    </div>
  );
}
