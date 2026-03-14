# OpenCode HCI — Human-Centered AI Coding Agent

> AI coding agents are powerful, but they're designed around code — not humans.
> OpenCode HCI is the first coding agent built on a formal framework for
> **human-centered interaction quality**.

Based on the research paper *"Humans are Missing from AI Coding Agent Research"*, this project implements the **4-Pillar Interaction Quality Framework** as a working product, not just metrics.

## The Problem

Current AI coding agents (Copilot, Cursor, Devin) optimize for code output.
They don't optimize for the human experience of *working with* an AI agent.
The result: developers lose context, can't steer the agent, and can't verify output.

## The 4-Pillar Framework

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTERACTION QUALITY (IQ)                      │
│                                                                  │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│   │  🎯      │  │  🎮      │  │  ✅      │  │  🧠          │   │
│   │ ALIGNMENT│  │ STEER-   │  │ VERIFI-  │  │ ADAPT-       │   │
│   │          │  │ ABILITY  │  │ CATION   │  │ ABILITY      │   │
│   │          │  │          │  │          │  │              │   │
│   │ Does the │  │ Can you  │  │ Can you  │  │ Does the     │   │
│   │ agent    │  │ redirect │  │ trust    │  │ agent learn  │   │
│   │ get your │  │ mid-task?│  │ the      │  │ your style?  │   │
│   │ intent?  │  │          │  │ output?  │  │              │   │
│   │          │  │          │  │          │  │              │   │
│   │ G(H,C) = │  │ S(H,C) =│  │ V(H,C) =│  │ A(Ck) =     │   │
│   │ sim(zH,  │  │ E[sim(τ',│  │ E[A(sH, │  │ E[Perf(Ck)- │   │
│   │     zC)  │  │     τ*)] │  │     y*)] │  │   Perf(C0)] │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                                                                  │
│         IQ = f(Alignment, Steerability, Verification,           │
│                Adaptability)                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Pillar 1: Alignment 🎯
- Agent shows **intent interpretation** before coding: *"I understand you want..."*
- Confidence indicator with live scoring
- User can correct/refine before the agent proceeds
- **Score:** `G(H,C) = similarity between human goal and agent interpretation`

### Pillar 2: Steerability 🎮
- **Strategy selector:** Conservative / Balanced / Aggressive
- Inline intervention: pause, redirect, "take a different approach"
- Multiple architectural approaches to choose from with pros/cons
- Branch-and-compare alternative implementations

### Pillar 3: Verification ✅
- **Shapeshifting verification:** auto-detects output type
  - Code → test results + coverage percentage
  - Every change has a before/after diff view
- Full test runner integration with pass/fail counts
- **Score:** `V(H,C) = expected human agreement with output`

### Pillar 4: Adaptability 🧠
- Tracks coding preferences (naming, patterns, frameworks)
- "Your Coding DNA" profile builds over time
- Message reactions (👍👎) feed into preference learning
- **Score:** `A(Ck) = performance improvement over baseline`

## Quick Start

