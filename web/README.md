# OpenCode HCI — Human-Centered Coding Agent

A functional coding agent web UI that implements the 4-pillar interaction quality system from the paper *"Humans are Missing from AI Coding Agent Research"*.

Built on top of [OpenCode](https://github.com/anomalyco/opencode), this adds a rich web interface that makes the human-agent collaboration transparent and steerable.

## The 4 Pillars

### 🎯 Pillar 1: Alignment — `G(H,C) = sim_Z(z_H, z_C)`
Before coding begins, the agent shows a **Task Understanding** card with parsed requirements, assumptions, and clarifying questions. The user confirms before the agent proceeds, ensuring shared understanding.

### 🎮 Pillar 2: Steerability — `S(H,C) = E[sim_τ(τ', τ*)]`
The agent proposes 2-3 approaches with pros/cons. The user picks one. Mid-task controls include **pause/resume**, **speed** (1-3), and **detail level** (1-3) sliders.

### ✅ Pillar 3: Verification — `V(H,C) = E[A(s_H, y*(o, z_H))]`
After code generation, the UI shows visual verification: file diffs with addition/deletion counts, test results, and generated documentation. Full transparency into what changed.

### 🧠 Pillar 4: Adaptability — `A(C_k) = E[Perf(C_k) - Perf(C_0)]`
Tracks user preferences (naming conventions, code style, frameworks) across interactions. Shows an adaptation score that improves over time.

## Quick Start

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Works immediately in **mock mode** — no API keys needed.

## Architecture

```
web/
├── app/
│   ├── page.tsx              # Main layout: chat + workspace + pillars
│   ├── store.ts              # Zustand global state
│   ├── mock-agent.ts         # Mock agent with realistic simulation
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Styles + animations
│   └── components/
│       ├── ChatPanel.tsx         # Chat interface with message history
│       ├── TaskUnderstandingCard.tsx  # Pillar 1: alignment card
│       ├── ApproachSelector.tsx      # Pillar 2: approach picker
│       ├── WorkspacePanel.tsx        # File tree + Monaco editor + terminal + diffs
│       ├── PillarDashboard.tsx       # Bottom bar with 4-pillar scores
│       └── ControlBar.tsx            # Speed, detail, pause controls
```

## Tech Stack
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** — dark theme (#0e0e10)
- **Monaco Editor** — code viewing
- **Zustand** — state management

## Features
- Split-panel UI: chat left, workspace right, pillars bottom
- Full mock mode with typing animations and step-by-step execution
- File tree with folder expand/collapse
- Monaco code viewer with syntax highlighting
- Terminal output showing agent work in real-time
- Diff viewer with per-file change stats
- Colored pillar indicators (green/yellow/red)
- Speed and detail level controls
- Pause/resume during coding phase
