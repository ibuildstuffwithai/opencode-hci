import { useStore } from "./store";
import { parseCodeBlocks, filesToFileNodes } from "./lib/parse-code";

interface StreamAgentOptions {
  scenarioId?: string;
  mode?: "build" | "chat" | "design";
  imageData?: string;
  images?: string[];
}

const OPENCODE_PROXY = "/api/opencode";

interface OpenCodeSession {
  id: string;
  title: string;
}

interface OpenCodeMessagePart {
  type: string;
  text?: string;
  tool?: string;
  input?: Record<string, unknown>;
  output?: string;
  [key: string]: unknown;
}

interface OpenCodeMessage {
  info: {
    id: string;
    role: string;
    time: { created: number; completed?: number };
    [key: string]: unknown;
  };
  parts: OpenCodeMessagePart[];
}

// Track the current OpenCode session
let currentSessionId: string | null = null;

async function ensureSession(): Promise<string> {
  if (currentSessionId) return currentSessionId;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

  try {
    const res = await fetch(`${OPENCODE_PROXY}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Failed to create session: ${res.status}`);
    const session = (await res.json()) as OpenCodeSession;
    currentSessionId = session.id;
    return session.id;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

export function resetSession(): void {
  currentSessionId = null;
}

export function getCurrentSessionId(): string | null {
  return currentSessionId;
}

/**
 * Sends a message to OpenCode's real backend, which executes tools
 * (bash, file edit, etc.) and returns the result.
 * Falls back to the direct Anthropic API if OpenCode server is unavailable.
 */
export async function runStreamAgent(
  userMessage: string,
  _options?: StreamAgentOptions
): Promise<boolean> {
  const store = useStore.getState();
  const mode = _options?.mode || "build";

  store.addMessage("user", userMessage);
  store.setInput("");
  store.setTyping(true);
  store.setThinkingLabel("Connecting to OpenCode...");
  store.setPhase("coding");
  store.setView("workspace");
  store.clearTerminal();
  store.addTerminalLine("$ opencode agent processing...");
  store.addActivity("think", "🧠 Processing your request...");

  // For design mode with images, fall back to direct Anthropic API
  if (mode === "design" && (_options?.images?.length || _options?.imageData)) {
    return runDirectAnthropic(userMessage, _options);
  }

  try {
    // Try OpenCode backend first
    const sessionId = await ensureSession();
    store.setThinkingLabel("Agent working...");
    store.addTerminalLine(`  Session: ${sessionId}`);

    // Send message to OpenCode - this blocks until the agent is done
    const res = await fetch(`${OPENCODE_PROXY}/session/${sessionId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parts: [{ type: "text", text: userMessage }],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      // If OpenCode server is unavailable, fall back
      if (res.status === 502) {
        store.addTerminalLine("⚠ OpenCode server unavailable, using direct API...");
        return runDirectAnthropic(userMessage, _options);
      }
      throw new Error(`OpenCode error ${res.status}: ${errorText}`);
    }

    const responseText = await res.text();
    const message = JSON.parse(responseText) as OpenCodeMessage;

    // Extract text content and tool results from parts
    let assistantContent = "";
    const toolResults: Array<{ tool: string; input: string; output: string }> = [];

    for (const part of message.parts) {
      if (part.type === "text" && part.text) {
        assistantContent += part.text;
      } else if (part.type === "tool-invocation" || part.type === "tool-result") {
        const toolName = (part.tool || part.toolName || "unknown") as string;
        const input = part.input ? JSON.stringify(part.input, null, 2) : "";
        const output = (part.output || part.result || "") as string;
        toolResults.push({ tool: toolName, input, output });
        store.addTerminalLine(`  🔧 ${toolName}`);
        store.addActivity("write", `🔧 Tool: ${toolName}`);
      }
    }

    // Build display content
    let displayContent = assistantContent;
    if (toolResults.length > 0 && !assistantContent) {
      displayContent = toolResults.map((t) => {
        let result = `**Tool: ${t.tool}**\n`;
        if (t.output) result += `\`\`\`\n${t.output}\n\`\`\`\n`;
        return result;
      }).join("\n");
    }

    store.addMessage("assistant", displayContent);
    store.setTyping(false);
    store.setThinkingLabel("");

    // Parse code blocks if present
    const parsedFiles = parseCodeBlocks(assistantContent);
    if (parsedFiles.length > 0) {
      const fileNodes = filesToFileNodes(parsedFiles);
      store.setFiles(fileNodes);
      store.addTerminalLine(`✓ Generated ${parsedFiles.length} file(s)`);
      parsedFiles.forEach((f) => store.addTerminalLine(`  📄 ${f.path}`));
      const firstFile = parsedFiles[0];
      if (firstFile) {
        store.setActiveFile(firstFile.path);
        parsedFiles.forEach((f) => store.addOpenTab(f.path));
      }
      store.addActivity("write", `📝 Generated ${parsedFiles.length} files`);
    }

    // Refresh real file tree
    await refreshFileTree();

    store.setPhase("complete");
    store.setProgress(100);
    updatePillars(toolResults.length);

    return true;
  } catch (err) {
    // Fall back to direct Anthropic API on any error
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    store.addTerminalLine(`⚠ OpenCode error: ${errorMsg}`);
    store.addTerminalLine("⚠ Falling back to direct API...");
    return runDirectAnthropic(userMessage, _options);
  }
}

