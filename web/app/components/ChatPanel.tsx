"use client";

import React, { useRef, useEffect, useState } from "react";
import { useStore, Message } from "../store";
import { runMockAgent } from "../mock-agent";
import { runStreamAgent } from "../stream-agent";
import { SCENARIOS } from "../scenarios";
import { TaskUnderstandingCard } from "./TaskUnderstandingCard";
import { ApproachSelector } from "./ApproachSelector";
import { InlineError } from "./InlineError";

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

interface ChatPanelProps {
  mode?: "build" | "chat" | "design";
}

export function ChatPanel({ mode = "build" }: ChatPanelProps) {
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
  const chatErrors = useStore((s) => s.chatErrors);
  const removeChatError = useStore((s) => s.removeChatError);
  const clearChatErrors = useStore((s) => s.clearChatErrors);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, taskUnderstanding, approaches]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") setAttachments((prev) => [...prev, result]);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => handleImageFile(file));
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const msg = inputValue.trim();
    if (!msg && attachments.length === 0) return;
    const effectiveMode = mode === "design" ? "design" : mode;
    const images = attachments.length > 0 ? [...attachments] : undefined;
    const ok = await runStreamAgent(msg || "Build this from the uploaded image", { mode: effectiveMode, imageData: images?.[0], images });
    setAttachments([]);
    if (!ok) {
      const s = useStore.getState();
      useStore.setState({ messages: s.messages.slice(0, -1) });
      runMockAgent(msg || "Build this");
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    // Only send on Cmd/Ctrl+Enter
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
            <h2 className="text-lg font-semibold text-white mb-1">
              {mode === "build" && "What would you like to build?"}
              {mode === "chat" && "Ask about your code"}
              {mode === "design" && "Design a UI"}
            </h2>
            <p className="text-sm text-muted max-w-[280px]">
              {mode === "build" && "Describe a coding task and I'll plan, build, and verify it with full transparency."}
              {mode === "chat" && "Ask questions about the generated code. I'll explain without generating new files."}
              {mode === "design" && "Upload a screenshot, describe a UI, or paste design tokens. I'll generate pixel-perfect HTML/CSS."}
            </p>
            {mode === "build" && (
              <div className="mt-6 space-y-2 w-full max-w-[300px]">
                {SCENARIOS.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    onClick={async () => {
                      reset();
                      const ok = await runStreamAgent(s.prompt, { scenarioId: s.id, mode: "build" });
                      if (!ok) runMockAgent(s.prompt, s.id);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm rounded-lg border border-border hover:bg-surface-hover hover:border-accent/20 text-muted hover:text-white transition-all flex items-center gap-2 group"
                  >
                    <span className="group-hover:scale-110 transition-transform">{s.icon}</span>
                    <span>{s.title}</span>
                  </button>
                ))}
              </div>
            )}
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

        {chatErrors.map((err) => (
          <InlineError
            key={err.id}
            title={err.title}
            message={err.message}
            type={err.type}
            onRetry={
              err.retryMessage
                ? async () => {
                    removeChatError(err.id);
                    const ok = await runStreamAgent(err.retryMessage!, err.retryOptions as Parameters<typeof runStreamAgent>[1]);
                    if (!ok) {
                      runMockAgent(err.retryMessage!);
                    }
                  }
                : undefined
            }
            onDismiss={() => removeChatError(err.id)}
          />
        ))}

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
      <div
        className="p-4 border-t border-border"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach((file) => handleImageFile(file));
            e.target.value = "";
          }}
        />

        {/* Drag overlay */}
        {isDragging && (
          <div className="mb-3 border-2 border-dashed border-accent rounded-xl p-6 text-center bg-accent/10 animate-fade-in">
            <span className="text-2xl">📸</span>
            <p className="text-xs text-accent mt-1 font-medium">Drop image(s) here</p>
          </div>
        )}

        {/* Attachment thumbnails */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((src, i) => (
              <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-border bg-surface shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative bg-surface border border-border focus-within:border-accent/30 transition-colors">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={
              mode === "build" ? "Describe what to build..." :
              mode === "design" ? "Describe the UI or drop an image..." :
              "Ask a question..."
            }
            rows={4}
            className="w-full bg-transparent resize-none text-sm text-white placeholder:text-muted outline-none px-3 py-3 min-h-[100px] max-h-[250px]"
          />
          <div className="flex items-center justify-between px-2 pb-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-7 h-7 rounded-lg text-muted hover:text-white hover:bg-surface-hover flex items-center justify-center transition-colors"
              title="Attach image"
              type="button"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <button
              onClick={handleSend}
              disabled={(!inputValue.trim() && attachments.length === 0) || isTyping}
              className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
