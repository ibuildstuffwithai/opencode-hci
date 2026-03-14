"use client";

import React, { useRef, useEffect } from "react";
import { useStore } from "../store";

export function ConsolePanel() {
  const terminalOutput = useStore((s) => s.terminalOutput);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalOutput]);

  return (
    <div className="h-full overflow-y-auto p-3 font-mono text-[11px] space-y-0.5 bg-background">
      {terminalOutput.length === 0 ? (
        <p className="text-muted">
          <span className="text-accent">$</span> Ready for output...
        </p>
      ) : (
        terminalOutput.map((line, i) => (
          <div
            key={i}
            className={`animate-fade-in ${
              line.startsWith("✓") || line.includes("PASS")
                ? "text-green-400"
                : line.startsWith("✗") || line.includes("FAIL") || line.includes("Error")
                ? "text-red-400"
                : line.startsWith("$")
                ? "text-accent"
                : line.startsWith("⚠")
                ? "text-yellow-400"
                : "text-gray-400"
            }`}
          >
            {line}
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
