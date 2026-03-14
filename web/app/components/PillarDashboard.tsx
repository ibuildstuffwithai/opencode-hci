"use client";

import { useState } from "react";
import { useStore, PillarScores } from "../store";

interface PillarConfig {
  key: keyof PillarScores;
  label: string;
  icon: string;
  formula: string;
  color: string;
  description: string;
}

const PILLAR_CONFIG: PillarConfig[] = [
  { key: "alignment", label: "Alignment", icon: "🎯", formula: "G(H,C) = sim_Z(z_H, z_C)", color: "from-blue-500 to-cyan-500", description: "How well the agent understands your intent" },
  { key: "steerability", label: "Steerability", icon: "🎮", formula: "S(H,C) = E[sim_τ(τ', τ*)]", color: "from-purple-500 to-pink-500", description: "Your ability to redirect the agent mid-task" },
  { key: "verification", label: "Verification", icon: "✅", formula: "V(H,C) = E[A(s_H, y*)]", color: "from-emerald-500 to-green-500", description: "Can you trust the output?" },
  { key: "adaptability", label: "Adaptability", icon: "🧠", formula: "A(C_k) = E[Perf(C_k) - Perf(C_0)]", color: "from-orange-500 to-yellow-500", description: "Does the agent learn your preferences?" },
];

const statusColor = (status: string) => {
  switch (status) {
    case "green": return "bg-green-500";
    case "yellow": return "bg-yellow-500";
    case "red": return "bg-red-500";
    default: return "bg-gray-600";
  }
};

export function PillarDashboard() {
  const pillars = useStore((s) => s.pillars);
  const preferences = useStore((s) => s.preferences);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="border-t border-border bg-surface">
      <div className="px-4 md:px-6 py-2.5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PILLAR_CONFIG.map((cfg) => {
            const p = pillars[cfg.key];
            const isExpanded = expanded === cfg.key;
            return (
              <div key={cfg.key}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : cfg.key)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface-hover transition-colors text-left"
                >
                  <div className={`w-2 h-2 rounded-full ${statusColor(p.status)} ${p.status === "yellow" ? "pulse-glow" : ""} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{cfg.icon}</span>
                      <span className="text-xs font-semibold text-foreground">{cfg.label}</span>
                      <span className="ml-auto text-xs font-mono text-muted">
                        {p.score > 0 ? Math.round(p.score * 100) + "%" : "—"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted truncate mt-0.5">{p.detail}</p>
                  </div>
                  <div className="w-14 h-1.5 bg-gray-800 rounded-full overflow-hidden shrink-0">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${cfg.color} transition-all duration-700`}
                      style={{ width: `${p.score * 100}%` }}
                    />
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="mt-1 mx-2 p-3 bg-background rounded-lg border border-border animate-fade-in">
                    <p className="text-[10px] text-muted mb-1">{cfg.description}</p>
                    <p className="text-[10px] font-mono text-accent">{cfg.formula}</p>
                    {cfg.key === "adaptability" && preferences.learnedPatterns.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[10px] text-muted font-semibold mb-1">Your Coding DNA</p>
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-gray-400">Naming: {preferences.namingConvention}</p>
                          <p className="text-[10px] text-gray-400">Style: {preferences.codeStyle}</p>
                          <p className="text-[10px] text-gray-400">Framework: {preferences.framework}</p>
                          <p className="text-[10px] text-gray-400">Testing: {preferences.testingApproach}</p>
                          <p className="text-[10px] text-gray-400">Interactions: {preferences.interactionCount}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
