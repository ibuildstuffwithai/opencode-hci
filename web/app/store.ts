import { create } from "zustand";

export type MessageRole = "user" | "assistant" | "system";
export type AgentPhase = "idle" | "understanding" | "proposing" | "coding" | "verifying" | "complete";
export type PillarStatus = "green" | "yellow" | "red" | "inactive";
export type ActivityCategory = "search" | "write" | "test" | "fix" | "think" | "verify" | "info";
export type Strategy = "conservative" | "balanced" | "aggressive";
export type AppView = "landing" | "workspace" | "settings" | "history" | "templates";
export type Theme = "dark" | "light";
export type ToastType = "success" | "error" | "warning" | "info";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  codeBlocks?: CodeBlock[];
  fileRefs?: string[];
  reaction?: "up" | "down" | null;
  thinkingLabel?: string;
}

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

export interface Approach {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
}

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  touched?: boolean;
}

export interface TaskUnderstanding {
  requirements: string[];
  assumptions: string[];
  questions: string[];
}

export interface PillarScores {
  alignment: PillarData;
  steerability: PillarData;
  verification: PillarData;
  adaptability: PillarData;
}

export interface PillarData {
  score: number;
  status: PillarStatus;
  detail: string;
}

export interface Preferences {
  namingConvention: string;
  codeStyle: string;
  framework: string;
  testingApproach: string;
  interactionCount: number;
  learnedPatterns: string[];
  preferredLanguage: string;
  tabSize: number;
  semicolons: boolean;
  trailingCommas: boolean;
}

export interface DiffChange {
  file: string;
  additions: number;
  deletions: number;
  content: string;
}

export interface ActivityEntry {
  id: string;
  timestamp: number;
  category: ActivityCategory;
  message: string;
  detail?: string;
  expanded?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  snapshot: string;
  createdAt: number;
}

export interface TestResults {
  passed: number;
  failed: number;
  total: number;
  coverage?: number;
  suites?: TestSuite[];
}

export interface TestSuite {
  name: string;
  passed: number;
  failed: number;
  duration: number;
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  timestamp: number;
  duration?: number;
}

export type ErrorType = "network" | "api" | "rate-limit" | "generic";

export interface ChatError {
  id: string;
  title: string;
  message: string;
  type: ErrorType;
  timestamp: number;
  retryMessage?: string;
  retryOptions?: { mode?: string; imageData?: string; images?: string[] };
}

export interface SessionRecord {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  duration: number;
  pillars: PillarScores;
  filesCreated: number;
  testsPassed: number;
  testsFailed: number;
  scenario: string;
}

export interface ScenarioConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  prompt: string;
  color: string;
}

interface AppState {
  // View
  view: AppView;
  setView: (v: AppView) => void;

  // Chat
  messages: Message[];
  inputValue: string;
  isTyping: boolean;
  thinkingLabel: string;

  // Agent
  phase: AgentPhase;
  taskUnderstanding: TaskUnderstanding | null;
  approaches: Approach[];
  selectedApproach: string | null;
  strategy: Strategy;
  progressPercent: number;
  activeScenario: string | null;

  // Activity Feed
  activities: ActivityEntry[];
  addActivity: (category: ActivityCategory, message: string, detail?: string) => void;
  toggleActivityDetail: (id: string) => void;

  // Workspace
  files: FileNode[];
  activeFile: string | null;
  activeFileContent: string;
  terminalOutput: string[];
  openTabs: string[];

  // Pillars
  pillars: PillarScores;
  preferences: Preferences;

  // Verification
  diffs: DiffChange[];
  testResults: TestResults | null;

  // Branches
  branches: Branch[];
  activeBranch: string | null;

  // Controls
  speedLevel: number;
  detailLevel: number;
  isPaused: boolean;

  // Toasts
  toasts: Toast[];
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;

  // Chat errors (inline)
  chatErrors: ChatError[];
  addChatError: (title: string, message: string, type: ErrorType, retryMessage?: string, retryOptions?: ChatError["retryOptions"]) => void;
  removeChatError: (id: string) => void;
  clearChatErrors: () => void;

  // Session history
  sessions: SessionRecord[];
  addSession: (session: Omit<SessionRecord, "id">) => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;

  // Mobile
  mobilePanel: "chat" | "activity" | "workspace";
  setMobilePanel: (v: "chat" | "activity" | "workspace") => void;

  // Verification panel
  verificationOpen: boolean;
  setVerificationOpen: (v: boolean) => void;

  // Redirect mode (steerability)
  redirectMode: boolean;
  setRedirectMode: (v: boolean) => void;
  redirectMessage: string;
  setRedirectMessage: (v: string) => void;

  // Theme
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  // Persistence
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;

