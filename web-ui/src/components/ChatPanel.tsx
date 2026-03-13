'use client';

/**
 * Chat Panel - Left panel for user interaction with the agent
 * Shows messages, alignment cards, approach selection
 */

import { useState, useRef, useEffect } from 'react';
import { useAgentStore } from '@/store/agent-store';
import type { AlignmentCard, Approach } from '@/types';

// ── Alignment Card Component ────────────────────────────────────────────────

function AlignmentCardView({ card, onConfirm }: { card: AlignmentCard; onConfirm: () => void }) {
  return (
    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-indigo-400 text-sm font-semibold">🎯 Task Alignment</span>
        {card.confirmed && (
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Confirmed</span>
        )}
      </div>

      {card.requirements.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Requirements</p>
          <ul className="space-y-1">
            {card.requirements.map((r, i) => (
              <li key={i} className="text-xs text-white/70 flex items-start gap-1.5">
                <span className="text-indigo-400 mt-0.5">•</span> {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {card.assumptions.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Assumptions</p>
          <ul className="space-y-1">
            {card.assumptions.map((a, i) => (
              <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                <span className="text-purple-400 mt-0.5">◦</span> {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {card.clarifyingQuestions.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Questions</p>
          <ul className="space-y-1">
            {card.clarifyingQuestions.map((q, i) => (
              <li key={i} className="text-xs text-amber-300/70 flex items-start gap-1.5">
                <span className="mt-0.5">?</span> {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!card.confirmed && (
        <button
          onClick={onConfirm}
          className="w-full mt-2 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors"
        >
          ✓ Confirm Understanding
        </button>
      )}
    </div>
  );
}

// ── Approach Selection Component ────────────────────────────────────────────

function ApproachSelector({ approaches, onSelect }: { approaches: Approach[]; onSelect: (id: string) => void }) {
  const selectedId = useAgentStore((s) => s.currentTask?.steerability.selectedApproachId);

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-white/30">🕹️ Choose Approach</p>
      {approaches.map((a) => (
        <button
          key={a.id}
          onClick={() => onSelect(a.id)}
          className={`w-full text-left rounded-xl border p-3 transition-all ${
            selectedId === a.id
              ? 'border-purple-500/40 bg-purple-500/10'
              : 'border-white/5 bg-white/[0.02] hover:border-white/10'
          }`}
        >
          <p className="text-xs font-medium text-white/80">{a.title}</p>
          <p className="text-[11px] text-white/40 mt-0.5">{a.description}</p>
          <div className="flex gap-4 mt-2">
            <div className="flex-1">
              {a.pros.map((p, i) => (
                <p key={i} className="text-[10px] text-emerald-400/60">+ {p}</p>
              ))}
            </div>
            <div className="flex-1">
              {a.cons.map((c, i) => (
                <p key={i} className="text-[10px] text-red-400/40">− {c}</p>
              ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Main Chat Panel ─────────────────────────────────────────────────────────

export default function ChatPanel() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const task = useAgentStore((s) => s.currentTask);
  const submitPrompt = useAgentStore((s) => s.submitPrompt);
  const confirmAlignment = useAgentStore((s) => s.confirmAlignment);
  const selectApproach = useAgentStore((s) => s.selectApproach);
  const pauseAgent = useAgentStore((s) => s.pauseAgent);
  const resumeAgent = useAgentStore((s) => s.resumeAgent);

  const isRunning = task && !['idle', 'complete', 'error'].includes(task.status);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [task?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isRunning) return;
    const prompt = input.trim();
    setInput('');
    await submitPrompt(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-[#0e0e10]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-white/90">OpenCode HCI</h1>
          <p className="text-[10px] text-white/30">Human-Centered Coding Agent</p>
        </div>
        {isRunning && (
          <div className="flex gap-2">
            {task.status === 'paused' ? (
              <button onClick={resumeAgent} className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors">
                ▶ Resume
              </button>
            ) : (
              <button onClick={pauseAgent} className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs hover:bg-amber-500/30 transition-colors">
                ⏸ Pause
              </button>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!task && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3 max-w-sm">
              <div className="text-4xl">🤖</div>
              <h2 className="text-lg font-semibold text-white/80">What would you like to build?</h2>
              <p className="text-xs text-white/30">
                Describe your coding task. I&apos;ll confirm my understanding, propose approaches, and build it with full verification.
              </p>
            </div>
          </div>
        )}

        {task?.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
              msg.role === 'user'
                ? 'bg-indigo-500/20 text-white/90'
                : 'bg-white/[0.03] text-white/70 border border-white/5'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

              {msg.alignmentCard && (
                <div className="mt-3">
                  <AlignmentCardView card={msg.alignmentCard} onConfirm={confirmAlignment} />
                </div>
              )}

              {msg.approaches && msg.approaches.length > 0 && (
                <div className="mt-3">
                  <ApproachSelector approaches={msg.approaches} onSelect={selectApproach} />
                </div>
              )}
            </div>
          </div>
        ))}

        {isRunning && task.status !== 'paused' && (
          <div className="flex justify-start">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-white/30 capitalize">{task.status}...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRunning ? 'Agent is working...' : 'Describe what you want to build...'}
            disabled={!!isRunning}
            className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder-white/20 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || !!isRunning}
            className="px-5 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
