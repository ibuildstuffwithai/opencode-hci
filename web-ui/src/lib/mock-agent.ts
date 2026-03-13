/**
 * Mock Agent - Simulates realistic coding agent behavior
 * Used when no ANTHROPIC_API_KEY is set
 */

import { v4 as uuid } from 'uuid';
import type {
  AgentTask,
  ChatMessage,
  FileNode,
  TerminalLine,
  AlignmentCard,
  Approach,
  VerificationResult,
} from '@/types';

// ── Simulated delays ────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Mock code templates ─────────────────────────────────────────────────────

const MOCK_FILES: Record<string, { content: string; language: string }> = {
  'src/index.ts': {
    language: 'typescript',
    content: `import express from 'express';
import { router } from './routes';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', router);

app.listen(PORT, () => {
  logger.info(\`Server running on port \${PORT}\`);
});

export default app;`,
  },
  'src/routes/index.ts': {
    language: 'typescript',
    content: `import { Router } from 'express';
import { healthCheck, getUsers, createUser } from '../controllers';

export const router = Router();

router.get('/health', healthCheck);
router.get('/users', getUsers);
router.post('/users', createUser);`,
  },
  'src/controllers/index.ts': {
    language: 'typescript',
    content: `import { Request, Response } from 'express';
import { UserService } from '../services/user';

export const healthCheck = (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};

export const getUsers = async (_req: Request, res: Response) => {
  const users = await UserService.findAll();
  res.json({ users });
};

export const createUser = async (req: Request, res: Response) => {
  const user = await UserService.create(req.body);
  res.status(201).json({ user });
};`,
  },
  'package.json': {
    language: 'json',
    content: JSON.stringify({
      name: 'generated-project',
      version: '1.0.0',
      scripts: { dev: 'tsx watch src/index.ts', build: 'tsc', start: 'node dist/index.js' },
      dependencies: { express: '^4.18.0' },
      devDependencies: { typescript: '^5.0.0', tsx: '^4.0.0', '@types/express': '^4.17.0' },
    }, null, 2),
  },
  'README.md': {
    language: 'markdown',
    content: `# Generated Project

## Description
A REST API server built with Express and TypeScript.

## Setup
\`\`\`bash
npm install
npm run dev
\`\`\`

## Architecture
- \`src/index.ts\` — Entry point, Express server setup
- \`src/routes/\` — API route definitions
- \`src/controllers/\` — Request handlers
- \`src/services/\` — Business logic

## What Was Built
An Express.js REST API with health check, user CRUD endpoints, and TypeScript configuration.
`,
  },
};

// ── Mock alignment generation ───────────────────────────────────────────────

function generateAlignment(prompt: string): AlignmentCard {
  const words = prompt.toLowerCase();
  const requirements: string[] = [];
  const assumptions: string[] = [];
  const questions: string[] = [];

  if (words.includes('api') || words.includes('server') || words.includes('endpoint')) {
    requirements.push('Build a REST API server');
    requirements.push('Implement CRUD endpoints');
    assumptions.push('Using Express.js with TypeScript');
    questions.push('Should authentication be included?');
  }
  if (words.includes('react') || words.includes('ui') || words.includes('frontend')) {
    requirements.push('Build a React frontend');
    assumptions.push('Using React 18 with TypeScript');
    questions.push('Any specific design system preference?');
  }
  if (words.includes('database') || words.includes('db')) {
    requirements.push('Set up database integration');
    assumptions.push('Using SQLite for simplicity');
  }

  if (requirements.length === 0) {
    requirements.push('Implement the requested functionality');
    requirements.push('Follow TypeScript best practices');
    assumptions.push('Node.js environment');
    questions.push('Any specific framework preferences?');
  }

  return { requirements, assumptions, clarifyingQuestions: questions, confirmed: false };
}

// ── Mock approaches ─────────────────────────────────────────────────────────

function generateApproaches(): Approach[] {
  return [
    {
      id: uuid(),
      title: 'Standard Architecture',
      description: 'Clean separation of concerns with controllers, services, and routes.',
      pros: ['Well-organized', 'Easy to test', 'Scalable'],
      cons: ['More boilerplate', 'Takes slightly longer'],
    },
    {
      id: uuid(),
      title: 'Rapid Prototype',
      description: 'Single-file implementation for quick iteration.',
      pros: ['Fast to build', 'Easy to understand', 'Minimal setup'],
      cons: ['Harder to scale', 'Less organized'],
    },
    {
      id: uuid(),
      title: 'Framework-Heavy',
      description: 'Use a full framework like NestJS for enterprise patterns.',
      pros: ['Built-in patterns', 'Dependency injection', 'Documentation'],
      cons: ['Heavier bundle', 'Steeper learning curve'],
    },
  ];
}

