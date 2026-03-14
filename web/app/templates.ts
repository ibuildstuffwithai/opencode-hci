import { FileNode } from "./store";

export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "frontend" | "backend" | "fullstack" | "utility";
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  files: FileNode[];
  prompt: string; // what to tell the agent
}

export const TEMPLATES: ProjectTemplate[] = [
  {
    id: "react-landing",
    title: "Landing Page",
    description: "Modern responsive landing page with hero, features, pricing, and CTA sections",
    icon: "🚀",
    category: "frontend",
    tags: ["React", "Tailwind", "Responsive"],
    difficulty: "beginner",
    prompt: "Build a modern landing page with a hero section, features grid, pricing cards, testimonials, and a CTA footer. Use Tailwind CSS for styling. Make it fully responsive.",
    files: [
      { name: "src", path: "src", type: "folder", children: [
        { name: "App.tsx", path: "src/App.tsx", type: "file", content: `import { Hero } from './components/Hero';\nimport { Features } from './components/Features';\nimport { Pricing } from './components/Pricing';\nimport { Footer } from './components/Footer';\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-gray-950 text-white">\n      <Hero />\n      <Features />\n      <Pricing />\n      <Footer />\n    </div>\n  );\n}` },
        { name: "components", path: "src/components", type: "folder", children: [
          { name: "Hero.tsx", path: "src/components/Hero.tsx", type: "file", content: `export function Hero() {\n  return (\n    <section className="py-24 px-6 text-center">\n      <h1 className="text-5xl font-bold mb-4">Your Product</h1>\n      <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">\n        A brief description of what makes your product amazing.\n      </p>\n      <button className="px-8 py-3 bg-indigo-600 rounded-xl font-medium hover:bg-indigo-500 transition">\n        Get Started\n      </button>\n    </section>\n  );\n}` },
          { name: "Features.tsx", path: "src/components/Features.tsx", type: "file", content: `// TODO: Build features grid` },
          { name: "Pricing.tsx", path: "src/components/Pricing.tsx", type: "file", content: `// TODO: Build pricing cards` },
          { name: "Footer.tsx", path: "src/components/Footer.tsx", type: "file", content: `// TODO: Build footer with CTA` },
        ]},
      ]},
      { name: "package.json", path: "package.json", type: "file", content: `{\n  "name": "landing-page",\n  "dependencies": {\n    "react": "^18.2.0",\n    "tailwindcss": "^3.4.0"\n  }\n}` },
    ],
  },
  {
    id: "dashboard",
    title: "Admin Dashboard",
    description: "Data dashboard with sidebar navigation, charts, tables, and stat cards",
    icon: "📊",
    category: "frontend",
    tags: ["React", "Charts", "Tables"],
    difficulty: "intermediate",
    prompt: "Build an admin dashboard with a collapsible sidebar, stat cards at the top, a line chart for revenue, a data table with sorting and pagination, and a dark theme.",
    files: [
      { name: "src", path: "src", type: "folder", children: [
        { name: "App.tsx", path: "src/App.tsx", type: "file", content: `import { Sidebar } from './components/Sidebar';\nimport { Dashboard } from './components/Dashboard';\n\nexport default function App() {\n  return (\n    <div className="flex h-screen bg-gray-950">\n      <Sidebar />\n      <Dashboard />\n    </div>\n  );\n}` },
        { name: "components", path: "src/components", type: "folder", children: [
          { name: "Sidebar.tsx", path: "src/components/Sidebar.tsx", type: "file", content: `// TODO: Collapsible sidebar with nav items` },
          { name: "Dashboard.tsx", path: "src/components/Dashboard.tsx", type: "file", content: `// TODO: Main dashboard layout with stat cards and charts` },
          { name: "StatCard.tsx", path: "src/components/StatCard.tsx", type: "file", content: `// TODO: Reusable stat card component` },
          { name: "DataTable.tsx", path: "src/components/DataTable.tsx", type: "file", content: `// TODO: Sortable data table with pagination` },
        ]},
      ]},
    ],
  },
  {
    id: "rest-api",
    title: "REST API Server",
    description: "Express.js REST API with CRUD routes, middleware, validation, and error handling",
    icon: "⚡",
    category: "backend",
    tags: ["Node.js", "Express", "REST"],
    difficulty: "intermediate",
    prompt: "Build a REST API with Express.js. Include CRUD routes for a 'tasks' resource, input validation middleware, error handling middleware, and a health check endpoint. Use TypeScript.",
    files: [
      { name: "src", path: "src", type: "folder", children: [
        { name: "index.ts", path: "src/index.ts", type: "file", content: `import express from 'express';\nimport { taskRouter } from './routes/tasks';\nimport { errorHandler } from './middleware/errors';\n\nconst app = express();\napp.use(express.json());\n\napp.get('/health', (_, res) => res.json({ status: 'ok' }));\napp.use('/api/tasks', taskRouter);\napp.use(errorHandler);\n\napp.listen(3000, () => console.log('Server running on :3000'));` },
        { name: "routes", path: "src/routes", type: "folder", children: [
          { name: "tasks.ts", path: "src/routes/tasks.ts", type: "file", content: `// TODO: CRUD routes for tasks` },
        ]},
        { name: "middleware", path: "src/middleware", type: "folder", children: [
          { name: "errors.ts", path: "src/middleware/errors.ts", type: "file", content: `// TODO: Error handling middleware` },
          { name: "validate.ts", path: "src/middleware/validate.ts", type: "file", content: `// TODO: Input validation middleware` },
        ]},
      ]},
      { name: "package.json", path: "package.json", type: "file", content: `{\n  "name": "rest-api",\n  "dependencies": {\n    "express": "^4.18.0"\n  },\n  "devDependencies": {\n    "typescript": "^5.0.0",\n    "@types/express": "^4.17.0"\n  }\n}` },
    ],
  },
  {
    id: "chat-app",
    title: "Real-time Chat",
    description: "Chat application with rooms, typing indicators, and message history",
    icon: "💬",
    category: "fullstack",
    tags: ["WebSocket", "React", "Real-time"],
    difficulty: "advanced",
    prompt: "Build a real-time chat application with multiple rooms, typing indicators, online user list, message history with timestamps, and emoji reactions. Use WebSocket for real-time communication.",
    files: [
      { name: "client", path: "client", type: "folder", children: [
        { name: "App.tsx", path: "client/App.tsx", type: "file", content: `// TODO: Chat UI with rooms, messages, and user list` },
        { name: "components", path: "client/components", type: "folder", children: [
          { name: "ChatRoom.tsx", path: "client/components/ChatRoom.tsx", type: "file", content: `// TODO: Chat room with messages` },
          { name: "MessageList.tsx", path: "client/components/MessageList.tsx", type: "file", content: `// TODO: Scrollable message list` },
          { name: "RoomSidebar.tsx", path: "client/components/RoomSidebar.tsx", type: "file", content: `// TODO: Room list sidebar` },
        ]},
      ]},
      { name: "server", path: "server", type: "folder", children: [
        { name: "index.ts", path: "server/index.ts", type: "file", content: `// TODO: WebSocket server with room management` },
      ]},
    ],
  },
  {
    id: "cli-tool",
    title: "CLI Tool",
    description: "Node.js command-line tool with argument parsing, colored output, and progress bars",
    icon: "🖥️",
    category: "utility",
    tags: ["Node.js", "CLI", "TypeScript"],
    difficulty: "beginner",
    prompt: "Build a CLI tool with commander.js that has multiple subcommands, colored output with chalk, a progress bar for long operations, and interactive prompts with inquirer.",
    files: [
      { name: "src", path: "src", type: "folder", children: [
        { name: "index.ts", path: "src/index.ts", type: "file", content: `#!/usr/bin/env node\nimport { Command } from 'commander';\n\nconst program = new Command();\nprogram\n  .name('mytool')\n  .description('A powerful CLI tool')\n  .version('1.0.0');\n\n// TODO: Add subcommands\n\nprogram.parse();` },
        { name: "commands", path: "src/commands", type: "folder", children: [
          { name: "init.ts", path: "src/commands/init.ts", type: "file", content: `// TODO: Init command with interactive prompts` },
          { name: "build.ts", path: "src/commands/build.ts", type: "file", content: `// TODO: Build command with progress bar` },
        ]},
      ]},
      { name: "package.json", path: "package.json", type: "file", content: `{\n  "name": "cli-tool",\n  "bin": { "mytool": "./dist/index.js" },\n  "dependencies": {\n    "commander": "^11.0.0",\n    "chalk": "^5.3.0",\n    "inquirer": "^9.0.0"\n  }\n}` },
    ],
  },
  {
    id: "portfolio",
    title: "Portfolio Site",
    description: "Personal portfolio with project showcase, about section, contact form, and animations",
    icon: "🎨",
    category: "frontend",
    tags: ["React", "Animations", "Portfolio"],
    difficulty: "beginner",
    prompt: "Build a personal portfolio website with a hero with animated text, a project grid with hover effects, an about section with skills, a contact form, and smooth scroll navigation.",
    files: [
      { name: "src", path: "src", type: "folder", children: [
        { name: "App.tsx", path: "src/App.tsx", type: "file", content: `import { Nav } from './components/Nav';\nimport { Hero } from './components/Hero';\nimport { Projects } from './components/Projects';\nimport { About } from './components/About';\nimport { Contact } from './components/Contact';\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-black text-white">\n      <Nav />\n      <Hero />\n      <Projects />\n      <About />\n      <Contact />\n    </div>\n  );\n}` },
        { name: "components", path: "src/components", type: "folder", children: [
          { name: "Nav.tsx", path: "src/components/Nav.tsx", type: "file", content: `// TODO: Sticky nav with smooth scroll links` },
          { name: "Hero.tsx", path: "src/components/Hero.tsx", type: "file", content: `// TODO: Hero with animated typing text` },
          { name: "Projects.tsx", path: "src/components/Projects.tsx", type: "file", content: `// TODO: Project grid with hover cards` },
          { name: "About.tsx", path: "src/components/About.tsx", type: "file", content: `// TODO: About section with skill bars` },
          { name: "Contact.tsx", path: "src/components/Contact.tsx", type: "file", content: `// TODO: Contact form` },
        ]},
      ]},
    ],
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All", icon: "✨" },
  { id: "frontend", label: "Frontend", icon: "🎨" },
  { id: "backend", label: "Backend", icon: "⚡" },
  { id: "fullstack", label: "Full Stack", icon: "🔗" },
  { id: "utility", label: "Utility", icon: "🛠" },
] as const;
