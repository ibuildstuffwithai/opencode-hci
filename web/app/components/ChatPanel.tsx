"use client";

import React, { useRef, useEffect, useState } from "react";
import { useStore, Message } from "../store";
import { runMockAgent } from "../mock-agent";
import { SCENARIOS } from "../scenarios";
import { TaskUnderstandingCard } from "./TaskUnderstandingCard";
import { ApproachSelector } from "./ApproachSelector";

function MessageBubble({ msg }: { msg: Message }) {
  const setReaction = useStore((s) => s.setReaction);
  const [showReactions, setShowReactions] = useState(false);
  const isUser = msg.role === "user";

  const renderContent = (text: string) => {
    const lines = text.split("\n");
    const result: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];

    lines.forEach((line, i) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          result.push(
            <pre key={`code-${i}`} className="bg-[#0a0a0c] rounded-lg p-3 my-2 overflow-x-auto text-[11px] font-mono text-gray-300 border border-border">
              {codeLines.join("\n")}
            </pre>
          );
          codeLines = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }
      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        const codeParts = part.split(/(`[^`]+`)/g);
        return codeParts.map((cp, k) => {
          if (cp.startsWith("`") && cp.endsWith("`")) {
            return (
              <code key={`${j}-${k}`} className="bg-accent/10 text-accent px-1.5 py-0.5 rounded text-[11px] font-mono">
                {cp.slice(1, -1)}
              </code>
            );
          }
          return <span key={`${j}-${k}`}>{cp}</span>;
        });
      });

      result.push(
        <p key={i} className={line === "" ? "h-2" : ""}>
          {rendered}
        </p>
      );
    });

    return result;
  };

  return (
    <div
      className={`animate-fade-in flex ${isUser ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => !isUser && setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      <div className="relative max-w-[85%]">
        <div
          className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-accent text-white"
              : "bg-surface border border-border text-gray-200"
          }`}
        >
          {renderContent(msg.content)}
          {msg.fileRefs && msg.fileRefs.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {msg.fileRefs.map((f) => (
                <span key={f} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-mono cursor-pointer hover:bg-accent/20 transition-colors">
                  📄 {f}
                </span>
              ))}
            </div>
          )}
        </div>

        {!isUser && (showReactions || msg.reaction) && (
          <div className="flex gap-1 mt-1">
            <button
              onClick={() => setReaction(msg.id, msg.reaction === "up" ? null : "up")}
              className={`text-xs px-1.5 py-0.5 rounded transition-all ${
                msg.reaction === "up" ? "bg-green-500/20 text-green-400 scale-110" : "text-muted hover:text-white"
              }`}
            >
              👍
            </button>
            <button
              onClick={() => setReaction(msg.id, msg.reaction === "down" ? null : "down")}
              className={`text-xs px-1.5 py-0.5 rounded transition-all ${
                msg.reaction === "down" ? "bg-red-500/20 text-red-400 scale-110" : "text-muted hover:text-white"
              }`}
            >
              👎
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatPanel() {
  const messages = useStore((s) => s.messages);
  const inputValue = useStore((s) => s.inputValue);
  const isTyping = useStore((s) => s.isTyping);
  const thinkingLabel = useStore((s) => s.thinkingLabel);
  const phase = useStore((s) => s.phase);
  const setInput = useStore((s) => s.setInput);
  const taskUnderstanding = useStore((s) => s.taskUnderstanding);
  const approaches = useStore((s) => s.approaches);
  const strategy = useStore((s) => s.strategy);
  const setStrategy = useStore((s) => s.setStrategy);
  const reset = useStore((s) => s.reset);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, taskUnderstanding, approaches]);

  const handleSend = () => {
    const msg = inputValue.trim();
    if (!msg) return;
    runMockAgent(msg);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Cmd+Enter also sends
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center mb-4 shadow-xl shadow-accent/20">
              <span className="text-2xl">🤖</span>
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">What would you like to build?</h2>
            <p className="text-sm text-muted max-w-[280px]">
              Describe a coding task and I&apos;ll plan, build, and verify it with full transparency.
            </p>
            <div className="mt-6 space-y-2 w-full max-w-[300px]">
              {SCENARIOS.slice(0, 3).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    reset();
                    runMockAgent(s.prompt, s.id);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm rounded-lg border border-border hover:bg-surface-hover hover:border-accent/20 text-muted hover:text-white transition-all flex items-center gap-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">{s.icon}</span>
                  <span>{s.title}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted mt-4">
              <kbd className="px-1.5 py-0.5 bg-surface-hover rounded">⌘K</kbd> for command palette
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {taskUnderstanding && phase === "understanding" && <TaskUnderstandingCard />}
        {approaches.length > 0 && phase === "proposing" && <ApproachSelector />}

        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-surface border border-border rounded-xl px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="typing-dot w-2 h-2 bg-accent rounded-full" />
                <span className="typing-dot w-2 h-2 bg-accent rounded-full" />
                <span className="typing-dot w-2 h-2 bg-accent rounded-full" />
                {thinkingLabel && (
                  <span className="text-[10px] text-muted ml-2 italic">{thinkingLabel}</span>
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Strategy selector */}
      {phase !== "idle" && phase !== "complete" && (
        <div className="px-4 py-1.5 border-t border-border flex items-center gap-2">
          <span className="text-[10px] text-muted">Strategy:</span>
          {(["conservative", "balanced", "aggressive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStrategy(s)}
              className={`text-[10px] px-2 py-0.5 rounded-full transition-all capitalize ${
                strategy === s
                  ? "bg-accent/20 text-accent font-medium shadow-sm shadow-accent/10"
                  : "text-muted hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2 bg-surface rounded-xl border border-border p-2 focus-within:border-accent/30 transition-colors">
          <textarea
            value={inputValue}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Describe what you want to build..."
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-white placeholder:text-muted outline-none px-2 py-1.5 max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-accent/20"
          >
            Send
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-[9px] text-muted">
            <kbd className="px-1 py-0.5 bg-surface-hover rounded">Enter</kbd> to send •
            <kbd className="px-1 py-0.5 bg-surface-hover rounded ml-1">Shift+Enter</kbd> new line
          </span>
        </div>
      </div>
    </div>
  );
}