```bash
# Clone and install
git clone https://github.com/your-org/opencode-hci.git
cd opencode-hci/web
npm install

# Run in development mode (mock mode — no API keys needed)
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) and click **"▶ Quick Demo"** to see all 4 pillars in action.

**Try the Publish feature:** After creating files, click the **"🌐 Publish"** button to generate a shareable link where anyone can view your project!

**Need help?** Click the **"🛟 Support"** button in the toolbar to request live engineer assistance. Your session context is automatically included for faster resolution.

## Screenshots

### Landing Screen
Clean onboarding with the 4-pillar overview, recent projects, and quick demo access. Dark theme with indigo/purple accents.

### Workspace — Chat Panel (Left)
- Message bubbles with markdown rendering (bold, code blocks, inline code)
- File reference chips that are clickable
- Typing indicator showing *what* the agent is thinking about
- 👍👎 reactions on agent messages that feed into adaptability
- Strategy selector (conservative/balanced/aggressive)

### Workspace — Activity Feed (Right)
- Real-time natural language activity feed with timestamps
- Category icons: 🔍 search, 📝 write, 🧪 test, 🔧 fix, 🧠 think, ✅ verify
- Collapsible detail sections (click to see code/diffs)
- Live 4-pillar score cards updating as work progresses
- File tree showing which files are being touched
- Progress bar for the current task

### Workspace — Code Editor
- Monaco Editor with syntax highlighting
- Multi-file tabs with close buttons
- File tree with modified-file indicators (✏️)
- Terminal output panel
- Diff view for all changes with addition/deletion counts

### Pillar Dashboard (Bottom)
- All 4 pillars with live scores, status dots, and progress bars
- Click to expand: see formulas, descriptions, and coding DNA profile
- Yellow pulsing glow for pillars awaiting action

## Key Features

### 🌐 Publish & Share
- **One-click publishing:** Click the "🌐 Publish" button to instantly generate a unique shareable link
- **Public project gallery:** Published projects get a permanent URL at `/p/[id]` where anyone can view the code
- **No signup required:** Visitors can browse published projects without creating accounts
- **Auto-generated stats:** View count tracking and project metadata
- **Copy-to-clipboard:** Shareable links are automatically copied for easy sharing

### 🔧 Advanced Code Editor
- **Monaco Editor integration:** Full VS Code editing experience in the browser
- **Multi-file support:** Tabbed interface with file tree navigation
- **File management:** Create, delete, and rename files and folders via right-click context menu or toolbar buttons
- **Inline editing:** Rename files/folders inline with keyboard support (Enter to confirm, Escape to cancel)
- **Context menus:** Right-click any file or folder for quick actions (rename, delete, new file, new folder)
- **Syntax highlighting:** Language-aware highlighting for TypeScript, JavaScript, HTML, CSS, and more
- **Live editing:** Real-time file content updates with change tracking

### 💾 Session Persistence
- **Auto-save:** Sessions are automatically saved to localStorage every 30 seconds
- **Save/Load projects:** Click "💾 Save" to name and save your project; load it from the landing screen
- **Auto-save recovery:** If you close the tab mid-session, a recovery prompt appears on next visit
- **Project management:** View, load, and delete saved projects from the landing screen
- **Session history:** Browse previous coding sessions with full context
- **Export functionality:** Download session reports as Markdown files
- **Before-unload protection:** Session state is captured when closing the browser tab

### 🛡️ Error Handling & Resilience
- **React Error Boundaries:** Every major panel (chat, preview, code editor, file tree) is wrapped in error boundaries with graceful fallback UI — one panel crashing won't take down the whole app
- **Network status detection:** Offline/online indicator appears automatically when connectivity changes
- **Detailed error feedback:** API and streaming errors show specific toast notifications with actionable messages
- **Error recovery:** Error boundary fallbacks include "Try Again" and "Copy Error" buttons for easy debugging
- **Console logging:** All errors are logged to the terminal panel for visibility
- **Stream error handling:** SSE streaming errors are caught and displayed inline without crashing the session

### 📱 Responsive Design
- **Mobile-optimized:** Adaptive layout that works on phones and tablets
- **Flexible panels:** Collapsible sidebar panels for optimal screen real estate
- **Touch-friendly controls:** Optimized for touch interaction

## Architecture

```
app/
├── page.tsx              # Router: landing vs workspace view
├── store.ts              # Zustand store — all app state
├── mock-agent.ts         # Mock agent with realistic simulation
├── globals.css           # Tailwind + custom animations
├── layout.tsx            # Root layout with metadata
├── lib/
│   ├── parse-code.ts       # Code block parser
│   └── persistence.ts      # localStorage save/load/autosave
└── components/
    ├── LandingScreen.tsx    # Onboarding / start screen
    ├── ChatPanel.tsx        # Chat with markdown, reactions
    ├── ActivityPanel.tsx    # Real-time activity feed
    ├── WorkspacePanel.tsx   # Monaco editor + terminal + diffs
    ├── PillarDashboard.tsx  # 4-pillar scores (expandable)
    ├── ControlBar.tsx       # Phase, speed, pause, reset
    ├── TaskUnderstandingCard.tsx  # Alignment confirmation
    └── ApproachSelector.tsx      # Steerability choices
```

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with App Router |
| **React 18** | UI components |
| **TypeScript** | Type safety (strict, no `any`) |
| **Tailwind CSS** | Utility-first styling |
| **Zustand** | Lightweight state management |
| **Monaco Editor** | VS Code editor component |

## Mock Mode

Everything works without API keys. Mock mode simulates:
- Realistic agent behavior with configurable speed (1x/2x/3x)
- Activity feed updating with natural timing
- All 4 pillars demonstrating their functionality
- Complete task lifecycle: understand → propose → code → verify → complete
- File creation with real TypeScript code
- Test results with coverage metrics

## Design

- **Background:** `#0e0e10`
- **Surface:** `#1a1a1f`
- **Accent:** `#6366f1` (Indigo)
- **Accent Purple:** `#a855f7`
- **Font:** Inter
- **Animations:** CSS keyframes (fade-in, typing dots, pulse glow)
- **Responsive:** Mobile-first chat, desktop split-panel

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes — **`npm run build` must pass with zero errors**
4. No `any` types. Use proper TypeScript.
5. Submit a PR with description of what changed and why

## Reference

This project implements concepts from:

> *"Humans are Missing from AI Coding Agent Research"*
>
> The paper argues that current AI coding agent evaluations focus exclusively on
> code correctness (SWE-bench, HumanEval) while ignoring the human experience.
> It proposes a formal framework with four pillars — Alignment, Steerability,
> Verification, and Adaptability — each with mathematical formulations for
> measuring interaction quality.

## License

MIT
