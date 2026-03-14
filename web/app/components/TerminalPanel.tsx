"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const OPENCODE_PROXY = "/api/opencode";
const OPENCODE_WS = process.env.NEXT_PUBLIC_OPENCODE_WS || "ws://127.0.0.1:4096";

interface PtySession {
  id: string;
  command?: string;
  running: boolean;
}

export function TerminalPanel() {
  const [lines, setLines] = useState<string[]>(["$ Connecting to terminal..."]);
  const [input, setInput] = useState("");
  const [ptyId, setPtyId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const termRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [lines]);

  // Create PTY session and connect via WebSocket
  const connectPty = useCallback(async () => {
    try {
      const res = await fetch(`${OPENCODE_PROXY}/pty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        setLines((prev) => [...prev, "⚠ Could not create PTY session. Is OpenCode server running?"]);
        return;
      }

      const pty = (await res.json()) as PtySession;
      setPtyId(pty.id);
      setLines((prev) => [...prev, `✓ PTY session created: ${pty.id}`]);

      // Connect via WebSocket
      const ws = new WebSocket(`${OPENCODE_WS}/pty/${pty.id}/connect`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setLines((prev) => [...prev, "✓ Terminal connected", ""]);
      };

      ws.onmessage = (event) => {
        const data = typeof event.data === "string" ? event.data : "";
        setLines((prev) => [...prev, ...data.split("\n")]);
      };

      ws.onclose = () => {
        setConnected(false);
        setLines((prev) => [...prev, "", "⚠ Terminal disconnected"]);
      };

      ws.onerror = () => {
        setConnected(false);
        setLines((prev) => [...prev, "⚠ WebSocket connection error"]);
      };
    } catch {
      setLines((prev) => [...prev, "⚠ Failed to connect to OpenCode server"]);
    }
  }, []);

  useEffect(() => {
    connectPty();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      // Clean up PTY session
      if (ptyId) {
        fetch(`${OPENCODE_PROXY}/pty/${ptyId}`, { method: "DELETE" }).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "input", data: input + "\n" }));
    setInput("");
  }, [input]);

  return (
    <div className="flex flex-col h-full bg-background border-t border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground/60">TERMINAL</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`}
          />
          <span className="text-xs text-foreground/40">{connected ? "Connected" : "Disconnected"}</span>
        </div>
        <button
          onClick={() => {
            if (!connected) connectPty();
          }}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition"
          disabled={connected}
        >
          {connected ? "●" : "Reconnect"}
        </button>
      </div>

      {/* Terminal output */}
      <div ref={termRef} className="flex-1 overflow-y-auto p-2 font-mono text-xs leading-5 text-green-400/90">
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">
            {line}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-2 py-1.5 border-t border-white/10 bg-white/[0.02]">
        <span className="text-green-400/70 text-xs font-mono">$</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder={connected ? "Type a command..." : "Terminal not connected"}
          disabled={!connected}
          className="flex-1 bg-transparent text-xs font-mono text-foreground/90 placeholder:text-foreground/30 outline-none"
        />
      </div>
    </div>
  );
}
