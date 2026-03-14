"use client";

import { useEffect, useRef } from "react";
import { useStore } from "../store";
import { autoSave, getProjectData } from "../lib/persistence";

/** Auto-saves session to localStorage every 30 seconds when in workspace */
export function AutoSave() {
  const view = useStore((s) => s.view);
  const messages = useStore((s) => s.messages);
  const files = useStore((s) => s.files);
  const timer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (view !== "workspace") return;

    timer.current = setInterval(() => {
      const state = useStore.getState();
      if (state.messages.length > 0 || state.files.length > 0) {
        autoSave(getProjectData(state));
      }
    }, 30000);

    return () => clearInterval(timer.current);
  }, [view]);

  // Also save on unmount / tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      const state = useStore.getState();
      if (state.view === "workspace" && (state.messages.length > 0 || state.files.length > 0)) {
        autoSave(getProjectData(state));
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return null;
}
