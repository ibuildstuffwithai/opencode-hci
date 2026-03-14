# OpenCode HCI — Improvement Log

## Completed Items

### 1. ✅ Publish Feature — Shareable Links (`/p/[id]`)
- **Status:** Done
- API route at `/api/publish` (POST to create, GET to fetch)
- Published project viewer at `/p/[id]` with file browser, code viewer, stats, copy button
- In-memory store (production would use a database)

### 2. ✅ Get Support Button
- **Status:** Done
- `SupportModal` component with issue description, priority selector, email field
- Auto-includes session context (message count, files, recent messages)
- Success state with confirmation UI

### 3. ✅ Better Code Editor — Monaco
- **Status:** Done
- Monaco Editor via `@monaco-editor/react` with dynamic import (no SSR)
- Syntax highlighting for TS, JS, HTML, CSS, JSON, Python, Markdown
- Line numbers, word wrap, tab size 2, auto-layout

### 4. ✅ Multi-File Support — File Tree with CRUD
- **Status:** Done
- Full file tree with folders, create/delete/rename
- Right-click context menus, inline rename input
- New file/folder buttons in header, "+" on folder hover
- Tab bar in editor with close buttons

### 5. ✅ Mobile Responsive Layout
- **Status:** Done
- `useIsMobile()` hook with 768px breakpoint
- Bottom tab bar (Preview/Build/Chat/Files/Code)
- Safe area bottom padding for notch devices
- Compact mobile header

### 6. ✅ Error Handling & User Feedback
- **Status:** Done
- `ErrorBoundary` wrapping every major panel
- `ToastContainer` with success/error/warning/info types, auto-dismiss
- `NetworkStatus` offline/online indicator
- Chat error system (`chatErrors` in store) with inline display
- Detailed error messages for API/stream failures

### 7. ✅ General Polish — Animations, Transitions, Empty States
- **Status:** Done
- **Updated:** 2026-03-14
- CSS animations: `fadeIn`, `slideInRight`, `slideUp`, `shimmer`, `pulse-glow`, `fadeScaleIn`, `slideOutLeft`, `skeletonPulse`, `staggerFadeIn`
- Skeleton loading indicators in Preview and Code Editor empty states
- `hover-lift` effect on interactive cards
- `animate-fade-scale-in` on modals (Save, Support)
- `stagger-children` on landing page pillar cards
- `safe-area-bottom` CSS class for mobile notch
- `focus-ring` utility for keyboard accessibility
- Improved empty states with gradient containers and decorative elements

### 8. ✅ README — Comprehensive Documentation
- **Status:** Done
- Full feature documentation including Publish, Support, Editor, Persistence
- Architecture diagram, tech stack table, design tokens
- Contributing guidelines, mock mode explanation

---

## Deployment History

| Date | What Changed | URL |
|------|-------------|-----|
| 2026-03-14 | Polish: animations, transitions, empty states, modal animations, skeleton loaders | https://web-five-smoky-69.vercel.app |
| 2026-03-14 | Enhanced #6: ConfirmDialog for file delete, InlineError with retry in chat, streaming progress bar, API error classification | https://web-five-smoky-69.vercel.app |
