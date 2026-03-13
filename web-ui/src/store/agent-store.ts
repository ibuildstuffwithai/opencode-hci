/**
 * Agent Store - Zustand state management for the coding agent
 * Manages task state, pillar scores, and all UI state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type {
  AgentTask,
  PillarScores,
  SteerabilityState,
  UserPreferences,
} from '@/types';
import { runMockAgent } from '@/lib/mock-agent';

// ── Store Interface ─────────────────────────────────────────────────────────

interface AgentStore {
  // Current task
  currentTask: AgentTask | null;
  taskHistory: AgentTask[];

  // User preferences (Pillar 4 - Adaptability)
  preferences: UserPreferences;

  // Active file in editor
  activeFilePath: string | null;

  // Actions
  submitPrompt: (prompt: string) => Promise<void>;
  confirmAlignment: () => void;
  selectApproach: (approachId: string) => void;
  pauseAgent: () => void;
  resumeAgent: () => void;
  setActiveFile: (path: string) => void;
  setSpeedLevel: (level: number) => void;
  setDetailLevel: (level: number) => void;
  updatePreference: (key: keyof UserPreferences, value: unknown) => void;
  reset: () => void;
}

// ── Default values ──────────────────────────────────────────────────────────

const defaultPillarScores: PillarScores = {
  alignment: 0,
  steerability: 0,
  verification: 0,
  adaptability: 0,
};

const defaultSteerability: SteerabilityState = {
  isPaused: false,
  approaches: [],
  selectedApproachId: null,
  speedLevel: 3,
  detailLevel: 3,
};

const defaultPreferences: UserPreferences = {
  indentStyle: 'spaces',
  indentSize: 2,
  namingConvention: 'camelCase',
  framework: 'express',
  corrections: [],
  sessionCount: 0,
};

// ── Store ───────────────────────────────────────────────────────────────────

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      currentTask: null,
      taskHistory: [],
      preferences: defaultPreferences,
      activeFilePath: null,

      submitPrompt: async (prompt: string) => {
        const task: AgentTask = {
          id: uuid(),
          prompt,
          status: 'thinking',
          messages: [
            {
              id: uuid(),
              role: 'user',
              content: prompt,
              timestamp: Date.now(),
            },
          ],
          files: [],
          terminal: [],
          pillarScores: defaultPillarScores,
          alignment: null,
          steerability: defaultSteerability,
          verifications: [],
          createdAt: Date.now(),
        };

        set({ currentTask: task, activeFilePath: null });

        // Increment session count for adaptability
        const prefs = get().preferences;
        set({ preferences: { ...prefs, sessionCount: prefs.sessionCount + 1 } });

        // Run mock agent (or real agent when API key available)
        await runMockAgent(prompt, (update) => {
          const current = get().currentTask;
          if (!current) return;

          const merged: AgentTask = { ...current };

          if (update.status) merged.status = update.status;
          if (update.messages) merged.messages = [...merged.messages, ...update.messages];
          if (update.files) merged.files = update.files;
          if (update.terminal) merged.terminal = update.terminal;
          if (update.pillarScores) merged.pillarScores = update.pillarScores;
          if (update.alignment) merged.alignment = update.alignment;
          if (update.steerability) merged.steerability = update.steerability;
          if (update.verifications) merged.verifications = update.verifications;

          set({ currentTask: merged });

          // Auto-select first file for editor
          if (update.files && update.files.length > 0 && !get().activeFilePath) {
            set({ activeFilePath: update.files[0].path });
          }
        });

        // Archive completed task
        const finalTask = get().currentTask;
        if (finalTask) {
          set({ taskHistory: [...get().taskHistory, finalTask] });
        }
      },

      confirmAlignment: () => {
        const task = get().currentTask;
        if (!task?.alignment) return;
        set({
          currentTask: {
            ...task,
            alignment: { ...task.alignment, confirmed: true },
            pillarScores: { ...task.pillarScores, alignment: Math.min(1, task.pillarScores.alignment + 0.05) },
          },
        });
      },

      selectApproach: (approachId: string) => {
        const task = get().currentTask;
        if (!task) return;
        set({
          currentTask: {
            ...task,
            steerability: { ...task.steerability, selectedApproachId: approachId },
            pillarScores: { ...task.pillarScores, steerability: Math.min(1, task.pillarScores.steerability + 0.1) },
          },
        });
      },

      pauseAgent: () => {
        const task = get().currentTask;
        if (!task) return;
        set({
          currentTask: {
            ...task,
            status: 'paused',
            steerability: { ...task.steerability, isPaused: true },
          },
        });
      },

      resumeAgent: () => {
        const task = get().currentTask;
        if (!task) return;
        set({
          currentTask: {
            ...task,
            status: 'coding',
            steerability: { ...task.steerability, isPaused: false },
          },
        });
      },

      setActiveFile: (path: string) => set({ activeFilePath: path }),

      setSpeedLevel: (level: number) => {
        const task = get().currentTask;
        if (!task) return;
        set({
          currentTask: {
            ...task,
            steerability: { ...task.steerability, speedLevel: level },
          },
        });
      },

      setDetailLevel: (level: number) => {
        const task = get().currentTask;
        if (!task) return;
        set({
          currentTask: {
            ...task,
            steerability: { ...task.steerability, detailLevel: level },
          },
        });
      },

      updatePreference: (key, value) => {
        set({ preferences: { ...get().preferences, [key]: value } });
      },

      reset: () => set({ currentTask: null, activeFilePath: null }),
    }),
    {
      name: 'opencode-hci-store',
      partialize: (state) => ({ preferences: state.preferences, taskHistory: state.taskHistory }),
    }
  )
);