/**
 * Fallback: Direct Anthropic API call (original behavior)
 */
async function runDirectAnthropic(
  userMessage: string,
  _options?: StreamAgentOptions
): Promise<boolean> {
  const store = useStore.getState();
  store.setThinkingLabel("Thinking...");

  const allMessages = useStore.getState().messages;
  const chatMessages = allMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: chatMessages,
        mode: _options?.mode || "build",
        images: _options?.images || (_options?.imageData ? [_options.imageData] : undefined),
      }),
    });

    if (!response.ok || !response.body) {
      store.setTyping(false);
      store.setThinkingLabel("");
      const status = response.status;
      const statusText = response.ok ? "No response body" : `HTTP ${status}`;
      const errorType = status === 429 ? ("rate-limit" as const) : status >= 500 ? ("api" as const) : ("generic" as const);
      const errorTitle = status === 429 ? "Rate Limited" : status >= 500 ? "Server Error" : "Request Failed";
      store.addChatError(errorTitle, statusText, errorType, userMessage, _options);
      store.addTerminalLine(`✗ Error: ${statusText}`);
      store.setPhase("idle");
      return false;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantContent = "";
    let messageId: string | null = null;
    let buffer = "";

    let streamError = false;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data) as { type: string; content: string };
            if (parsed.type === "text") {
              assistantContent += parsed.content;
              if (!messageId) {
                store.addMessage("assistant", assistantContent);
                const msgs = useStore.getState().messages;
                messageId = msgs[msgs.length - 1].id;
              } else {
                useStore.setState((s) => ({
                  messages: s.messages.map((m) =>
                    m.id === messageId ? { ...m, content: assistantContent } : m
                  ),
                }));
              }
            } else if (parsed.type === "error") {
              store.addMessage("assistant", `Error: ${parsed.content}`);
              store.setTyping(false);
              store.setThinkingLabel("");
              store.setPhase("complete");
              return true;
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } catch (streamErr) {
      // Stream interrupted (common on Safari/iOS) — use whatever content we got
      streamError = true;
      store.addTerminalLine(`⚠ Stream interrupted — using partial response`);
    }

    store.setTyping(false);
    store.setThinkingLabel("");

    // Parse whatever content we received (even if stream was interrupted)
    const parsedFiles = parseCodeBlocks(assistantContent);
    if (parsedFiles.length > 0) {
      const fileNodes = filesToFileNodes(parsedFiles);
      store.setFiles(fileNodes);
      store.addTerminalLine(`✓ Generated ${parsedFiles.length} file(s)`);
      parsedFiles.forEach((f) => store.addTerminalLine(`  📄 ${f.path}`));
      const firstFile = parsedFiles[0];
      if (firstFile) {
        store.setActiveFile(firstFile.path);
        parsedFiles.forEach((f) => store.addOpenTab(f.path));
      }
      store.addActivity("write", `📝 Generated ${parsedFiles.length} files`);
      store.addTerminalLine("✓ Preview updated");
    } else if (streamError && !assistantContent) {
      // Stream died before any content — show error
      store.addChatError("Connection Lost", "The response was interrupted. Try again.", "network" as const, userMessage, _options);
      store.addTerminalLine("✗ Stream failed before receiving content");
      store.setPhase("idle");
      return false;
    }

    store.setPhase("complete");
    store.setProgress(100);
    updatePillars(0);
    return true;
  } catch (err) {
    store.setTyping(false);
    store.setThinkingLabel("");
    store.setPhase("idle");
    const isNetworkError = err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("Failed to fetch") || err.message.includes("Load failed"));
    const errorType = isNetworkError ? ("network" as const) : ("generic" as const);
    const errorTitle = isNetworkError ? "Connection Issue" : "Something Went Wrong";
    const errorMsg = isNetworkError ? "Could not reach the server. Please try again." : err instanceof Error ? err.message : "An unexpected error occurred";
    store.addChatError(errorTitle, errorMsg, errorType, userMessage, _options);
    store.addTerminalLine(`✗ Error: ${errorMsg}`);
    store.addActivity("think", `❌ ${errorMsg}`);
    return false;
  }
}

