"use client";

import { useStore, SessionRecord } from "../store";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString();
}

function PillarMiniBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${score * 100}%` }} />
    </div>
  );
}

function SessionCard({ session }: { session: SessionRecord }) {
  const scenarioIcons: Record<string, string> = {
    "rest-api": "🔌",
    auth: "🔐",
    bugfix: "🐛",
    refactor: "🗄️",
    dashboard: "📊",
    default: "💻",
  };

  const avgScore = (
    session.pillars.alignment.score +
    session.pillars.steerability.score +
    session.pillars.verification.score +
    session.pillars.adaptability.score
  ) / 4;

  return (
    <div className="bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{scenarioIcons[session.scenario] || "💻"}</span>
          <div>
            <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
              {session.title}
            </h3>
            <p className="text-[10px] text-muted">{formatDate(session.timestamp)} • {formatDuration(session.duration)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${avgScore >= 0.8 ? "text-emerald-400" : avgScore >= 0.6 ? "text-yellow-400" : "text-red-400"}`}>
            {Math.round(avgScore * 100)}%
          </p>
          <p className="text-[9px] text-muted">avg score</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-3">{session.description}</p>

      {/* Pillar bars */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {(["alignment", "steerability", "verification", "adaptability"] as const).map((key) => {
          const icons = { alignment: "🎯", steerability: "🎮", verification: "✅", adaptability: "🧠" };
          const colors = {
            alignment: "from-blue-500 to-cyan-500",
            steerability: "from-purple-500 to-pink-500",
            verification: "from-emerald-500 to-green-500",
            adaptability: "from-orange-500 to-yellow-500",
          };
          return (
            <div key={key} className="flex items-center gap-1">
              <span className="text-[9px]">{icons[key]}</span>
              <PillarMiniBar score={session.pillars[key].score} color={colors[key]} />
              <span className="text-[9px] text-muted font-mono">{Math.round(session.pillars[key].score * 100)}</span>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-[10px] text-muted">
        <span>📄 {session.filesCreated} files</span>
        <span className="text-emerald-400">✅ {session.testsPassed} passed</span>
        {session.testsFailed > 0 && <span className="text-red-400">❌ {session.testsFailed} failed</span>}
      </div>
    </div>
  );
}

function TrendChart({ sessions }: { sessions: SessionRecord[] }) {
  if (sessions.length < 2) return null;

  const sorted = [...sessions].sort((a, b) => a.timestamp - b.timestamp);
  const maxPts = Math.min(sorted.length, 10);
  const pts = sorted.slice(-maxPts);

  const getAvg = (s: SessionRecord) =>
    (s.pillars.alignment.score + s.pillars.steerability.score + s.pillars.verification.score + s.pillars.adaptability.score) / 4;

  const values = pts.map(getAvg);
  const width = 100;
  const height = 40;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - v * height}`).join(" ");

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-xs font-semibold text-foreground mb-3">📈 Pillar Score Trend</h3>
      <svg viewBox={`-2 -2 ${width + 4} ${height + 4}`} className="w-full h-16">
        <polyline
          points={points}
          fill="none"
          stroke="url(#trendGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="trendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        {values.map((v, i) => (
          <circle
            key={i}
            cx={(i / (values.length - 1)) * width}
            cy={height - v * height}
            r="2"
            fill="#6366f1"
          />
        ))}
      </svg>
      <div className="flex justify-between text-[9px] text-muted mt-1">
        <span>{formatDate(pts[0].timestamp)}</span>
        <span>{formatDate(pts[pts.length - 1].timestamp)}</span>
      </div>
    </div>
  );
}

export function HistoryPage() {
  const sessions = useStore((s) => s.sessions);
  const setView = useStore((s) => s.setView);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-border bg-surface">
        <button
          onClick={() => setView("landing")}
          className="text-muted hover:text-foreground transition-colors text-sm"
        >
          ← Back
        </button>
        <div className="w-px h-4 bg-border" />
        <div>
          <h1 className="text-sm font-semibold text-foreground">📊 Session History</h1>
          <p className="text-[10px] text-muted">{sessions.length} sessions recorded</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Trend chart */}
          <TrendChart sessions={sessions} />

          {/* Sessions */}
          {sessions.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-4xl mb-4 block">📊</span>
              <p className="text-lg font-semibold text-foreground mb-2">No sessions yet</p>
              <p className="text-sm text-muted">Complete a coding session to see it here</p>
              <button
                onClick={() => setView("workspace")}
                className="mt-4 px-4 py-2 rounded-lg bg-accent text-foreground text-sm hover:bg-accent/90 transition-colors"
              >
                Start a Session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
