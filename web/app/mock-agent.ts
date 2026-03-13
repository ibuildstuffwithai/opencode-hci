import { useStore, FileNode, DiffChange } from "./store";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_FILES: FileNode[] = [
  {
    name: "src",
    path: "src",
    type: "folder",
    children: [
      {
        name: "App.tsx",
        path: "src/App.tsx",
        type: "file",
        content: `import React from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={\`app \${theme}\`}>
      <Header onToggleTheme={toggleTheme} />
      <main className="container mx-auto px-4 py-8">
        <Dashboard />
      </main>
    </div>
  );
}`,
      },
      {
        name: "components",
        path: "src/components",
        type: "folder",
        children: [
          {
            name: "Header.tsx",
            path: "src/components/Header.tsx",
            type: "file",
            content: `import React from 'react';

interface HeaderProps {
  onToggleTheme: () => void;
}

export function Header({ onToggleTheme }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <button onClick={onToggleTheme} className="px-3 py-1 rounded bg-indigo-500 text-white">
        Toggle Theme
      </button>
    </header>
  );
}`,
          },
          {
            name: "Dashboard.tsx",
            path: "src/components/Dashboard.tsx",
            type: "file",
            content: `import React from 'react';
import { StatCard } from './StatCard';
import { useStats } from '../hooks/useStats';

export function Dashboard() {
  const stats = useStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}`,
          },
          {
            name: "StatCard.tsx",
            path: "src/components/StatCard.tsx",
            type: "file",
            content: `import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
}

export function StatCard({ label, value, trend }: StatCardProps) {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';
  
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className={\`text-sm mt-2 \${trendColor}\`}>
        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trend}
      </p>
    </div>
  );
}`,
          },
        ],
      },
      {
        name: "hooks",
        path: "src/hooks",
        type: "folder",
        children: [
          {
            name: "useTheme.ts",
            path: "src/hooks/useTheme.ts",
            type: "file",
            content: `import { useState, useCallback } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);
  return { theme, toggleTheme };
}`,
          },
          {
            name: "useStats.ts",
            path: "src/hooks/useStats.ts",
            type: "file",
            content: `export function useStats() {
  return [
    { label: 'Total Users', value: '12,847', trend: 'up' as const },
    { label: 'Revenue', value: '$48,290', trend: 'up' as const },
    { label: 'Active Sessions', value: '1,429', trend: 'neutral' as const },
  ];
}`,
          },
        ],
      },
    ],
  },
  {
    name: "package.json",
    path: "package.json",
    type: "file",
    content: `{
  "name": "dashboard-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
  },
  {
    name: "README.md",
    path: "README.md",
    type: "file",
    content: `# Dashboard App

A modern dashboard built with React and TypeScript.

## Features
- Responsive grid layout
- Dark/light theme toggle
- Stat cards with trend indicators

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\`
`,
  },
];

const MOCK_DIFFS: DiffChange[] = [
  { file: "src/App.tsx", additions: 24, deletions: 0, content: "+ import { Header } from './components/Header';\n+ import { Dashboard } from './components/Dashboard';" },
  { file: "src/components/Header.tsx", additions: 18, deletions: 0, content: "+ export function Header({ onToggleTheme }: HeaderProps) {" },
  { file: "src/components/Dashboard.tsx", additions: 15, deletions: 0, content: "+ export function Dashboard() {" },
  { file: "src/components/StatCard.tsx", additions: 22, deletions: 0, content: "+ export function StatCard({ label, value, trend }: StatCardProps) {" },
  { file: "README.md", additions: 12, deletions: 0, content: "+ # Dashboard App\n+ A modern dashboard built with React and TypeScript." },
];

const TERMINAL_LINES = [
  "$ opencode analyze task...",
  "✓ Parsed requirements (3 features identified)",
  "✓ Checked project context",
  "$ mkdir -p src/components src/hooks",
  "$ touch src/App.tsx",
  "  Writing App.tsx... (24 lines)",
  "$ touch src/components/Header.tsx",
  "  Writing Header.tsx... (18 lines)",
  "$ touch src/components/Dashboard.tsx",
  "  Writing Dashboard.tsx... (15 lines)",
  "$ touch src/components/StatCard.tsx",
  "  Writing StatCard.tsx... (22 lines)",
  "$ touch src/hooks/useTheme.ts",
  "  Writing useTheme.ts... (10 lines)",
  "$ touch src/hooks/useStats.ts",
  "  Writing useStats.ts... (8 lines)",
  "$ npm run typecheck",
  "  ✓ No type errors found",
  "$ npm run test",
  "  PASS src/components/StatCard.test.tsx",
  "  PASS src/hooks/useTheme.test.ts",
  "  Tests: 5 passed, 0 failed",
  "$ generating README.md...",
  "  ✓ README.md generated",
  "✓ All files created successfully",
];

