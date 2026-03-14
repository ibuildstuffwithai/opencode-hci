"use client";

import { useStore, FileNode } from "./store";
import { LandingScreen } from "./components/LandingScreen";
import { ChatPanel } from "./components/ChatPanel";
import { FileTree } from "./components/FileTree";
import { RealFileTree } from "./components/RealFileTree";
import { CodeEditor } from "./components/CodeEditor";
import { PreviewPanel } from "./components/PreviewPanel";
import { ConsolePanel } from "./components/ConsolePanel";
import { TerminalPanel } from "./components/TerminalPanel";
import { SessionManager } from "./components/SessionManager";
import { PillarDashboard } from "./components/PillarDashboard";
import { ControlBar } from "./components/ControlBar";
import { ToastContainer } from "./components/ToastContainer";
import { CommandPalette } from "./components/CommandPalette";
import { VerificationPanel } from "./components/VerificationPanel";
import { SettingsPage } from "./components/SettingsPage";
import { HistoryPage } from "./components/HistoryPage";
import { AutoSave } from "./components/AutoSave";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NetworkStatus } from "./components/NetworkStatus";
import { KeyboardShortcuts, toggleKeyboardShortcuts } from "./components/KeyboardShortcuts";
import { TemplateGallery } from "./components/TemplateGallery";
import { ResizeHandle } from "./components/ResizeHandle";
import { useState, useEffect, useCallback, useRef } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

type SidebarPanel = "build" | "chat" | "design" | "files" | null;

