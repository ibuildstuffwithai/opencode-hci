"use client";

import { useState, useEffect } from "react";

export function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    // Check initial state
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl border backdrop-blur-md shadow-xl text-xs font-medium transition-all duration-300 ${
        isOffline
          ? "bg-red-500/10 border-red-500/30 text-red-400"
          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
      }`}
    >
      {isOffline ? (
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          You&apos;re offline — some features may not work
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Back online
        </span>
      )}
    </div>
  );
}