// ── Main mock execution ─────────────────────────────────────────────────────

export type MockCallback = (update: Partial<AgentTask>) => void;

export async function runMockAgent(
  prompt: string,
  onUpdate: MockCallback,
): Promise<void> {
  // Phase 1: Alignment
  onUpdate({ status: 'aligning' });
  await delay(1500);

  const alignment = generateAlignment(prompt);
  const alignMsg: ChatMessage = {
    id: uuid(),
    role: 'agent',
    content: "I've analyzed your request. Let me confirm my understanding before proceeding.",
    timestamp: Date.now(),
    alignmentCard: alignment,
  };
  onUpdate({
    alignment,
    pillarScores: { alignment: 0.85, steerability: 0.5, verification: 0, adaptability: 0.3 },
  });
  await delay(500);
  onUpdate({ messages: [alignMsg] });

  // Phase 2: Approach selection
  await delay(1000);
  const approaches = generateApproaches();
  const approachMsg: ChatMessage = {
    id: uuid(),
    role: 'agent',
    content: 'Here are the approaches I can take. Which do you prefer?',
    timestamp: Date.now(),
    approaches,
  };
  onUpdate({
    steerability: {
      isPaused: false,
      approaches,
      selectedApproachId: approaches[0].id,
      speedLevel: 3,
      detailLevel: 3,
    },
    pillarScores: { alignment: 0.85, steerability: 0.7, verification: 0, adaptability: 0.3 },
  });
  await delay(300);
  onUpdate({ messages: [approachMsg] });

  // Phase 3: Coding
  await delay(2000);
  onUpdate({ status: 'coding' });

  const terminalLines: TerminalLine[] = [];
  const files: FileNode[] = [];

  const addTerminal = async (text: string, type: TerminalLine['type'] = 'output') => {
    terminalLines.push({ id: uuid(), text, type, timestamp: Date.now() });
    onUpdate({ terminal: [...terminalLines] });
    await delay(300 + Math.random() * 400);
  };

  await addTerminal('$ mkdir -p src/routes src/controllers src/services src/utils', 'command');
  await addTerminal('Creating project structure...', 'info');

  // Generate files one by one with typing effect
  const fileEntries = Object.entries(MOCK_FILES);
  for (const [filePath, { content, language }] of fileEntries) {
    await addTerminal(`$ cat > ${filePath}`, 'command');

    const fileNode: FileNode = {
      name: filePath.split('/').pop()!,
      path: filePath,
      type: 'file',
      content,
      language,
    };
    files.push(fileNode);
    onUpdate({ files: [...files] });

    // Simulate typing the content character by character (abbreviated)
    const lines = content.split('\n');
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      await addTerminal(`  ${lines[i]}`, 'output');
    }
    if (lines.length > 5) {
      await addTerminal(`  ... (${lines.length - 5} more lines)`, 'output');
    }

    // Update pillar scores progressively
    const progress = (fileEntries.indexOf([filePath, { content, language }]) + 1) / fileEntries.length;
    onUpdate({
      pillarScores: {
        alignment: 0.9,
        steerability: 0.75,
        verification: 0.2 + progress * 0.5,
        adaptability: 0.35,
      },
    });
  }

  // Phase 4: Verification
  onUpdate({ status: 'verifying' });
  await addTerminal('$ npm install', 'command');
  await addTerminal('added 127 packages in 3.2s', 'output');
  await addTerminal('$ tsc --noEmit', 'command');
  await delay(1000);
  await addTerminal('No errors found.', 'info');

  const verifications: VerificationResult[] = [
    { type: 'diff', title: 'Files Created', content: `${files.length} files generated`, passed: true, timestamp: Date.now() },
    { type: 'test', title: 'TypeScript Check', content: 'tsc --noEmit passed with 0 errors', passed: true, timestamp: Date.now() },
    { type: 'readme', title: 'README.md', content: 'Auto-generated documentation', passed: true, timestamp: Date.now() },
  ];
  onUpdate({
    verifications,
    pillarScores: { alignment: 0.92, steerability: 0.8, verification: 0.88, adaptability: 0.4 },
  });

  // Phase 5: Complete
  await delay(500);
  const completeMsg: ChatMessage = {
    id: uuid(),
    role: 'agent',
    content: `Done! I've created a fully functional project with ${files.length} files. The TypeScript compilation passes cleanly and a README.md has been generated.`,
    timestamp: Date.now(),
  };
  onUpdate({
    status: 'complete',
    messages: [completeMsg],
    pillarScores: { alignment: 0.92, steerability: 0.8, verification: 0.9, adaptability: 0.45 },
  });
}