export default function Home() {
  const view = useStore((s) => s.view);
  const phase = useStore((s) => s.phase);
  const isTyping = useStore((s) => s.isTyping);
  const setCommandPaletteOpen = useStore((s) => s.setCommandPaletteOpen);
  const commandPaletteOpen = useStore((s) => s.commandPaletteOpen);
  const files = useStore((s) => s.files);
  const activeFile = useStore((s) => s.activeFile);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const toggleTheme = useStore((s) => s.toggleTheme);

  // Load saved theme on mount
  const themeLoaded = useRef(false);
  useEffect(() => {
    if (!themeLoaded.current) {
      themeLoaded.current = true;
      const saved = localStorage.getItem("opencode-theme") as "dark" | "light" | null;
      if (saved && saved !== theme) {
        setTheme(saved);
      }
    }
  }, []);
  const [activePanel, setActivePanel] = useState<SidebarPanel>("build");
  const [showPillars, setShowPillars] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(150);
  const [showConsole, setShowConsole] = useState(false);
  const [showCodeOverlay, setShowCodeOverlay] = useState(false);
  const [consoleTab, setConsoleTab] = useState<"console" | "terminal">("console");
  const [sidePanelWidth, setSidePanelWidth] = useState(320);
  const [codeOverlayWidth, setCodeOverlayWidth] = useState(480);
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<"preview" | "build" | "chat" | "files" | "code">("preview");

  // Show code overlay when a file is selected from the Files panel
  useEffect(() => {
    if (activeFile && activePanel === "files") {
      setShowCodeOverlay(true);
    }
  }, [activeFile, activePanel]);

  const togglePanel = (panel: SidebarPanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        setShowCodeOverlay(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setShowPillars((p) => !p);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setShowConsole((c) => !c);
      }
    },
    [commandPaletteOpen, setCommandPaletteOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const globalOverlays = (
    <>
      <ToastContainer />
      <CommandPalette />
      <VerificationPanel />
      <AutoSave />
      <NetworkStatus />
      <KeyboardShortcuts />
    </>
  );

  if (view === "landing") {
    return (
      <>
        {globalOverlays}
        <ErrorBoundary fallbackTitle="Failed to load landing screen">
          <LandingScreen />
        </ErrorBoundary>
      </>
    );
  }

  if (view === "settings") {
    return (
      <>
        {globalOverlays}
        <ErrorBoundary fallbackTitle="Failed to load settings">
          <SettingsPage />
        </ErrorBoundary>
      </>
    );
  }

  if (view === "templates") {
    return (
      <>
        {globalOverlays}
        <ErrorBoundary fallbackTitle="Failed to load templates">
          <TemplateGallery />
        </ErrorBoundary>
      </>
    );
  }

  if (view === "history") {
    return (
      <>
        {globalOverlays}
        <ErrorBoundary fallbackTitle="Failed to load history">
          <HistoryPage />
        </ErrorBoundary>
      </>
    );
  }

  const sidebarButtons: { id: SidebarPanel; icon: string; label: string }[] = [
    { id: "build", icon: "🔨", label: "Build" },
    { id: "chat", icon: "💬", label: "Chat" },
    { id: "design", icon: "🎨", label: "Design" },
    { id: "files", icon: "📁", label: "Files" },
  ];

  // Mobile layout
  if (isMobile) {
    const mobileTabButtons: { id: typeof mobileView; icon: string; label: string }[] = [
      { id: "preview", icon: "👁", label: "Preview" },
      { id: "build", icon: "🔨", label: "Build" },
      { id: "chat", icon: "💬", label: "Chat" },
      { id: "files", icon: "📁", label: "Files" },
      { id: "code", icon: "📝", label: "Code" },
    ];

    return (
      <>
        {globalOverlays}
        <div className="h-[100dvh] flex flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-surface shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center text-foreground font-bold text-[10px] shadow-lg shadow-accent/20">
                OC
              </div>
              {phase !== "idle" && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[9px] text-green-400 font-medium">Running</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleTheme()}
                className="text-[10px] px-1.5 py-0.5 rounded text-muted hover:text-foreground transition-colors"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <ControlBar />
            </div>
          </header>

          {/* Mobile content area */}
          <div className="flex-1 overflow-hidden">
            {mobileView === "preview" && (
              <ErrorBoundary fallbackTitle="Preview error">
                <PreviewPanel />
              </ErrorBoundary>
            )}
            {mobileView === "build" && (
              <ErrorBoundary fallbackTitle="Chat panel error">
                <ChatPanel mode="build" />
              </ErrorBoundary>
            )}
            {mobileView === "chat" && (
              <ErrorBoundary fallbackTitle="Chat panel error">
                <ChatPanel mode="chat" />
              </ErrorBoundary>
            )}
            {mobileView === "files" && (
              <ErrorBoundary fallbackTitle="File tree error">
                <FileTree />
              </ErrorBoundary>
            )}
            {mobileView === "code" && (
              <ErrorBoundary fallbackTitle="Code editor error">
                <CodeEditor />
              </ErrorBoundary>
            )}
          </div>

          {/* Mobile bottom tab bar */}
          <div className="shrink-0 border-t border-border bg-background flex items-center mobile-tabs safe-area-bottom">
            {mobileTabButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setMobileView(btn.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  mobileView === btn.id
                    ? "text-accent"
                    : "text-muted active:text-foreground"
                }`}
              >
                <span className="text-lg leading-none">{btn.icon}</span>
                <span className="text-[9px] leading-none font-medium">{btn.label}</span>
                {btn.id === "files" && files.length > 0 && mobileView !== "files" && (
                  <div className="absolute top-1 right-1/4 w-1.5 h-1.5 rounded-full bg-accent" />
                )}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Desktop layout
  return (
    <>
      {globalOverlays}
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center text-foreground font-bold text-xs shadow-lg shadow-accent/20">
              OC
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xs font-semibold text-foreground leading-none">OpenCode</h1>
              <p className="text-[9px] text-muted">AI Coding Environment</p>
            </div>
            {phase !== "idle" && (
              <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[9px] text-green-400 font-medium">Running</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPillars(!showPillars)}
              className={`text-[10px] px-2 py-1 rounded transition-colors ${
                showPillars ? "bg-accent/20 text-accent" : "text-muted hover:text-foreground"
              }`}
              title="Toggle HCI Dashboard (⌘B)"
            >
              📊 HCI
            </button>
            <button
              onClick={() => setShowConsole(!showConsole)}
              className={`text-[10px] px-2 py-1 rounded transition-colors ${
                showConsole ? "bg-accent/20 text-accent" : "text-muted hover:text-foreground"
              }`}
              title="Toggle Console (⌘J)"
            >
              ⌨️ Console
            </button>
            <button
              onClick={() => toggleTheme()}
              className="text-[10px] px-2 py-1 rounded text-muted hover:text-foreground transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button
              onClick={() => toggleKeyboardShortcuts()}
              className="text-[10px] px-2 py-1 rounded text-muted hover:text-foreground transition-colors"
              title="Keyboard Shortcuts (?)"
            >
              ❓ Help
            </button>
            <ControlBar />
          </div>
        </header>

        {/* Streaming progress indicator */}
        {isTyping && (
          <div className="h-0.5 w-full bg-surface overflow-hidden shrink-0">
            <div className="h-full bg-gradient-to-r from-accent via-accent-purple to-accent animate-progress-bar" />
          </div>
        )}

        {/* HCI Dashboard — collapsible */}
        {showPillars && (
          <div className="border-b border-border shrink-0">
            <PillarDashboard />
          </div>
        )}

        {/* Main layout: icon bar + expandable panel + preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Icon sidebar */}
          <div className="w-[52px] shrink-0 border-r border-border bg-background flex flex-col items-center pt-2 gap-1">
            {sidebarButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => togglePanel(btn.id)}
                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${
                  activePanel === btn.id
                    ? "bg-accent/20 text-accent shadow-sm shadow-accent/10"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                }`}
                title={btn.label}
              >
                <span className="text-base leading-none">{btn.icon}</span>
                <span className="text-[8px] leading-none font-medium">{btn.label}</span>
              </button>
            ))}
            {files.length > 0 && activePanel !== "files" && (
              <div className="absolute top-[134px] left-[38px] w-2 h-2 rounded-full bg-accent" />
            )}
          </div>

          {/* Expandable side panel */}
          {activePanel && (
            <div className="border-r border-border flex flex-col shrink-0 animate-slide-in" style={{ width: `${sidePanelWidth}px`, minWidth: 220, maxWidth: 600 }}>
              {/* Panel header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface shrink-0">
                <span className="text-xs font-medium text-foreground">
                  {activePanel === "build" && "🔨 Build"}
                  {activePanel === "chat" && "💬 Chat"}
                  {activePanel === "design" && "🎨 Design"}
                  {activePanel === "files" && (
                    <>
                      📁 Files
                      {files.length > 0 && (
                        <span className="ml-1 text-[9px] bg-accent/20 text-accent px-1 rounded-full">
                          {countFiles(files)}
                        </span>
                      )}
                    </>
                  )}
                </span>
                <button
                  onClick={() => setActivePanel(null)}
                  className="text-muted hover:text-foreground text-xs px-1"
                >
                  ✕
                </button>
              </div>

              {/* Panel content */}
              <div className="flex-1 overflow-hidden">
                <ErrorBoundary fallbackTitle="Chat panel error">
                  <div className={activePanel === "build" ? "h-full" : "hidden"}>
                    <ChatPanel mode="build" />
                  </div>
                  <div className={activePanel === "chat" ? "h-full" : "hidden"}>
                    <ChatPanel mode="chat" />
                  </div>
                  <div className={activePanel === "design" ? "h-full" : "hidden"}>
                    <ChatPanel mode="design" />
                  </div>
                </ErrorBoundary>
                <ErrorBoundary fallbackTitle="File tree error">
                  <div className={activePanel === "files" ? "h-full flex flex-col" : "hidden"}>
                    <SessionManager />
                    <RealFileTree />
                  </div>
                </ErrorBoundary>
              </div>
            </div>
          )}

          {/* Side panel resize handle */}
          {activePanel && (
            <ResizeHandle
              direction="horizontal"
              side="right"
              onResize={(delta) =>
                setSidePanelWidth((w) => Math.min(600, Math.max(220, w + delta)))
              }
            />
          )}

          {/* Main area: Preview (primary) + Code overlay */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 flex overflow-hidden">
              {/* Preview — always visible, takes full space */}
              <div className="flex-1 min-w-0">
                <ErrorBoundary fallbackTitle="Preview error">
                  <PreviewPanel />
                </ErrorBoundary>
              </div>

              {/* Code editor overlay — slides in from right */}
              {showCodeOverlay && activeFile && (
                <ResizeHandle
                  direction="horizontal"
                  side="left"
                  onResize={(delta) =>
                    setCodeOverlayWidth((w) => Math.min(800, Math.max(250, w + delta)))
                  }
                />
              )}
              {showCodeOverlay && activeFile && (
                <div className="border-l border-border shrink-0 flex flex-col bg-background animate-slide-in" style={{ width: `${codeOverlayWidth}px`, minWidth: 250, maxWidth: 800 }}>
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-surface shrink-0">
                    <span className="text-[11px] font-medium text-foreground truncate">
                      📄 {activeFile}
                    </span>
                    <button
                      onClick={() => setShowCodeOverlay(false)}
                      className="text-muted hover:text-foreground text-xs px-1.5 py-0.5 rounded hover:bg-surface-hover transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ErrorBoundary fallbackTitle="Code editor error">
                      <CodeEditor />
                    </ErrorBoundary>
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOM: Console / Terminal */}
            {showConsole && (
              <ResizeHandle
                direction="vertical"
                side="top"
                onResize={(delta) =>
                  setBottomHeight((h) => Math.min(500, Math.max(80, h + delta)))
                }
              />
            )}
            {showConsole && (
              <div
                className="shrink-0 flex flex-col"
                style={{ height: `${bottomHeight}px` }}
              >
                <div className="flex items-center justify-between px-3 py-1 border-b border-border bg-surface shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConsoleTab("console")}
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                        consoleTab === "console" ? "bg-accent/20 text-accent" : "text-muted hover:text-foreground"
                      }`}
                    >
                      CONSOLE
                    </button>
                    <button
                      onClick={() => setConsoleTab("terminal")}
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                        consoleTab === "terminal" ? "bg-accent/20 text-accent" : "text-muted hover:text-foreground"
                      }`}
                    >
                      TERMINAL
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setBottomHeight((h) => Math.min(400, h + 50))}
                      className="text-[10px] text-muted hover:text-foreground px-1"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => setBottomHeight((h) => Math.max(80, h - 50))}
                      className="text-[10px] text-muted hover:text-foreground px-1"
                    >
                      ↓
                    </button>
                    {consoleTab === "console" && (
                      <button
                        onClick={() => useStore.getState().clearTerminal()}
                        className="text-[10px] text-muted hover:text-foreground px-1"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  {consoleTab === "console" ? <ConsolePanel /> : <TerminalPanel />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function countFiles(nodes: FileNode[]): number {
  let count = 0;
  for (const n of nodes) {
    if (n.type === "file") count++;
    if (n.children) count += countFiles(n.children);
  }
  return count;
}
