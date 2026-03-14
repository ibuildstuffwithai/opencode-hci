/**
 * Session persistence — save/load projects to localStorage
 */

const STORAGE_KEY = "opencode-hci-projects";
const AUTOSAVE_KEY = "opencode-hci-autosave";

export interface SavedProject {
  id: string;
  name: string;
  description: string;
  savedAt: number;
  updatedAt: number;
  data: ProjectData;
}

export interface ProjectData {
  messages: any[];
  files: any[];
  openTabs: string[];
  activeFile: string | null;
  strategy: string;
  preferences: any;
  pillars: any;
  activities: any[];
  terminalOutput: string[];
  diffs: any[];
  testResults: any;
  phase: string;
  activeScenario: string | null;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function listProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const projects: SavedProject[] = JSON.parse(raw);
    return projects.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveProject(name: string, description: string, data: ProjectData, existingId?: string): SavedProject {
  const projects = listProjects();
  const now = Date.now();

  if (existingId) {
    const idx = projects.findIndex((p) => p.id === existingId);
    if (idx >= 0) {
      projects[idx] = { ...projects[idx], name, description, updatedAt: now, data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      return projects[idx];
    }
  }

  const project: SavedProject = { id: uid(), name, description, savedAt: now, updatedAt: now, data };
  projects.unshift(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return project;
}

export function loadProject(id: string): SavedProject | null {
  const projects = listProjects();
  return projects.find((p) => p.id === id) || null;
}

export function deleteProject(id: string): void {
  const projects = listProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function autoSave(data: ProjectData): void {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ data, savedAt: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

export function loadAutoSave(): { data: ProjectData; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAutoSave(): void {
  localStorage.removeItem(AUTOSAVE_KEY);
}

export function getProjectData(state: any): ProjectData {
  return {
    messages: state.messages,
    files: state.files,
    openTabs: state.openTabs,
    activeFile: state.activeFile,
    strategy: state.strategy,
    preferences: state.preferences,
    pillars: state.pillars,
    activities: state.activities,
    terminalOutput: state.terminalOutput,
    diffs: state.diffs,
    testResults: state.testResults,
    phase: state.phase,
    activeScenario: state.activeScenario,
  };
}
