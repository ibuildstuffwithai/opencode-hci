import { create } from "zustand";

export type MessageRole = "user" | "assistant" | "system";
export type AgentPhase = "idle" | "understanding" | "proposing" | "coding" | "verifying" | "complete";
export type PillarStatus = "green" | "yellow" | "red" | "inactive";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
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
}

export interface TaskUnderstanding {
  requirements: string[];
  assumptions: string[];
  questions: string[];
}

export interface PillarScores {
  alignment: { score: number; status: PillarStatus; detail: string };
  steerability: { score: number; status: PillarStatus; detail: string };
  verification: { score: number; status: PillarStatus; detail: string };
  adaptability: { score: number; status: PillarStatus; detail: string };
}

export interface Preferences {
  namingConvention: string;
  codeStyle: string;
  framework: string;
  interactionCount: number;
}

export interface DiffChange {
  file: string;
  additions: number;
  deletions: number;
  content: string;
}

interface AppState {
  // Chat
  messages: Message[];
  inputValue: string;
  isTyping: boolean;
  
  // Agent
  phase: AgentPhase;
  taskUnderstanding: TaskUnderstanding | null;
  approaches: Approach[];
  selectedApproach: string | null;
  
  // Workspace
  files: FileNode[];
  activeFile: string | null;
  activeFileContent: string;
  terminalOutput: string[];
  
  // Pillars
  pillars: PillarScores;
  preferences: Preferences;
  
  // Verification
  diffs: DiffChange[];
  testResults: { passed: number; failed: number; total: number } | null;
  
  // Controls
  speedLevel: number; // 1-3
  detailLevel: number; // 1-3
  isPaused: boolean;
  
  // Actions
  setInput: (v: string) => void;
  addMessage: (role: MessageRole, content: string) => void;
  setTyping: (v: boolean) => void;
  setPhase: (p: AgentPhase) => void;
  setTaskUnderstanding: (t: TaskUnderstanding | null) => void;
  setApproaches: (a: Approach[]) => void;
  selectApproach: (id: string) => void;
  setFiles: (f: FileNode[]) => void;
  setActiveFile: (path: string | null) => void;
  setActiveFileContent: (c: string) => void;
  addTerminalLine: (line: string) => void;
  clearTerminal: () => void;
  setPillar: (key: keyof PillarScores, val: PillarScores[keyof PillarScores]) => void;
  setDiffs: (d: DiffChange[]) => void;
  setTestResults: (r: { passed: number; failed: number; total: number } | null) => void;
  setSpeed: (n: number) => void;
  setDetail: (n: number) => void;
  togglePause: () => void;
  confirmAlignment: () => void;
  reset: () => void;
}

const initialPillars: PillarScores = {
  alignment: { score: 0, status: "inactive", detail: "Awaiting task" },
  steerability: { score: 0, status: "inactive", detail: "Awaiting task" },
  verification: { score: 0, status: "inactive", detail: "Awaiting task" },
  adaptability: { score: 0, status: "inactive", detail: "Learning..." },
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<AppState>((set, get) => ({
  messages: [],
  inputValue: "",
  isTyping: false,
  phase: "idle",
  taskUnderstanding: null,
  approaches: [],
  selectedApproach: null,
  files: [],
  activeFile: null,
  activeFileContent: "",
  terminalOutput: [],
  pillars: initialPillars,
  preferences: { namingConvention: "camelCase", codeStyle: "functional", framework: "React", interactionCount: 0 },
  diffs: [],
  testResults: null,
  speedLevel: 2,
  detailLevel: 2,
  isPaused: false,

  setInput: (v) => set({ inputValue: v }),
  addMessage: (role, content) =>
    set((s) => ({
      messages: [...s.messages, { id: uid(), role, content, timestamp: Date.now() }],
      preferences: { ...s.preferences, interactionCount: s.preferences.interactionCount + (role === "user" ? 1 : 0) },
    })),
  setTyping: (v) => set({ isTyping: v }),
  setPhase: (p) => set({ phase: p }),
  setTaskUnderstanding: (t) => set({ taskUnderstanding: t }),
  setApproaches: (a) => set({ approaches: a }),
  selectApproach: (id) => set({ selectedApproach: id }),
  setFiles: (f) => set({ files: f }),
  setActiveFile: (path) => {
    const find = (nodes: FileNode[], p: string): string | undefined => {
      for (const n of nodes) {
        if (n.path === p && n.content) return n.content;
        if (n.children) { const r = find(n.children, p); if (r) return r; }
      }
    };
    const content = path ? find(get().files, path) || "" : "";
    set({ activeFile: path, activeFileContent: content });
  },
  setActiveFileContent: (c) => set({ activeFileContent: c }),
  addTerminalLine: (line) => set((s) => ({ terminalOutput: [...s.terminalOutput, line] })),
  clearTerminal: () => set({ terminalOutput: [] }),
  setPillar: (key, val) => set((s) => ({ pillars: { ...s.pillars, [key]: val } })),
  setDiffs: (d) => set({ diffs: d }),
  setTestResults: (r) => set({ testResults: r }),
  setSpeed: (n) => set({ speedLevel: n }),
  setDetail: (n) => set({ detailLevel: n }),
  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),
  confirmAlignment: () => {
    set((s) => ({
      pillars: { ...s.pillars, alignment: { score: 0.92, status: "green", detail: "User confirmed understanding" } },
    }));
  },
  reset: () => set({
    messages: [],
    inputValue: "",
    isTyping: false,
    phase: "idle",
    taskUnderstanding: null,
    approaches: [],
    selectedApproach: null,
    files: [],
    activeFile: null,
    activeFileContent: "",
    terminalOutput: [],
    pillars: initialPillars,
    diffs: [],
    testResults: null,
  }),
}));
