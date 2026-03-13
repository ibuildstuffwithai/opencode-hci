/**
 * OpenCode HCI - Core Types
 * Types for the 4-pillar human-centered coding agent
 */

// ── Pillar Metrics ──────────────────────────────────────────────────────────

export interface PillarScores {
  alignment: number;    // G(H,C) = sim_Z(z_H, z_C) — 0..1
  steerability: number; // S(H,C) = E[sim_τ(τ', τ*)] — 0..1
  verification: number; // V(H,C) = E[A(s_H, y*(o, z_H))] — 0..1
  adaptability: number; // A(C_k) = E[Perf(C_k) - Perf(C_0)] — 0..1
}

// ── Alignment (Pillar 1) ────────────────────────────────────────────────────

export interface AlignmentCard {
  requirements: string[];
  assumptions: string[];
  clarifyingQuestions: string[];
  confirmed: boolean;
}

// ── Steerability (Pillar 2) ──────────────────────────────────────────────────

export interface Approach {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
}

export interface SteerabilityState {
  isPaused: boolean;
  approaches: Approach[];
  selectedApproachId: string | null;
  speedLevel: number;    // 1-5
  detailLevel: number;   // 1-5
}

// ── Verification (Pillar 3) ──────────────────────────────────────────────────

export type VerificationType = 'preview' | 'test' | 'diff' | 'api' | 'readme';

export interface VerificationResult {
  type: VerificationType;
  title: string;
  content: string;
  passed: boolean;
  timestamp: number;
}

// ── Adaptability (Pillar 4) ──────────────────────────────────────────────────

export interface UserPreferences {
  indentStyle: 'spaces' | 'tabs';
  indentSize: number;
  namingConvention: 'camelCase' | 'snake_case' | 'PascalCase';
  framework: string;
  corrections: Array<{ from: string; to: string; timestamp: number }>;
  sessionCount: number;
}

// ── Agent & Session ─────────────────────────────────────────────────────────

export type AgentStatus = 'idle' | 'thinking' | 'aligning' | 'coding' | 'verifying' | 'paused' | 'complete' | 'error';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
  language?: string;
}

export interface TerminalLine {
  id: string;
  text: string;
  type: 'command' | 'output' | 'error' | 'info';
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: number;
  alignmentCard?: AlignmentCard;
  approaches?: Approach[];
  verification?: VerificationResult;
}

export interface AgentTask {
  id: string;
  prompt: string;
  status: AgentStatus;
  messages: ChatMessage[];
  files: FileNode[];
  terminal: TerminalLine[];
  pillarScores: PillarScores;
  alignment: AlignmentCard | null;
  steerability: SteerabilityState;
  verifications: VerificationResult[];
  createdAt: number;
}
