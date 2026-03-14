/**
 * OpenCode Server Client
 * Connects to the OpenCode backend server for real agent operations.
 */

const DEFAULT_SERVER_URL = process.env.NEXT_PUBLIC_OPENCODE_URL || "http://127.0.0.1:4096";

interface OpenCodeClientOptions {
  serverUrl?: string;
  directory?: string;
}

interface SessionInfo {
  id: string;
  title: string;
  parentID?: string;
  createdAt: number;
  updatedAt: number;
  version: number;
}

interface MessagePart {
  id: string;
  sessionID: string;
  messageID: string;
  type: string;
  [key: string]: unknown;
}

interface MessageInfo {
  id: string;
  sessionID: string;
  role: "user" | "assistant" | "system";
  time: { created: number; completed?: number };
  [key: string]: unknown;
}

interface MessageWithParts {
  info: MessageInfo;
  parts: MessagePart[];
}

interface FileNodeInfo {
  name: string;
  type: "file" | "directory";
  path: string;
  size?: number;
  children?: FileNodeInfo[];
}

interface FileContent {
  path: string;
  content: string;
  language?: string;
}

interface PtyInfo {
  id: string;
  command?: string;
  args?: string[];
  cwd?: string;
  running: boolean;
}

interface PathInfo {
  home: string;
  state: string;
  config: string;
  worktree: string;
  directory: string;
}

interface ProviderInfo {
  id: string;
  name: string;
  models: Array<{
    id: string;
    name: string;
  }>;
}

interface AgentInfo {
  id: string;
  name: string;
  description?: string;
}

type EventHandler = (event: ServerEvent) => void;

interface ServerEvent {
  type: string;
  properties: Record<string, unknown>;
}

export class OpenCodeClient {
  private serverUrl: string;
  private directory: string;
  private eventSource: EventSource | null = null;
  private eventHandlers: EventHandler[] = [];

  constructor(options: OpenCodeClientOptions = {}) {
    this.serverUrl = options.serverUrl || DEFAULT_SERVER_URL;
    this.directory = options.directory || process.cwd();
  }

  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "x-opencode-directory": this.directory,
    };
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.serverUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        ...this.headers(),
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      throw new Error(`OpenCode API error ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }

  // Path info
  async getPath(): Promise<PathInfo> {
    return this.request<PathInfo>("/path");
  }

  // Sessions
  async listSessions(): Promise<SessionInfo[]> {
    return this.request<SessionInfo[]>("/session");
  }

  async createSession(options?: { title?: string }): Promise<SessionInfo> {
    return this.request<SessionInfo>("/session", {
      method: "POST",
      body: JSON.stringify(options || {}),
    });
  }

  async getSession(sessionId: string): Promise<SessionInfo> {
    return this.request<SessionInfo>(`/session/${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return this.request<boolean>(`/session/${sessionId}`, { method: "DELETE" });
  }

  // Messages
  async getMessages(sessionId: string): Promise<MessageWithParts[]> {
    return this.request<MessageWithParts[]>(`/session/${sessionId}/message`);
  }

  async sendMessage(
    sessionId: string,
    content: string,
    options?: { agent?: string; providerID?: string; modelID?: string }
  ): Promise<MessageWithParts> {
    const url = `${this.serverUrl}/session/${sessionId}/message`;
    const body: Record<string, unknown> = {
      parts: [{ type: "text", text: content }],
    };
    if (options?.agent) body.agent = options.agent;
    if (options?.providerID && options?.modelID) {
      body.providerID = options.providerID;
      body.modelID = options.modelID;
    }
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      throw new Error(`OpenCode API error ${res.status}: ${text}`);
    }
    // This is a streaming response that returns JSON when complete
    const text = await res.text();
    return JSON.parse(text) as MessageWithParts;
  }

  async sendMessageAsync(
    sessionId: string,
    content: string,
    options?: { agent?: string; providerID?: string; modelID?: string }
  ): Promise<void> {
    const body: Record<string, unknown> = {
      parts: [{ type: "text", text: content }],
    };
    if (options?.agent) body.agent = options.agent;
    if (options?.providerID && options?.modelID) {
      body.providerID = options.providerID;
      body.modelID = options.modelID;
    }
    await this.request<void>(`/session/${sessionId}/prompt_async`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async abortSession(sessionId: string): Promise<boolean> {
    return this.request<boolean>(`/session/${sessionId}/abort`, { method: "POST" });
  }

  // Files
  async listFiles(path: string): Promise<FileNodeInfo[]> {
    return this.request<FileNodeInfo[]>(`/file?path=${encodeURIComponent(path)}`);
  }

  async readFile(path: string): Promise<FileContent> {
    return this.request<FileContent>(`/file/content?path=${encodeURIComponent(path)}`);
  }

  async searchFiles(query: string): Promise<string[]> {
    return this.request<string[]>(`/find/file?query=${encodeURIComponent(query)}`);
  }

  async searchText(pattern: string): Promise<unknown[]> {
    return this.request<unknown[]>(`/find?pattern=${encodeURIComponent(pattern)}`);
  }

  async getFileStatus(): Promise<Array<{ path: string; status: string }>> {
    return this.request<Array<{ path: string; status: string }>>("/file/status");
  }

  // PTY
  async listPty(): Promise<PtyInfo[]> {
    return this.request<PtyInfo[]>("/pty");
  }

  async createPty(options?: { command?: string; args?: string[]; cwd?: string }): Promise<PtyInfo> {
    return this.request<PtyInfo>("/pty", {
      method: "POST",
      body: JSON.stringify(options || {}),
    });
  }

  async removePty(ptyId: string): Promise<boolean> {
    return this.request<boolean>(`/pty/${ptyId}`, { method: "DELETE" });
  }

  connectPty(ptyId: string): WebSocket {
    const wsUrl = this.serverUrl.replace(/^http/, "ws");
    return new WebSocket(`${wsUrl}/pty/${ptyId}/connect`);
  }

  // Providers
  async listProviders(): Promise<ProviderInfo[]> {
    return this.request<ProviderInfo[]>("/provider");
  }

  // Agents
  async listAgents(): Promise<AgentInfo[]> {
    return this.request<AgentInfo[]>("/agent");
  }

  // VCS
  async getVcs(): Promise<{ branch: string }> {
    return this.request<{ branch: string }>("/vcs");
  }

  // Session status
  async getSessionStatus(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>("/session/status");
  }

  // Events (SSE)
  connectEvents(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
    const url = `${this.serverUrl}/event?directory=${encodeURIComponent(this.directory)}`;
    this.eventSource = new EventSource(url);
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ServerEvent;
        this.eventHandlers.forEach((handler) => handler(data));
      } catch {
        // Skip malformed events
      }
    };
    this.eventSource.onerror = () => {
      // Will auto-reconnect
    };
  }

  onEvent(handler: EventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter((h) => h !== handler);
    };
  }

  disconnectEvents(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  getServerUrl(): string {
    return this.serverUrl;
  }

  setDirectory(directory: string): void {
    this.directory = directory;
  }
}

// Singleton for client-side use
let clientInstance: OpenCodeClient | null = null;

export function getOpenCodeClient(): OpenCodeClient {
  if (!clientInstance) {
    clientInstance = new OpenCodeClient();
  }
  return clientInstance;
}