  // Actions
  setInput: (v: string) => void;
  addMessage: (role: MessageRole, content: string, opts?: Partial<Message>) => void;
  updateMessageContent: (id: string, content: string) => void;
  setReaction: (id: string, reaction: "up" | "down" | null) => void;
  setTyping: (v: boolean) => void;
  setThinkingLabel: (label: string) => void;
  setPhase: (p: AgentPhase) => void;
  setTaskUnderstanding: (t: TaskUnderstanding | null) => void;
  setApproaches: (a: Approach[]) => void;
  selectApproach: (id: string) => void;
  setStrategy: (s: Strategy) => void;
  setProgress: (n: number) => void;
  setActiveScenario: (id: string | null) => void;
  setFiles: (f: FileNode[]) => void;
  setActiveFile: (path: string | null) => void;
  setActiveFileContent: (c: string) => void;
  addTerminalLine: (line: string) => void;
  clearTerminal: () => void;
  setPillar: (key: keyof PillarScores, val: PillarData) => void;
  setDiffs: (d: DiffChange[]) => void;
  setTestResults: (r: TestResults | null) => void;
  setSpeed: (n: number) => void;
  setDetail: (n: number) => void;
  togglePause: () => void;
  confirmAlignment: () => void;
  addBranch: (name: string) => void;
  switchBranch: (id: string) => void;
  addFile: (parentPath: string | null, name: string, type: "file" | "folder") => void;
  deleteFile: (path: string) => void;
  renameFile: (path: string, newName: string) => void;
  touchFile: (path: string) => void;
  addOpenTab: (path: string) => void;
  closeTab: (path: string) => void;
  updatePreferences: (p: Partial<Preferences>) => void;
  reset: () => void;
}

const initialPillars: PillarScores = {
  alignment: { score: 0, status: "inactive", detail: "Awaiting task" },
  steerability: { score: 0, status: "inactive", detail: "Awaiting task" },
  verification: { score: 0, status: "inactive", detail: "Awaiting task" },
  adaptability: { score: 0, status: "inactive", detail: "Learning..." },
};

const uid = () => Math.random().toString(36).slice(2, 10);

const MOCK_SESSIONS: SessionRecord[] = [
  {
    id: "s1",
    title: "Dashboard UI Components",
    description: "Built responsive dashboard with stat cards, theme toggle, and chart components",
    timestamp: Date.now() - 86400000 * 2,
    duration: 340,
    pillars: {
      alignment: { score: 0.92, status: "green", detail: "High alignment" },
      steerability: { score: 0.85, status: "green", detail: "Good control" },
      verification: { score: 0.88, status: "green", detail: "Tests passing" },
      adaptability: { score: 0.45, status: "yellow", detail: "Learning" },
    },
    filesCreated: 8,
    testsPassed: 12,
    testsFailed: 0,
    scenario: "dashboard",
  },
  {
    id: "s2",
    title: "Authentication System",
    description: "Added JWT auth with login/register, protected routes, and session management",
    timestamp: Date.now() - 86400000,
    duration: 520,
    pillars: {
      alignment: { score: 0.88, status: "green", detail: "Aligned" },
      steerability: { score: 0.78, status: "green", detail: "Steerable" },
      verification: { score: 0.95, status: "green", detail: "Full coverage" },
      adaptability: { score: 0.62, status: "yellow", detail: "Adapting" },
    },
    filesCreated: 12,
    testsPassed: 18,
    testsFailed: 1,
    scenario: "auth",
  },
  {
    id: "s3",
    title: "Payment Bug Fix",
    description: "Fixed race condition in payment processing that caused double charges",
    timestamp: Date.now() - 3600000 * 4,
    duration: 180,
    pillars: {
      alignment: { score: 0.95, status: "green", detail: "Precise" },
      steerability: { score: 0.90, status: "green", detail: "Excellent" },
      verification: { score: 0.92, status: "green", detail: "Verified" },
      adaptability: { score: 0.70, status: "green", detail: "Learning fast" },
    },
    filesCreated: 3,
    testsPassed: 8,
    testsFailed: 0,
    scenario: "bugfix",
  },
];

