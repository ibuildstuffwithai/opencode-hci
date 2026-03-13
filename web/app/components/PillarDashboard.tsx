"use client";

import { useStore, PillarScores } from "../store";

const PILLAR_CONFIG: { key: keyof PillarScores; label: string; icon: string; formula: string; color: string }[] = [
  { key: "alignment", label: "Alignment", icon: "🎯", formula: "G(H,C) = sim_Z(z_H, z_C)", color: "from-blue-500 to-cyan-500" },
  { key: "steerability", label: "Steerability", icon: "🎮", formula: "S(H,C) = E[sim_τ(τ', τ*)]", color: "from-purple-500 to-pink-500" },
  { key: "verification", label: "Verification", icon: "✅", formula: "V(H,C) = E[A(s_H, y*)]", color: "from-emerald-500 to-green-500" },
  { key: "adaptability", label: "Adaptability", icon: "🧠", formula: "A(C_k) = E[Perf(C_k) - Perf(C_0)]", color: "from-orange-500 to-yellow-500" },
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

  return (
    <div className="border-t border-border bg-surface px-6 py-3">
      <div className="grid grid-cols-4 gap-4">
        {PILLAR_CONFIG.map((cfg) => {
          const p = pillars[cfg.key];
          return (
            <div key={cfg.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors">
              {/* Status dot */}
              <div className={`w-2.5 h-2.5 rounded-full ${statusColor(p.status)} ${p.status === "yellow" ? "pulse-glow" : ""}`} />
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{cfg.icon}</span>
                  <span className="text-xs font-semibold text-white">{cfg.label}</span>
                  <span className="ml-auto text-xs font-mono text-muted">{p.score > 0 ? p.score.toFixed(2) : "—"}</span>
                </div>
                <p className="text-[10px] text-muted truncate mt-0.5">{p.detail}</p>
              </div>

              {/* Score bar */}
              <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${cfg.color} transition-all duration-700`}
                  style={{ width: `${p.score * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
