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

### 9. ✅ Export Project as ZIP
- **Status:** Done
- **Updated:** 2026-03-14
- Added `jszip` dependency for client-side ZIP generation
- 📦 ZIP button in ControlBar (visible when files exist)
- Flattens entire file tree into a ZIP archive with correct paths
- Downloads as `opencode-project-YYYY-MM-DD.zip`
- Toast notification with file count on download
- Styled with cyan/blue gradient to match other action buttons

### 10. ✅ Keyboard Shortcuts Guide
- **Status:** Done
- **Updated:** 2026-03-14
- `KeyboardShortcuts` component — modal overlay triggered by `?` key
- Shows all shortcuts organized in 4 groups: General, Panels, Editor, Navigation
- Styled kbd keys with dark backgrounds and borders
- 2-column responsive grid layout
- ❓ Help button in desktop header for discoverability
- `toggleKeyboardShortcuts()` export for programmatic access
- Closes on Escape or clicking outside

### 11. ✅ Dark/Light Theme Toggle
- **Status:** Done
- **Updated:** 2026-03-14
- CSS custom properties for all theme colors (background, foreground, surface, border, muted, accent)
- Light theme with clean whites, soft grays, and adjusted accent colors
- `toggleTheme()` in Zustand store with localStorage persistence
- Inline script in `<head>` prevents flash of wrong theme on load
- ☀️/🌙 toggle button in both desktop and mobile headers
- All hardcoded dark colors (`#0a0a0c`, `#0e0e10`, `text-white`) replaced with CSS variable equivalents
- Smooth `transition-colors duration-200` on body for theme switch animation
- Scrollbar colors adapt to theme

### 12. ✅ Resizable Panels with Drag Handles
- **Status:** Done
- **Updated:** 2026-03-14
- `ResizeHandle` component with horizontal/vertical drag support
- Side panel (Build/Chat/Design/Files) resizable by dragging right edge (220–600px)
- Code editor overlay resizable by dragging left edge (250–800px)
- Console/Terminal panel resizable by dragging top edge (80–500px)
- Visual feedback: accent-colored indicator line appears on hover/drag
- Cursor changes to col-resize/row-resize during drag
- Text selection disabled during drag to prevent accidental highlighting
- Removed old up/down arrow buttons for console resize (drag is more intuitive)

### 13. ✅ Project Templates Gallery
- **Status:** Done
- **Updated:** 2026-03-14
- `TemplateGallery` component — full-page template browser with search and category filters
- 6 starter templates: Landing Page, Admin Dashboard, REST API, Real-time Chat, CLI Tool, Portfolio Site
- Each template includes pre-built file scaffolds and an agent prompt
- Click-to-expand detail view with file tree preview and prompt
- "Use This Template" loads files into workspace and kicks off the agent
- Category filter tabs (All, Frontend, Backend, Full Stack, Utility)
- Difficulty badges (beginner/intermediate/advanced) with color coding
- Search by title, description, or tags
- Accessible from Landing Page ("📋 Templates" button) and Command Palette
- `templates` view added to store's `AppView` type

---

## Deployment History

| Date | What Changed | URL |
|------|-------------|-----|
| 2026-03-14 | Polish: animations, transitions, empty states, modal animations, skeleton loaders | https://web-five-smoky-69.vercel.app |
| 2026-03-14 | Enhanced #6: ConfirmDialog for file delete, InlineError with retry in chat, streaming progress bar, API error classification | https://web-five-smoky-69.vercel.app |
| 2026-03-14 | #9: Export Project as ZIP — client-side ZIP download with JSZip | https://web-five-smoky-69.vercel.app |
| 2026-03-14 | #10: Keyboard Shortcuts Guide — ? key overlay with all hotkeys | https://web-five-smoky-69.vercel.app |
| 2026-03-14 | #11: Dark/Light Theme Toggle — CSS vars, localStorage persistence, smooth transitions | https://web-five-smoky-69.vercel.app |
| 2026-03-14 | #12: Resizable Panels — drag handles on side panel, code overlay, and console | https://web-five-smoky-69.vercel.app |
| 2026-03-14 | #13: Project Templates Gallery — 6 starter templates with search, filters, file preview | https://web-five-smoky-69.vercel.app |
