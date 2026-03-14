# OpenCode HCI Web UI

A Next.js 14 web UI for the OpenCode AI coding agent, featuring real tool execution, terminal, file system access, and HCI pillars (Alignment, Steerability, Verification, Adaptability).

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Next.js Web UI (port 3000)                     │
│  ┌──────────────┐  ┌────────────────────┐       │
│  │ Build/Chat/  │  │ Preview / Editor   │       │
│  │ Design Modes │  │                    │       │
│  └──────┬───────┘  └────────────────────┘       │
│         │                                        │
│  ┌──────▼──────────────────────┐                │
│  │ /api/opencode/* (proxy)     │                │
│  │ /api/chat (fallback direct) │                │
│  └──────┬──────────────────────┘                │
└─────────┼───────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────┐
│  OpenCode Server (port 4096)                     │
│  ┌──────────┐ ┌──────┐ ┌─────┐ ┌───────────┐   │
│  │ Sessions │ │ PTY  │ │Files│ │ Providers  │   │
│  └──────────┘ └──────┘ └─────┘ └───────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ Agent: bash, file_edit, grep, LSP, etc.  │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Quick Start

### 1. Start OpenCode Server

```bash
cd ~/clawd/opencode-hci

# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-api03-...

# Start the server (uses Bun)
bun run --cwd packages/opencode --conditions=browser src/index.ts serve --port 4096
```

### 2. Start the Web UI

```bash
cd ~/clawd/opencode-hci/web

# Install dependencies (if needed)
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

### Real Backend Integration
- **Sessions**: Uses OpenCode's session management — conversations persist across reloads
- **Tool Execution**: Agent uses real tools (bash, file edit, write, grep, glob, LSP)
- **File System**: Browse actual project files, not just in-memory state
- **Terminal**: PTY terminal connected to real shell via WebSocket
- **Providers**: Uses OpenCode's multi-provider system

### HCI Pillars
- **Alignment**: Task understanding, approach selection
- **Steerability**: Speed/detail controls, pause/redirect
- **Verification**: Code diffs, test results, preview
- **Adaptability**: Learning from interactions, preference tracking

### Modes
- **Build**: Full code generation with real tool execution
- **Chat**: Conversational Q&A about code
- **Design**: Visual-to-code with Claude Vision (image upload)
- **Files**: Real file system browser with search

### Graceful Fallback
If the OpenCode server is not running, the UI automatically falls back to direct Anthropic API calls (no tool execution, but still generates code).

## Configuration

Environment variables (in `.env.local`):

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | — | API key for fallback direct mode |
| `NEXT_PUBLIC_OPENCODE_URL` | `http://127.0.0.1:4096` | OpenCode server URL |
| `NEXT_PUBLIC_OPENCODE_WS` | `ws://127.0.0.1:4096` | OpenCode WebSocket URL |
| `OPENCODE_SERVER_URL` | `http://127.0.0.1:4096` | Server URL for proxy routes |
| `OPENCODE_DIRECTORY` | `process.cwd()` | Project directory for OpenCode |

## API Routes

| Route | Description |
|-------|-------------|
| `/api/opencode/*` | Proxy to OpenCode server |
| `/api/chat` | Direct Anthropic API (fallback) |

## Key Files

- `app/lib/opencode-client.ts` — TypeScript client for OpenCode's HTTP API
- `app/stream-agent.ts` — Agent runner (OpenCode → fallback to direct API)
- `app/api/opencode/[...path]/route.ts` — Proxy to OpenCode server
- `app/components/RealFileTree.tsx` — Real file system browser
- `app/components/TerminalPanel.tsx` — PTY terminal panel
- `app/components/SessionManager.tsx` — OpenCode session management