export async function runMockAgent(userMessage: string) {
  const store = useStore.getState();
  const speed = [1200, 700, 300][store.speedLevel - 1];
  
  store.addMessage("user", userMessage);
  store.setInput("");
  store.setTyping(true);
  store.clearTerminal();

  // Phase 1: Understanding
  await delay(speed);
  store.setPhase("understanding");
  store.setPillar("alignment", { score: 0.6, status: "yellow", detail: "Analyzing task requirements..." });
  store.addMessage("assistant", "Let me analyze your request and break it down...");
  
  await delay(speed);
  store.setTyping(false);
  store.setTaskUnderstanding({
    requirements: [
      "Create a responsive dashboard with stat cards",
      "Implement dark/light theme toggle",
      "Use TypeScript with proper types",
    ],
    assumptions: [
      "React 18 with functional components",
      "Tailwind CSS for styling",
      "No external data fetching needed (mock data)",
    ],
    questions: [
      "Should charts be included in the dashboard?",
    ],
  });
  store.setPillar("alignment", { score: 0.85, status: "yellow", detail: "Awaiting user confirmation" });

  // Wait for user to confirm (simulated)
  await delay(speed * 2);
  store.confirmAlignment();

  // Phase 2: Proposing approaches
  store.setPhase("proposing");
  store.setTyping(true);
  store.setPillar("steerability", { score: 0.7, status: "yellow", detail: "Presenting approaches" });
  
  await delay(speed);
  store.setTyping(false);
  store.setApproaches([
    {
      id: "a1",
      title: "Component-First Architecture",
      description: "Build small, reusable components. Start with StatCard, compose into Dashboard.",
      pros: ["Highly reusable", "Easy to test", "Clear separation"],
      cons: ["More files upfront", "Slightly more boilerplate"],
    },
    {
      id: "a2",
      title: "Feature-Based Structure",
      description: "Organize by feature (dashboard, settings) with co-located components.",
      pros: ["Feature isolation", "Easy to navigate", "Scales well"],
      cons: ["May duplicate shared components", "Convention-heavy"],
    },
    {
      id: "a3",
      title: "Minimal Flat Structure",
      description: "All components in a single folder, minimal nesting.",
      pros: ["Simple", "Fast to implement", "Low overhead"],
      cons: ["Harder to scale", "Less organized"],
    },
  ]);

  await delay(speed * 2);
  store.selectApproach("a1");
  store.setPillar("steerability", { score: 0.88, status: "green", detail: "Approach selected" });
  store.addMessage("assistant", "Great choice! Starting with component-first architecture. I'll build reusable components and compose them together.");

  // Phase 3: Coding
  store.setPhase("coding");
  store.setTyping(true);
  store.setPillar("verification", { score: 0.3, status: "yellow", detail: "Generating code..." });
  
  for (let i = 0; i < TERMINAL_LINES.length; i++) {
    if (useStore.getState().isPaused) {
      while (useStore.getState().isPaused) await delay(200);
    }
    await delay(speed / 3);
    store.addTerminalLine(TERMINAL_LINES[i]);
  }

  store.setFiles(MOCK_FILES);
  store.setActiveFile("src/App.tsx");
  store.setTyping(false);

  // Phase 4: Verification
  store.setPhase("verifying");
  store.setDiffs(MOCK_DIFFS);
  store.setTestResults({ passed: 5, failed: 0, total: 5 });
  store.setPillar("verification", { score: 0.95, status: "green", detail: "All tests pass, code reviewed" });
  
  await delay(speed);
  store.addMessage("assistant", "✅ All done! Created 6 files with full TypeScript types. All 5 tests pass. README.md generated. Check the workspace to review the code and diffs.");

  // Phase 5: Complete
  store.setPhase("complete");
  
  // Update adaptability
  const interactions = useStore.getState().preferences.interactionCount;
  const adaptScore = Math.min(0.95, 0.3 + interactions * 0.08);
  store.setPillar("adaptability", {
    score: adaptScore,
    status: adaptScore > 0.7 ? "green" : "yellow",
    detail: `Learned from ${interactions} interactions`,
  });
}