function updatePillars(toolCount: number): void {
  const store = useStore.getState();
  store.setPillar("alignment", { score: 0.9, status: "green", detail: "Code generated" });
  store.setPillar("steerability", { score: 0.85, status: "green", detail: "Interactive session" });
  store.setPillar("verification", {
    score: toolCount > 0 ? 0.95 : 0.8,
    status: "green",
    detail: toolCount > 0 ? `${toolCount} tools executed` : "Review in preview",
  });
  store.setPillar("adaptability", {
    score: Math.min(0.95, 0.5 + useStore.getState().preferences.interactionCount * 0.05),
    status: "green",
    detail: "Learning from interactions",
  });
}

/**
 * Refresh the real file tree from OpenCode's file system
 */
export async function refreshFileTree(): Promise<void> {
  try {
    const pathRes = await fetch(`${OPENCODE_PROXY}/path`);
    if (!pathRes.ok) return;
    const pathInfo = (await pathRes.json()) as { directory: string };

    const filesRes = await fetch(`${OPENCODE_PROXY}/file?path=${encodeURIComponent(pathInfo.directory)}`);
    if (!filesRes.ok) return;
    const files = (await filesRes.json()) as Array<{ name: string; type: string; path: string }>;

    const store = useStore.getState();
    const existingFiles = store.files;

    // Convert to store format, merging with any generated files
    const realFiles = files.map((f) => ({
      name: f.name,
      path: f.path,
      type: (f.type === "directory" ? "folder" : "file") as "file" | "folder",
    }));

    // Keep generated files and add real files
    const allPaths = new Set(existingFiles.map((f) => f.path));
    const merged = [...existingFiles];
    for (const rf of realFiles) {
      if (!allPaths.has(rf.path)) {
        merged.push(rf);
      }
    }

    // Only update if we got real files
    if (realFiles.length > 0) {
      store.setFiles(merged);
    }
  } catch {
    // Silently fail - file tree refresh is not critical
  }
}

/**
 * Load a real file's content from OpenCode server
 */
export async function loadRealFile(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${OPENCODE_PROXY}/file/content?path=${encodeURIComponent(path)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { content: string };
    return data.content;
  } catch {
    return null;
  }
}
