"use client";

import React, { useRef, useEffect } from "react";
import { useStore } from "../store";
import { runMockAgent } from "../mock-agent";
import { TaskUnderstandingCard } from "./TaskUnderstandingCard";
import { ApproachSelector } from "./ApproachSelector";

export function ChatPanel() {
  const messages = useStore((s) => s.messages);
  const inputValue = useStore((s) => s.inputValue);
  const isTyping = useStore((s) => s.isTyping);
  const phase = useStore((s) => s.phase);
  const setInput = useStore((s) => s.setInput);
  const taskUnderstanding = useStore((s) => s.taskUnderstanding);
  const approaches = useStore((s) => s.approaches);
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
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">What would you like to build?</h2>
            <p className="text-sm text-muted max-w-[280px]">
              Describe a coding task and I&apos;ll plan, build, and verify it with full transparency.
            </p>
            <div className="mt-6 space-y-2 w-full max-w-[300px]">
              {["Build a React dashboard with stats cards", "Create a REST API with Express", "Set up a Next.js blog with MDX"].map((ex) => (
                <button
                  key={ex}
                  onClick={() => { setInput(ex); }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg border border-border hover:bg-surface-hover text-muted hover:text-white transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`animate-fade-in flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent text-white"
                  : "bg-surface border border-border text-gray-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Task Understanding Card */}
        {taskUnderstanding && phase === "understanding" && (
          <TaskUnderstandingCard />
        )}

        {/* Approach Selector */}
        {approaches.length > 0 && phase === "proposing" && (
          <ApproachSelector />
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-surface border border-border rounded-xl px-4 py-3 flex gap-1">
              <span className="typing-dot w-2 h-2 bg-muted rounded-full" />
              <span className="typing-dot w-2 h-2 bg-muted rounded-full" />
              <span className="typing-dot w-2 h-2 bg-muted rounded-full" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2 bg-surface rounded-xl border border-border p-2">
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
            className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
