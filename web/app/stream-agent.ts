import { useStore } from "./store";
import { parseCodeBlocks, filesToFileNodes } from "./lib/parse-code";

interface StreamAgentOptions {
  scenarioId?: string;
  mode?: "build" | "chat" | "design";
  imageData?: string;
  images?: string[];
}

/**
 * Calls /api/chat with streaming SSE, updating the store progressively.
 * Parses code blocks from the response and populates the file tree.
 */
export async function runStreamAgent(
  userMessage: string,
  _options?: StreamAgentOptions
): Promise<boolean> {
  const store = useStore.getState();

  store.addMessage("user", userMessage);
  store.setInput("");
  store.setTyping(true);
  store.setThinkingLabel("Thinking...");
  store.setPhase("coding");
  store.setView("workspace");
  store.clearTerminal();
  store.addTerminalLine("$ opencode generate...");
  store.addActivity("think", "🧠 Processing your request...");

  // Build messages array from store
  const allMessages = useStore.getState().messages;
  const chatMessages = allMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatMessages, mode: _options?.mode || "build", images: _options?.images || (_options?.imageData ? [_options.imageData] : undefined) }),
    });

    if (!response.ok || !response.body) {
      store.setTyping(false);
      store.setThinkingLabel("");
      const status = response.status;
      const statusText = response.ok ? "No response body" : `HTTP ${status}`;
      const errorType = status === 429 ? "rate-limit" as const
        : status >= 500 ? "api" as const
        : "generic" as const;
      const errorTitle = status === 429 ? "Rate Limited"
        : status >= 500 ? "Server Error"
        : "Request Failed";
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

    store.setTyping(false);
    store.setThinkingLabel("");

    // Parse code blocks and populate file tree
    const parsedFiles = parseCodeBlocks(assistantContent);
    if (parsedFiles.length > 0) {
      const fileNodes = filesToFileNodes(parsedFiles);
      store.setFiles(fileNodes);
      store.addTerminalLine(`✓ Generated ${parsedFiles.length} file(s)`);
      parsedFiles.forEach((f) => {
        store.addTerminalLine(`  📄 ${f.path}`);
      });

      // Auto-select first file and open all
      const firstFile = parsedFiles[0];
      if (firstFile) {
        store.setActiveFile(firstFile.path);
        parsedFiles.forEach((f) => store.addOpenTab(f.path));
      }

      store.addActivity("write", `📝 Generated ${parsedFiles.length} files`, parsedFiles.map((f) => f.path).join(", "));
      store.addTerminalLine("✓ Preview updated");
    }

    store.setPhase("complete");
    store.setProgress(100);

    // Update pillars
    store.setPillar("alignment", { score: 0.9, status: "green", detail: "Code generated" });
    store.setPillar("steerability", { score: 0.85, status: "green", detail: "Interactive session" });
    store.setPillar("verification", { score: 0.8, status: "green", detail: "Review in preview" });
    store.setPillar("adaptability", {
      score: Math.min(0.95, 0.5 + useStore.getState().preferences.interactionCount * 0.05),
      status: "green",
      detail: "Learning from interactions",
    });

    return true;
  } catch (err) {
    store.setTyping(false);
    store.setThinkingLabel("");
    store.setPhase("idle");
    const isNetworkError = err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("Failed to fetch") || err.message.includes("NetworkError"));
    const errorType = isNetworkError ? "network" as const : "generic" as const;
    const errorTitle = isNetworkError ? "Connection Failed" : "Something Went Wrong";
    const errorMsg = isNetworkError
      ? "Could not reach the server"
      : err instanceof Error ? err.message : "An unexpected error occurred";
    store.addChatError(errorTitle, errorMsg, errorType, userMessage, _options);
    store.addTerminalLine(`✗ Error: ${errorMsg}`);
    store.addActivity("think", `❌ ${errorMsg}`);
    return false;
  }
}
