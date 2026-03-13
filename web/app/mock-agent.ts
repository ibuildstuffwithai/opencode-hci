import { useStore } from "./store";
import { SCENARIO_DATA, ActivityStep } from "./scenarios";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function getScenarioData(scenarioId: string | null) {
  if (scenarioId && SCENARIO_DATA[scenarioId]) return SCENARIO_DATA[scenarioId];
  return SCENARIO_DATA["default"];
}

export async function runMockAgent(userMessage: string, scenarioId?: string) {
  const store = useStore.getState();
  const speed = [1.8, 1.0, 0.4][store.speedLevel - 1];
  const data = getScenarioData(scenarioId || null);

  store.setActiveScenario(scenarioId || null);
  store.addMessage("user", userMessage);
  store.setInput("");
  store.setTyping(true);
  store.setThinkingLabel("Analyzing your request...");
  store.clearTerminal();
  store.setProgress(0);

  // Phase 1: Understanding
  await delay(700 * speed);
  store.setPhase("understanding");
  store.setPillar("alignment", { score: 0.6, status: "yellow", detail: "Analyzing task requirements..." });
  store.addActivity("think", "🧠 Reading and understanding your request...");

  store.addMessage("assistant", "Let me analyze your request and break it down. I want to make sure I understand exactly what you need before writing any code.");
  store.setThinkingLabel("Breaking down requirements...");

  await delay(500 * speed);
  store.setTyping(false);
  store.setTaskUnderstanding(data.understanding);
  store.setPillar("alignment", { score: 0.85, status: "yellow", detail: "Awaiting user confirmation" });
  store.addActivity("info", "📋 Intent interpretation ready — waiting for your confirmation");

  // Wait for user to confirm (auto-confirm after delay)
  await delay(2000 * speed);
  store.confirmAlignment();
  store.addActivity("info", "✅ User confirmed task understanding — alignment locked at 92%");
  store.addToast("success", "Alignment Confirmed", "Task understanding verified at 92%");

  // Phase 2: Proposing approaches
  store.setPhase("proposing");
  store.setTyping(true);
  store.setThinkingLabel("Evaluating approaches...");
  store.setPillar("steerability", { score: 0.7, status: "yellow", detail: "Presenting approaches" });

  await delay(600 * speed);
  store.setTyping(false);
  store.setApproaches(data.approaches);
  store.addActivity("think", "💡 Generated 3 architectural approaches for your review");

  await delay(2000 * speed);
  store.selectApproach("a1");
  store.setPillar("steerability", { score: 0.88, status: "green", detail: "Approach selected" });
  store.addMessage("assistant", `Great choice! Starting with **${data.approaches[0].title}**. ${data.approaches[0].description}\n\nBeginning implementation now...`);
  store.addActivity("info", `🎮 ${data.approaches[0].title} selected — beginning implementation`);

  // Phase 3: Coding with activity feed
  store.setPhase("coding");
  store.setTyping(true);
  store.setThinkingLabel("Writing code...");
  store.setPillar("verification", { score: 0.3, status: "yellow", detail: "Generating code..." });

  let termIdx = 0;
  for (const step of data.activityScript as ActivityStep[]) {
    // Check pause
    if (useStore.getState().isPaused) {
      store.addToast("warning", "Agent Paused", "Click Resume to continue");
      while (useStore.getState().isPaused) {
        await delay(200);
        // Check for redirect
        const state = useStore.getState();
        if (state.redirectMode && state.redirectMessage) {
          store.addMessage("user", `[Redirect] ${state.redirectMessage}`);
          store.addActivity("info", `🔄 User redirected: ${state.redirectMessage}`);
          store.setRedirectMode(false);
          store.setRedirectMessage("");
          store.togglePause();
          break;
        }
      }
    }
    await delay(step.delay * speed);
    store.addActivity(step.category, step.message, step.detail);
    if (step.progress !== undefined) store.setProgress(step.progress);
    if (step.touchFile) store.touchFile(step.touchFile);

    // Feed terminal lines proportionally
    const targetTermIdx = Math.floor((step.progress || 0) / 100 * data.terminalLines.length);
    while (termIdx < targetTermIdx && termIdx < data.terminalLines.length) {
      store.addTerminalLine(data.terminalLines[termIdx]);
      termIdx++;
    }
  }

  // Flush remaining terminal lines
  while (termIdx < data.terminalLines.length) {
    store.addTerminalLine(data.terminalLines[termIdx]);
    termIdx++;
  }

  store.setFiles(data.files);
  if (data.files[0]?.children?.[0]) {
    const firstFile = data.files[0].children[0];
    store.setActiveFile(firstFile.type === "file" ? firstFile.path : (firstFile.children?.[0]?.path || null));
  }
  store.setTyping(false);
  store.setThinkingLabel("");

  // Phase 4: Verification
  store.setPhase("verifying");
  store.setDiffs(data.diffs);
  store.setTestResults(data.testResults);
  store.setPillar("verification", {
    score: data.pillarScores.verification,
    status: "green",
    detail: `All tests pass • ${data.testResults.coverage}% coverage`,
  });
  store.addActivity("verify", `🔍 Verification complete — ${data.testResults.passed}/${data.testResults.total} tests pass, ${data.testResults.coverage}% coverage`);
  store.setVerificationOpen(true);
  store.addToast("success", "Task Complete", `${data.testResults.passed} tests passing, ${data.testResults.coverage}% coverage`);

  await delay(500 * speed);
  const fileCount = countFiles(data.files);
  store.addMessage("assistant", `✅ All done! Here's what I built:\n\n**${fileCount} files created** with full TypeScript types.\n\n**All ${data.testResults.passed} tests passing** • **${data.testResults.coverage}% code coverage**\n\nCheck the workspace panel to review code and diffs.`, {
    fileRefs: data.diffs.map(d => d.file),
  });

  // Phase 5: Complete
  store.setPhase("complete");
  store.setProgress(100);

  // Update pillar scores
  store.setPillar("alignment", { score: data.pillarScores.alignment, status: "green", detail: "Task aligned with intent" });
  store.setPillar("steerability", { score: data.pillarScores.steerability, status: "green", detail: "Full control maintained" });

  const interactions = useStore.getState().preferences.interactionCount;
  const adaptScore = Math.min(0.95, data.pillarScores.adaptability + interactions * 0.05);
  store.setPillar("adaptability", {
    score: adaptScore,
    status: adaptScore > 0.7 ? "green" : "yellow",
    detail: `Learned from ${interactions} interactions • Prefers ${useStore.getState().preferences.codeStyle} style`,
  });
  store.addActivity("info", `🧠 Adaptability updated — learned from ${interactions} interactions`);

  // Save session
  store.addSession({
    title: userMessage.slice(0, 60),
    description: `Completed with ${fileCount} files and ${data.testResults.passed} passing tests`,
    timestamp: Date.now(),
    duration: Math.round(180 + Math.random() * 300),
    pillars: useStore.getState().pillars,
    filesCreated: fileCount,
    testsPassed: data.testResults.passed,
    testsFailed: data.testResults.failed,
    scenario: scenarioId || "default",
  });
}

