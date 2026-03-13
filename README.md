# OpenCode HCI — Human-Centered Coding Agent

> **The first coding agent built on research-backed human-AI interaction principles.**

A web-based coding agent that implements the 4-pillar interaction quality system from the CMU/Stanford/Princeton/UIUC paper [*"Humans are Missing from AI Coding Agent Research"*](https://zorazrw.github.io/files/position-haicode.pdf). Built on top of [OpenCode](https://github.com/anomalyco/opencode).

🔗 **Live Demo:** [web-five-smoky-69.vercel.app](https://web-five-smoky-69.vercel.app)

---

## What This Is

Every coding agent today (Cursor, Copilot, Replit, Lovable) focuses on **autonomous task completion** — how much can the AI do without human involvement? The research shows this is the wrong metric.

OpenCode HCI flips the script: **the human stays in the loop at every step**, and the agent's quality is measured by how well it collaborates, not how independently it operates.

The interface makes this concrete with a split-panel design:
- **Left:** Conversational chat where you describe what to build
- **Right:** Live workspace showing the agent working (file tree, code editor, terminal, diffs)
- **Bottom:** 4-pillar interaction quality dashboard tracking collaboration health in real-time

## The 4 Pillars

Based on formal metrics from the position paper by Zora Wang, Kilian Lieret, Yuxiang Wei, Valerie Chen, Lingming Zhang, Karthik Narasimhan, Ludwig Schmidt et al.

### 🎯 Pillar 1: Alignment
**Metric:** `G(H,C) = sim_Z(z_H, z_C)` — Does the agent understand what the human wants?

Before writing any code, the agent shows a **Task Understanding Card** with:
- Parsed requirements extracted from your prompt
- Assumptions the agent is making
- Clarifying questions if anything is ambiguous

You confirm, correct, or redirect before a single line of code is written. This eliminates the #1 failure mode of coding agents: building the wrong thing.

### 🎮 Pillar 2: Steerability
**Metric:** `S(H,C) = E[sim_τ(τ', τ*)]` — Can the human control the agent's approach?

The agent proposes **2-3 implementation approaches** with pros, cons, and trade-offs. You pick the one that fits. Mid-task controls include:
- **Pause/Resume** — stop the agent and redirect anytime
- **Speed** (1-3) — control how fast the agent works
- **Detail Level** (1-3) — control verbosity of explanations

### ✅ Pillar 3: Verification
**Metric:** `V(H,C) = E[A(s_H, y*(o, z_H))]` — Can the human verify the output is correct?

After each coding step, the agent provides visual proof:
- **File diffs** with addition/deletion counts
- **Terminal output** showing commands run and results
- **Test results** for logic verification
- **Auto-generated README** for every project built

The verification adapts to output type (UI → preview, API → response, logic → tests).

### 🧠 Pillar 4: Adaptability
**Metric:** `A(C_k) = E[Perf(C_k) - Perf(C_0)]` — Does the agent learn from the human over time?

Tracks your preferences across sessions:
- Naming conventions (camelCase vs snake_case)
- Code style (functional vs OOP)
- Framework choices
- Shows an **Adaptation Score** that improves over time

---

## Quick Start

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Works immediately in **mock mode** — no API keys needed.

For real AI coding, set `ANTHROPIC_API_KEY` in your environment.

## Architecture

```
opencode-hci/
├── web/                          # Next.js 14 web UI
│   ├── app/
│   │   ├── page.tsx              # Main layout: chat + workspace + pillars
│   │   ├── store.ts              # Zustand global state (192 lines)
│   │   ├── mock-agent.ts         # Mock agent with realistic simulation (324 lines)
│   │   ├── layout.tsx            # Root layout with dark theme
│   │   ├── globals.css           # Custom styles + typing animations
│   │   └── components/
│   │       ├── ChatPanel.tsx         # Chat with message history + quick prompts
│   │       ├── TaskUnderstandingCard.tsx  # Pillar 1: alignment confirmation
│   │       ├── ApproachSelector.tsx      # Pillar 2: approach picker with pros/cons
│   │       ├── WorkspacePanel.tsx        # File tree + Monaco + terminal + diffs
│   │       ├── PillarDashboard.tsx       # Bottom bar with 4-pillar scores
│   │       └── ControlBar.tsx            # Speed, detail, pause controls
│   └── vercel.json               # Deployment config
├── packages/                     # Original OpenCode packages
├── infra/                        # Infrastructure configs
└── README.md                     # This file
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript + React 18 |
| Styling | Tailwind CSS (dark theme #0e0e10) |
| Editor | Monaco Editor |
| State | Zustand |
| Deployment | Vercel |

## Features

- **Split-panel UI** — Chat left, workspace right, pillars bottom
- **Full mock mode** — Realistic typing animations, step-by-step execution, no API keys needed
- **File tree** — Folder expand/collapse, file selection
- **Monaco code editor** — Syntax highlighting, read-only during agent work
- **Terminal output** — Real-time agent activity feed
- **Diff viewer** — Per-file change stats with additions/deletions
- **Pillar indicators** — Color-coded health (green/yellow/red) with progress bars
- **Speed/Detail controls** — Customize agent behavior in real-time
- **Pause/Resume** — Interrupt and redirect the agent mid-task
- **Quick prompts** — Pre-built examples to get started fast

## The Research

This project productizes insights from:

> **"Humans are Missing from AI Coding Agent Research"**
> Zora Zhiruo Wang, Kilian Lieret, Yuxiang Wei, Valerie Chen, Lingming Zhang, Karthik R. Narasimhan, Ludwig Schmidt
> CMU, Stanford, Princeton, UIUC — 2025

The paper argues that AI coding research is over-indexed on autonomous task completion (SWE-bench scores) while ignoring the human side of the interaction. The 4 pillars provide a formal framework for measuring and improving human-agent collaboration quality.

## What's Different

Unlike Cursor/Copilot (autocomplete), Replit/Lovable (autonomous generation), or Devin (fully autonomous agent), OpenCode HCI treats **collaboration quality as the primary metric**. The agent doesn't just write code — it proves it understood you, lets you steer, shows its work, and learns your style.

---

## License

MIT — see [LICENSE](./LICENSE)

Built by [Holly AI](https://github.com/ibuildstuffwithai) • Based on [OpenCode](https://github.com/anomalyco/opencode)
