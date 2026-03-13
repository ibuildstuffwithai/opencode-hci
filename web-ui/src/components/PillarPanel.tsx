'use client';

/**
 * Pillar Panel - Visual health dashboard for the 4 interaction pillars
 * Shows real-time scores with animated indicators
 */

import { useAgentStore } from '@/store/agent-store';

const PILLARS = [
  {
    key: 'alignment' as const,
    label: 'Alignment',
    subtitle: 'Task Understanding',
    formula: 'G(H,C) = sim_Z(z_H, z_C)',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-400',
    icon: '🎯',
  },
  {
    key: 'steerability' as const,
    label: 'Steerability',
    subtitle: 'Human Control',
    formula: "S(H,C) = E[sim_τ(τ', τ*)]",
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    icon: '🕹️',
  },
  {
    key: 'verification' as const,
    label: 'Verification',
    subtitle: 'Shapeshifting Proof',
    formula: 'V(H,C) = E[A(s_H, y*)]',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    icon: '✅',
  },
  {
    key: 'adaptability' as const,
    label: 'Adaptability',
    subtitle: 'Learning',
    formula: 'A(C_k) = E[ΔPerf]',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    icon: '🧠',
  },
];

function ScoreRing({ score, color }: { score: number; color: string }) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - score * circumference;

  return (
    <div className="relative w-16 h-16">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/5" />
        <circle
          cx="32" cy="32" r="28" fill="none" strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`bg-gradient-to-r ${color}`}
          stroke="url(#pillarGrad)"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
        <defs>
          <linearGradient id="pillarGrad">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white/90">
        {Math.round(score * 100)}
      </span>
    </div>
  );
}

export default function PillarPanel() {
  const task = useAgentStore((s) => s.currentTask);
  const preferences = useAgentStore((s) => s.preferences);
  const scores = task?.pillarScores ?? { alignment: 0, steerability: 0, verification: 0, adaptability: 0 };

  return (
    <div className="w-64 border-l border-white/5 bg-[#0e0e10] p-4 flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
        Interaction Quality
      </h2>

      {PILLARS.map((p) => (
        <div key={p.key} className={`rounded-xl p-3 ${p.bgColor} border border-white/5`}>
          <div className="flex items-center gap-3">
            <ScoreRing score={scores[p.key]} color={p.color} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{p.icon}</span>
                <span className={`text-sm font-medium ${p.textColor}`}>{p.label}</span>
              </div>
              <p className="text-[10px] text-white/30 mt-0.5">{p.subtitle}</p>
              <p className="text-[9px] text-white/20 font-mono mt-0.5">{p.formula}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Adaptability details */}
      <div className="mt-2 rounded-xl bg-white/[0.02] border border-white/5 p-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">
          Learned Preferences
        </h3>
        <div className="space-y-1.5 text-xs text-white/50">
          <div className="flex justify-between">
            <span>Indent</span>
            <span className="text-white/70">{preferences.indentSize} {preferences.indentStyle}</span>
          </div>
          <div className="flex justify-between">
            <span>Naming</span>
            <span className="text-white/70">{preferences.namingConvention}</span>
          </div>
          <div className="flex justify-between">
            <span>Framework</span>
            <span className="text-white/70">{preferences.framework}</span>
          </div>
          <div className="flex justify-between">
            <span>Sessions</span>
            <span className="text-white/70">{preferences.sessionCount}</span>
          </div>
        </div>
      </div>

      {/* Status */}
      {task && (
        <div className="mt-auto rounded-xl bg-white/[0.02] border border-white/5 p-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              task.status === 'complete' ? 'bg-emerald-400' :
              task.status === 'error' ? 'bg-red-400' :
              task.status === 'paused' ? 'bg-amber-400' :
              'bg-indigo-400 animate-pulse'
            }`} />
            <span className="text-xs text-white/50 capitalize">{task.status}</span>
          </div>
        </div>
      )}
    </div>
  );
}