function countFiles(nodes: import("./store").FileNode[]): number {
  let count = 0;
  for (const n of nodes) {
    if (n.type === "file") count++;
    if (n.children) count += countFiles(n.children);
  }
  return count;
}

export function exportSessionMarkdown(): string {
  const state = useStore.getState();
  const lines: string[] = [
    "# OpenCode HCI — Session Report",
    "",
    `**Date:** ${new Date().toLocaleDateString()}`,
    `**Scenario:** ${state.activeScenario || "Custom"}`,
    "",
    "## Pillar Scores",
    "",
    `| Pillar | Score | Status |`,
    `|--------|-------|--------|`,
    `| 🎯 Alignment | ${Math.round(state.pillars.alignment.score * 100)}% | ${state.pillars.alignment.status} |`,
    `| 🎮 Steerability | ${Math.round(state.pillars.steerability.score * 100)}% | ${state.pillars.steerability.status} |`,
    `| ✅ Verification | ${Math.round(state.pillars.verification.score * 100)}% | ${state.pillars.verification.status} |`,
    `| 🧠 Adaptability | ${Math.round(state.pillars.adaptability.score * 100)}% | ${state.pillars.adaptability.status} |`,
    "",
    "## Chat History",
    "",
  ];

  for (const msg of state.messages) {
    const role = msg.role === "user" ? "**You**" : "**Agent**";
    lines.push(`${role}: ${msg.content}`);
    lines.push("");
  }

  if (state.testResults) {
    lines.push("## Test Results", "");
    lines.push(`- Passed: ${state.testResults.passed}`);
    lines.push(`- Failed: ${state.testResults.failed}`);
    if (state.testResults.coverage !== undefined) lines.push(`- Coverage: ${state.testResults.coverage}%`);
    lines.push("");
  }

  if (state.diffs.length > 0) {
    lines.push("## Files Changed", "");
    for (const d of state.diffs) {
      lines.push(`- **${d.file}**: +${d.additions} -${d.deletions}`);
    }
    lines.push("");
  }

  lines.push("## Activity Log", "");
  for (const a of state.activities) {
    lines.push(`- ${new Date(a.timestamp).toLocaleTimeString()} — ${a.message}`);
  }

  return lines.join("\n");
}
