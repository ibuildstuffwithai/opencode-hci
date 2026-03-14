"use client";

import React, { useState } from "react";
import { useStore } from "../store";

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

export function SupportModal({ open, onClose }: SupportModalProps) {
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const messages = useStore((s) => s.messages);
  const files = useStore((s) => s.files);
  const addToast = useStore((s) => s.addToast);

  if (!open) return null;

  const handleSubmit = () => {
    if (!issue.trim()) return;

    // Build context snapshot
    const context = {
      issue,
      priority,
      email: email || undefined,
      messageCount: messages.length,
      fileCount: files.length,
      recentMessages: messages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content.slice(0, 200),
      })),
      timestamp: new Date().toISOString(),
    };

    // In production, this would POST to a support API
    console.log("[Support Request]", context);

    setSubmitted(true);
    addToast("success", "Support Requested", "An engineer will review your session shortly.");
  };

  const handleClose = () => {
    setIssue("");
    setPriority("medium");
    setSubmitted(false);
    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a1f] border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛟</span>
              <h2 className="text-lg font-semibold text-white">Get Support</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors text-lg"
            >
              ×
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Request live help from an engineer while you vibe code
          </p>
        </div>

        {submitted ? (
          /* Success State */
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Request Submitted!</h3>
            <p className="text-sm text-gray-400 mb-1">
              An engineer will review your session and reach out shortly.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              Your session context has been shared for faster resolution.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              Got it
            </button>
          </div>
        ) : (
          /* Form */
          <div className="p-6 space-y-4">
            {/* Issue description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                What do you need help with?
              </label>
              <textarea
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Describe your issue or what you're trying to build..."
                className="w-full bg-[#0e0e10] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-amber-500/50 transition-colors resize-none h-24"
                autoFocus
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Priority
              </label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      priority === p
                        ? p === "high"
                          ? "bg-red-500/20 text-red-400 border-red-500/40"
                          : p === "medium"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                          : "bg-blue-500/20 text-blue-400 border-blue-500/40"
                        : "bg-surface-hover text-muted border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    {p === "high" ? "🔴" : p === "medium" ? "🟡" : "🔵"} {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-[#0e0e10] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            {/* Context info */}
            <div className="bg-[#0e0e10] rounded-lg p-3 border border-gray-800">
              <p className="text-xs text-gray-400 mb-2">📎 Session context will be included:</p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>{messages.length} messages</span>
                <span>{files.length} files</span>
                <span>Recent activity</span>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!issue.trim()}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700"
            >
              🛟 Request Engineer Support
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