export const useStore = create<AppState>((set, get) => ({
  view: "landing",
  messages: [],
  inputValue: "",
  isTyping: false,
  thinkingLabel: "",
  phase: "idle",
  taskUnderstanding: null,
  approaches: [],
  selectedApproach: null,
  strategy: "balanced",
  progressPercent: 0,
  activeScenario: null,
  activities: [],
  files: [],
  activeFile: null,
  activeFileContent: "",
  terminalOutput: [],
  openTabs: [],
  pillars: initialPillars,
  preferences: {
    namingConvention: "camelCase",
    codeStyle: "functional",
    framework: "React",
    testingApproach: "unit + integration",
    interactionCount: 0,
    learnedPatterns: [],
    preferredLanguage: "TypeScript",
    tabSize: 2,
    semicolons: true,
    trailingCommas: true,
  },
  diffs: [],
  testResults: null,
  branches: [],
  activeBranch: null,
  speedLevel: 2,
  detailLevel: 2,
  isPaused: false,
  toasts: [],
  chatErrors: [],
  sessions: MOCK_SESSIONS,
  commandPaletteOpen: false,
  mobilePanel: "chat",
  verificationOpen: false,
  redirectMode: false,
  redirectMessage: "",
  currentProjectId: null,
  theme: "dark",

  setView: (v) => set({ view: v }),

  setInput: (v) => set({ inputValue: v }),
  addMessage: (role, content, opts) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { id: uid(), role, content, timestamp: Date.now(), reaction: null, ...opts },
      ],
      preferences: {
        ...s.preferences,
        interactionCount: s.preferences.interactionCount + (role === "user" ? 1 : 0),
      },
    })),
  updateMessageContent: (id, content) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, content } : m)),
    })),
  setReaction: (id, reaction) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, reaction } : m)),
      preferences: {
        ...s.preferences,
        learnedPatterns:
          reaction === "up"
            ? [...s.preferences.learnedPatterns, `Liked response style at ${new Date().toISOString()}`]
            : s.preferences.learnedPatterns,
      },
    })),
  setTyping: (v) => set({ isTyping: v }),
  setThinkingLabel: (label) => set({ thinkingLabel: label }),
  setPhase: (p) => set({ phase: p }),
  setTaskUnderstanding: (t) => set({ taskUnderstanding: t }),
  setApproaches: (a) => set({ approaches: a }),
  selectApproach: (id) => set({ selectedApproach: id }),
  setStrategy: (s) => set({ strategy: s }),
  setProgress: (n) => set({ progressPercent: Math.min(100, Math.max(0, n)) }),
  setActiveScenario: (id) => set({ activeScenario: id }),
  setFiles: (f) => set({ files: f }),
  setActiveFile: (path) => {
    const find = (nodes: FileNode[], p: string): string | undefined => {
      for (const n of nodes) {
        if (n.path === p && n.content) return n.content;
        if (n.children) {
          const r = find(n.children, p);
          if (r) return r;
        }
      }
    };
    const content = path ? find(get().files, path) || "" : "";
    const tabs = get().openTabs;
    const newTabs = path && !tabs.includes(path) ? [...tabs, path] : tabs;
    set({ activeFile: path, activeFileContent: content, openTabs: newTabs });
  },
  setActiveFileContent: (c) => set({ activeFileContent: c }),
  addTerminalLine: (line) =>
    set((s) => ({ terminalOutput: [...s.terminalOutput, line] })),
  clearTerminal: () => set({ terminalOutput: [] }),
  setPillar: (key, val) =>
    set((s) => ({ pillars: { ...s.pillars, [key]: val } })),
  setDiffs: (d) => set({ diffs: d }),
  setTestResults: (r) => set({ testResults: r }),
  setSpeed: (n) => set({ speedLevel: n }),
  setDetail: (n) => set({ detailLevel: n }),
  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),
  confirmAlignment: () => {
    set((s) => ({
      pillars: {
        ...s.pillars,
        alignment: { score: 0.92, status: "green", detail: "User confirmed understanding" },
      },
    }));
  },
  addActivity: (category, message, detail) =>
    set((s) => ({
      activities: [
        ...s.activities,
        { id: uid(), timestamp: Date.now(), category, message, detail, expanded: false },
      ],
    })),
  toggleActivityDetail: (id) =>
    set((s) => ({
      activities: s.activities.map((a) =>
        a.id === id ? { ...a, expanded: !a.expanded } : a
      ),
    })),
  addBranch: (name) => {
    const id = uid();
    set((s) => ({
      branches: [...s.branches, { id, name, snapshot: JSON.stringify(s.messages.length), createdAt: Date.now() }],
      activeBranch: id,
    }));
  },
  switchBranch: (id) => set({ activeBranch: id }),
  addFile: (parentPath, name, type) =>
    set((s) => {
      const newNode: FileNode = {
        name,
        path: parentPath ? `${parentPath}/${name}` : name,
        type,
        ...(type === "folder" ? { children: [] } : { content: "" }),
      };
      if (!parentPath) {
        return { files: [...s.files, newNode] };
      }
      const insertInto = (nodes: FileNode[]): FileNode[] =>
        nodes.map((n) => {
          if (n.path === parentPath && n.type === "folder") {
            return { ...n, children: [...(n.children || []), newNode] };
          }
          if (n.children) return { ...n, children: insertInto(n.children) };
          return n;
        });
      return { files: insertInto(s.files) };
    }),
  deleteFile: (path) =>
    set((s) => {
      const remove = (nodes: FileNode[]): FileNode[] =>
        nodes.filter((n) => n.path !== path).map((n) =>
          n.children ? { ...n, children: remove(n.children) } : n
        );
      const newFiles = remove(s.files);
      const newTabs = s.openTabs.filter((t) => t !== path && !t.startsWith(path + "/"));
      const newActive = s.activeFile === path || s.activeFile?.startsWith(path + "/")
        ? newTabs[newTabs.length - 1] || null
        : s.activeFile;
      return { files: newFiles, openTabs: newTabs, activeFile: newActive };
    }),
  renameFile: (path, newName) =>
    set((s) => {
      const parentPath = path.includes("/") ? path.substring(0, path.lastIndexOf("/")) : "";
      const newPath = parentPath ? `${parentPath}/${newName}` : newName;
      const renamePaths = (nodes: FileNode[]): FileNode[] =>
        nodes.map((n) => {
          if (n.path === path) {
            const updated = { ...n, name: newName, path: newPath };
            if (n.children) {
              const fixChildren = (children: FileNode[], oldBase: string, newBase: string): FileNode[] =>
                children.map((c) => ({
                  ...c,
                  path: newBase + c.path.substring(oldBase.length),
                  children: c.children ? fixChildren(c.children, oldBase, newBase) : undefined,
                }));
              updated.children = fixChildren(n.children, path, newPath);
            }
            return updated;
          }
          if (n.children) return { ...n, children: renamePaths(n.children) };
          return n;
        });
      const newTabs = s.openTabs.map((t) =>
        t === path ? newPath : t.startsWith(path + "/") ? newPath + t.substring(path.length) : t
      );
      const newActive = s.activeFile === path ? newPath : s.activeFile?.startsWith(path + "/") ? newPath + s.activeFile.substring(path.length) : s.activeFile;
      return { files: renamePaths(s.files), openTabs: newTabs, activeFile: newActive };
    }),
  touchFile: (path) =>
    set((s) => {
      const markTouched = (nodes: FileNode[]): FileNode[] =>
        nodes.map((n) => {
          if (n.path === path) return { ...n, touched: true };
          if (n.children) return { ...n, children: markTouched(n.children) };
          return n;
        });
      return { files: markTouched(s.files) };
    }),
  addOpenTab: (path) =>
    set((s) => ({
      openTabs: s.openTabs.includes(path) ? s.openTabs : [...s.openTabs, path],
    })),
  closeTab: (path) =>
    set((s) => {
      const tabs = s.openTabs.filter((t) => t !== path);
      const newActive = s.activeFile === path ? tabs[tabs.length - 1] || null : s.activeFile;
      return { openTabs: tabs, activeFile: newActive };
    }),

  // Toasts
  addToast: (type, title, message, duration) => {
    const id = uid();
    set((s) => ({
      toasts: [...s.toasts, { id, type, title, message, timestamp: Date.now(), duration: duration || 4000 }],
    }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, duration || 4000);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // Chat errors
  addChatError: (title, message, type, retryMessage, retryOptions) => {
    const id = uid();
    set((s) => ({
      chatErrors: [...s.chatErrors, { id, title, message, type, timestamp: Date.now(), retryMessage, retryOptions }],
    }));
  },
  removeChatError: (id) =>
    set((s) => ({ chatErrors: s.chatErrors.filter((e) => e.id !== id) })),
  clearChatErrors: () => set({ chatErrors: [] }),

  // Sessions
  addSession: (session) =>
    set((s) => ({
      sessions: [{ ...session, id: uid() }, ...s.sessions],
    })),

  // Command palette
  setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),

  // Mobile
  setMobilePanel: (v) => set({ mobilePanel: v }),

  // Verification
  setVerificationOpen: (v) => set({ verificationOpen: v }),

  // Redirect
  setRedirectMode: (v) => set({ redirectMode: v }),
  setRedirectMessage: (v) => set({ redirectMessage: v }),
  setCurrentProjectId: (id) => set({ currentProjectId: id }),

  // Theme
  setTheme: (t) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(t);
      localStorage.setItem("opencode-theme", t);
    }
    set({ theme: t });
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next as Theme);
  },

  // Preferences
  updatePreferences: (p) =>
    set((s) => ({ preferences: { ...s.preferences, ...p } })),

  reset: () =>
    set({
      messages: [],
      inputValue: "",
      isTyping: false,
      thinkingLabel: "",
      phase: "idle",
      taskUnderstanding: null,
      approaches: [],
      selectedApproach: null,
      progressPercent: 0,
      activeScenario: null,
      activities: [],
      files: [],
      activeFile: null,
      activeFileContent: "",
      terminalOutput: [],
      openTabs: [],
      pillars: initialPillars,
      diffs: [],
      testResults: null,
      branches: [],
      activeBranch: null,
      verificationOpen: false,
      redirectMode: false,
      redirectMessage: "",
      currentProjectId: null,
      chatErrors: [],
    }),
}));
