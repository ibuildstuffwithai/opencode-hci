"use client";

import { useState, useEffect, useCallback } from "react";
import { resetSession, getCurrentSessionId } from "../stream-agent";

const OPENCODE_PROXY = "/api/opencode";

interface SessionInfo {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

interface ServerStatus {
  connected: boolean;
  directory: string;
  branch: string;
  agents: string[];
}

export function SessionManager() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [status, setStatus] = useState<ServerStatus>({
    connected: false,
    directory: "",
    branch: "",
    agents: [],
  });
  const [expanded, setExpanded] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const [pathRes, vcsRes, agentsRes] = await Promise.all([
        fetch(`${OPENCODE_PROXY}/path`).catch(() => null),
        fetch(`${OPENCODE_PROXY}/vcs`).catch(() => null),
        fetch(`${OPENCODE_PROXY}/agent`).catch(() => null),
      ]);

      if (pathRes?.ok) {
        const path = (await pathRes.json()) as { directory: string };
        const branch = vcsRes?.ok ? ((await vcsRes.json()) as { branch: string }).branch : "";
        const agents = agentsRes?.ok ? ((await agentsRes.json()) as Array<{ id: string }>).map((a) => a.id) : [];

        setStatus({
          connected: true,
          directory: path.directory,
          branch,
          agents,
        });
      } else {
        setStatus((prev) => ({ ...prev, connected: false }));
      }
    } catch {
      setStatus((prev) => ({ ...prev, connected: false }));
    }
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch(`${OPENCODE_PROXY}/session?limit=10`);
      if (res.ok) {
        const data = (await res.json()) as SessionInfo[];
        setSessions(data);
      }
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    checkStatus();
    loadSessions();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus, loadSessions]);

  const currentId = getCurrentSessionId();

  return (
    <div className="border-b border-white/10">
      {/* Status bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-xs hover:bg-white/[0.04] transition"
      >
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${status.connected ? "bg-green-400" : "bg-red-400"}`}
          />
          <span className="text-foreground/70">
            {status.connected ? "OpenCode Server" : "Server Offline"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-foreground/40">
          {status.branch && (
            <span className="bg-white/[0.08] px-1.5 py-0.5 rounded text-[10px]">
              ⎇ {status.branch}
            </span>
          )}
          <span>{expanded ? "▴" : "▾"}</span>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-2 space-y-2">
          {/* Connection info */}
          <div className="text-[10px] text-foreground/40 space-y-0.5">
            <div>Dir: {status.directory || "—"}</div>
            <div>Session: {currentId || "None"}</div>
            <div>Agents: {status.agents.join(", ") || "—"}</div>
          </div>

          {/* Actions */}
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                resetSession();
                loadSessions();
              }}
              className="px-2 py-1 text-[10px] bg-indigo-500/20 text-indigo-300 rounded hover:bg-indigo-500/30 transition"
            >
              New Session
            </button>
            <button
              onClick={checkStatus}
              className="px-2 py-1 text-[10px] bg-white/[0.06] text-foreground/60 rounded hover:bg-white/10 transition"
            >
              Refresh
            </button>
          </div>

          {/* Recent sessions */}
          {sessions.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-foreground/30 mb-1">Recent Sessions</div>
              <div className="space-y-0.5 max-h-32 overflow-y-auto">
                {sessions.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className={`text-[10px] px-1.5 py-0.5 rounded flex justify-between ${
                      s.id === currentId ? "bg-indigo-500/20 text-indigo-300" : "text-foreground/50 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="truncate">{s.title || s.id.slice(0, 8)}</span>
                    <span className="text-foreground/30 flex-shrink-0 ml-2">
                      {new Date(s.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
