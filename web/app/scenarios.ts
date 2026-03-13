import { FileNode, DiffChange, ScenarioConfig, TaskUnderstanding, Approach } from "./store";

export const SCENARIOS: ScenarioConfig[] = [
  {
    id: "rest-api",
    title: "Build a REST API",
    description: "Create a Node.js REST API with Express, CRUD endpoints, validation, and error handling",
    icon: "🔌",
    prompt: "Build a REST API with Express for a todo app with full CRUD operations",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "auth",
    title: "Add Authentication",
    description: "Implement JWT-based auth with login, register, protected routes, and refresh tokens",
    icon: "🔐",
    prompt: "Add JWT authentication to my Express app with login, register, and protected routes",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "bugfix",
    title: "Fix Payment Bug",
    description: "Debug and fix a race condition in payment processing causing double charges",
    icon: "🐛",
    prompt: "Fix the bug in payment processing that causes double charges when users click submit twice",
    color: "from-red-500 to-orange-500",
  },
  {
    id: "refactor",
    title: "Refactor Database Layer",
    description: "Refactor raw SQL queries to use an ORM with proper migrations and connection pooling",
    icon: "🗄️",
    prompt: "Refactor the database layer to use Prisma ORM with proper migrations and connection pooling",
    color: "from-emerald-500 to-teal-500",
  },
];

interface ScenarioData {
  files: FileNode[];
  diffs: DiffChange[];
  understanding: TaskUnderstanding;
  approaches: Approach[];
  terminalLines: string[];
  activityScript: ActivityStep[];
  pillarScores: {
    alignment: number;
    steerability: number;
    verification: number;
    adaptability: number;
  };
  testResults: { passed: number; failed: number; total: number; coverage: number };
}

export interface ActivityStep {
  delay: number;
  category: "search" | "write" | "test" | "fix" | "think" | "verify" | "info";
  message: string;
  detail?: string;
  progress?: number;
  touchFile?: string;
}

const REST_API_DATA: ScenarioData = {
  files: [
    {
      name: "src", path: "src", type: "folder", children: [
        { name: "index.ts", path: "src/index.ts", type: "file", content: `import express from 'express';\nimport cors from 'cors';\nimport { todoRouter } from './routes/todos';\nimport { errorHandler } from './middleware/errorHandler';\n\nconst app = express();\napp.use(cors());\napp.use(express.json());\napp.use('/api/todos', todoRouter);\napp.use(errorHandler);\n\napp.listen(3000, () => console.log('Server running on :3000'));` },
        { name: "routes", path: "src/routes", type: "folder", children: [
          { name: "todos.ts", path: "src/routes/todos.ts", type: "file", content: `import { Router } from 'express';\nimport { TodoController } from '../controllers/todoController';\nimport { validate } from '../middleware/validate';\nimport { todoSchema } from '../schemas/todoSchema';\n\nexport const todoRouter = Router();\nconst ctrl = new TodoController();\n\ntodoRouter.get('/', ctrl.getAll);\ntodoRouter.get('/:id', ctrl.getById);\ntodoRouter.post('/', validate(todoSchema), ctrl.create);\ntodoRouter.put('/:id', validate(todoSchema), ctrl.update);\ntodoRouter.delete('/:id', ctrl.delete);` },
        ]},
        { name: "controllers", path: "src/controllers", type: "folder", children: [
          { name: "todoController.ts", path: "src/controllers/todoController.ts", type: "file", content: `import { Request, Response, NextFunction } from 'express';\nimport { TodoService } from '../services/todoService';\n\nexport class TodoController {\n  private service = new TodoService();\n\n  getAll = async (req: Request, res: Response, next: NextFunction) => {\n    try {\n      const todos = await this.service.findAll();\n      res.json(todos);\n    } catch (err) { next(err); }\n  };\n\n  getById = async (req: Request, res: Response, next: NextFunction) => {\n    try {\n      const todo = await this.service.findById(req.params.id);\n      if (!todo) return res.status(404).json({ error: 'Not found' });\n      res.json(todo);\n    } catch (err) { next(err); }\n  };\n\n  create = async (req: Request, res: Response, next: NextFunction) => {\n    try {\n      const todo = await this.service.create(req.body);\n      res.status(201).json(todo);\n    } catch (err) { next(err); }\n  };\n\n  update = async (req: Request, res: Response, next: NextFunction) => {\n    try {\n      const todo = await this.service.update(req.params.id, req.body);\n      res.json(todo);\n    } catch (err) { next(err); }\n  };\n\n  delete = async (req: Request, res: Response, next: NextFunction) => {\n    try {\n      await this.service.delete(req.params.id);\n      res.status(204).send();\n    } catch (err) { next(err); }\n  };\n}` },
        ]},
        { name: "services", path: "src/services", type: "folder", children: [
          { name: "todoService.ts", path: "src/services/todoService.ts", type: "file", content: `interface Todo {\n  id: string;\n  title: string;\n  completed: boolean;\n  createdAt: Date;\n}\n\nexport class TodoService {\n  private todos: Todo[] = [];\n\n  async findAll(): Promise<Todo[]> { return this.todos; }\n  async findById(id: string): Promise<Todo | undefined> { return this.todos.find(t => t.id === id); }\n  async create(data: { title: string }): Promise<Todo> {\n    const todo: Todo = { id: crypto.randomUUID(), title: data.title, completed: false, createdAt: new Date() };\n    this.todos.push(todo);\n    return todo;\n  }\n  async update(id: string, data: Partial<Todo>): Promise<Todo> {\n    const idx = this.todos.findIndex(t => t.id === id);\n    if (idx === -1) throw new Error('Not found');\n    this.todos[idx] = { ...this.todos[idx], ...data };\n    return this.todos[idx];\n  }\n  async delete(id: string): Promise<void> { this.todos = this.todos.filter(t => t.id !== id); }\n}` },
        ]},
        { name: "middleware", path: "src/middleware", type: "folder", children: [
          { name: "errorHandler.ts", path: "src/middleware/errorHandler.ts", type: "file", content: `import { Request, Response, NextFunction } from 'express';\n\nexport function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {\n  console.error(err.stack);\n  res.status(500).json({ error: 'Internal Server Error', message: err.message });\n}` },
          { name: "validate.ts", path: "src/middleware/validate.ts", type: "file", content: `import { Request, Response, NextFunction } from 'express';\nimport { ZodSchema } from 'zod';\n\nexport function validate(schema: ZodSchema) {\n  return (req: Request, res: Response, next: NextFunction) => {\n    const result = schema.safeParse(req.body);\n    if (!result.success) return res.status(400).json({ errors: result.error.flatten() });\n    next();\n  };\n}` },
        ]},
        { name: "schemas", path: "src/schemas", type: "folder", children: [
          { name: "todoSchema.ts", path: "src/schemas/todoSchema.ts", type: "file", content: `import { z } from 'zod';\n\nexport const todoSchema = z.object({\n  title: z.string().min(1).max(200),\n  completed: z.boolean().optional(),\n});` },
        ]},
      ],
    },
    { name: "package.json", path: "package.json", type: "file", content: `{\n  "name": "todo-api",\n  "scripts": { "dev": "tsx watch src/index.ts", "test": "vitest" },\n  "dependencies": { "express": "^4.18", "cors": "^2.8", "zod": "^3.22" }\n}` },
  ],
  diffs: [
    { file: "src/index.ts", additions: 12, deletions: 0, content: "+ import express from 'express';\n+ import { todoRouter } from './routes/todos';\n+ app.use('/api/todos', todoRouter);" },
    { file: "src/routes/todos.ts", additions: 14, deletions: 0, content: "+ todoRouter.get('/', ctrl.getAll);\n+ todoRouter.post('/', validate(todoSchema), ctrl.create);\n+ todoRouter.put('/:id', ctrl.update);\n+ todoRouter.delete('/:id', ctrl.delete);" },
    { file: "src/controllers/todoController.ts", additions: 38, deletions: 0, content: "+ export class TodoController {\n+   getAll = async (req, res, next) => { ... };\n+   create = async (req, res, next) => { ... };\n+ }" },
    { file: "src/services/todoService.ts", additions: 28, deletions: 0, content: "+ export class TodoService {\n+   async findAll() { ... }\n+   async create(data) { ... }\n+ }" },
    { file: "src/middleware/validate.ts", additions: 12, deletions: 0, content: "+ export function validate(schema: ZodSchema) { ... }" },
  ],
  understanding: {
    requirements: [
      "REST API with Express for a todo application",
      "Full CRUD operations (Create, Read, Update, Delete)",
      "Input validation using Zod schemas",
      "Proper error handling middleware",
    ],
    assumptions: [
      "In-memory storage (no database for now)",
      "TypeScript with strict types",
      "Standard REST conventions (GET/POST/PUT/DELETE)",
    ],
    questions: ["Should we add pagination to the list endpoint?"],
  },
  approaches: [
    { id: "a1", title: "Controller-Service Pattern", description: "Separate controllers (HTTP) from services (business logic). Clean, testable layers.", pros: ["Highly testable", "Clean separation", "Easy to swap DB"], cons: ["More boilerplate", "More files"] },
    { id: "a2", title: "Route Handler Pattern", description: "Inline handlers in route files. Simpler, fewer files.", pros: ["Fewer files", "Quick to build", "Easy to read"], cons: ["Harder to test", "Mixes concerns"] },
    { id: "a3", title: "Functional Middleware Chain", description: "Pure functions composed as middleware. Highly composable.", pros: ["Very composable", "Immutable-friendly"], cons: ["Unusual pattern", "Learning curve"] },
  ],
  terminalLines: [
    "$ opencode analyze task...",
    "✓ Identified REST API pattern with CRUD",
    "$ mkdir -p src/{routes,controllers,services,middleware,schemas}",
    "$ touch src/index.ts",
    "  Writing Express server setup... (12 lines)",
    "$ touch src/routes/todos.ts",
    "  Writing route definitions... (14 lines)",
    "$ touch src/controllers/todoController.ts",
    "  Writing controller methods... (38 lines)",
    "$ touch src/services/todoService.ts",
    "  Writing service layer... (28 lines)",
    "$ touch src/middleware/errorHandler.ts",
    "  Writing error handler... (8 lines)",
    "$ touch src/middleware/validate.ts",
    "  Writing validation middleware... (12 lines)",
    "$ touch src/schemas/todoSchema.ts",
    "  Writing Zod schema... (5 lines)",
    "$ npm run typecheck",
    "  ✓ No type errors found",
    "$ npm run test",
    "  PASS src/routes/todos.test.ts (6 tests)",
    "  PASS src/services/todoService.test.ts (5 tests)",
    "  PASS src/middleware/validate.test.ts (3 tests)",
    "  Tests: 14 passed, 0 failed",
    "  Coverage: 91%",
    "✓ All files created successfully",
  ],
  activityScript: [
    { delay: 0, category: "think", message: "Analyzing REST API requirements...", progress: 5 },
    { delay: 400, category: "search", message: "🔍 Scanning for existing Express setup...", progress: 10 },
    { delay: 600, category: "think", message: "🧠 Breaking down into 4 CRUD operations + validation", detail: "GET /api/todos\nPOST /api/todos\nPUT /api/todos/:id\nDELETE /api/todos/:id", progress: 18 },
    { delay: 800, category: "info", message: "📊 Alignment: 88% — REST patterns identified", progress: 22 },
    { delay: 500, category: "think", message: "💡 Evaluating architectural approaches...", progress: 28 },
    { delay: 600, category: "info", message: "🎮 Controller-Service Pattern selected", progress: 32 },
    { delay: 500, category: "write", message: "📝 Writing src/index.ts — Express server entry", touchFile: "src/index.ts", progress: 38 },
    { delay: 400, category: "write", message: "📝 Writing src/routes/todos.ts — REST routes", touchFile: "src/routes/todos.ts", progress: 45 },
    { delay: 500, category: "write", message: "📝 Writing todoController.ts — HTTP handlers", touchFile: "src/controllers/todoController.ts", progress: 52 },
    { delay: 500, category: "write", message: "📝 Writing todoService.ts — business logic", touchFile: "src/services/todoService.ts", progress: 60 },
    { delay: 400, category: "write", message: "📝 Writing errorHandler.ts — error middleware", touchFile: "src/middleware/errorHandler.ts", progress: 66 },
    { delay: 300, category: "write", message: "📝 Writing validate.ts — Zod validation", touchFile: "src/middleware/validate.ts", progress: 72 },
    { delay: 300, category: "write", message: "📝 Writing todoSchema.ts — input schema", touchFile: "src/schemas/todoSchema.ts", progress: 76 },
    { delay: 500, category: "test", message: "🧪 Running TypeScript compiler... no errors", progress: 80 },
    { delay: 400, category: "test", message: "✅ todos.test.ts — 6 tests passing", progress: 85 },
    { delay: 300, category: "test", message: "✅ todoService.test.ts — 5 tests passing", progress: 89 },
    { delay: 300, category: "test", message: "✅ validate.test.ts — 3 tests passing", progress: 92 },
    { delay: 200, category: "verify", message: "✅ 14/14 tests pass — 91% coverage", progress: 96 },
    { delay: 200, category: "verify", message: "🎉 REST API complete — 7 files, all tests pass", progress: 100 },
  ],
  pillarScores: { alignment: 0.92, steerability: 0.88, verification: 0.95, adaptability: 0.45 },
  testResults: { passed: 14, failed: 0, total: 14, coverage: 91 },
};

const AUTH_DATA: ScenarioData = {
  files: [
    {
      name: "src", path: "src", type: "folder", children: [
        { name: "auth", path: "src/auth", type: "folder", children: [
          { name: "authController.ts", path: "src/auth/authController.ts", type: "file", content: `import { Request, Response } from 'express';\nimport { AuthService } from './authService';\nimport { loginSchema, registerSchema } from './authSchemas';\n\nconst authService = new AuthService();\n\nexport async function register(req: Request, res: Response) {\n  const { email, password, name } = registerSchema.parse(req.body);\n  const user = await authService.register(email, password, name);\n  const tokens = authService.generateTokens(user.id);\n  res.status(201).json({ user, ...tokens });\n}\n\nexport async function login(req: Request, res: Response) {\n  const { email, password } = loginSchema.parse(req.body);\n  const user = await authService.login(email, password);\n  const tokens = authService.generateTokens(user.id);\n  res.json({ user, ...tokens });\n}\n\nexport async function refresh(req: Request, res: Response) {\n  const { refreshToken } = req.body;\n  const tokens = await authService.refreshTokens(refreshToken);\n  res.json(tokens);\n}` },
          { name: "authService.ts", path: "src/auth/authService.ts", type: "file", content: `import jwt from 'jsonwebtoken';\nimport bcrypt from 'bcrypt';\n\ninterface User { id: string; email: string; name: string; passwordHash: string; }\n\nexport class AuthService {\n  private users: User[] = [];\n  private SECRET = process.env.JWT_SECRET || 'dev-secret';\n  private REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh';\n\n  async register(email: string, password: string, name: string) {\n    if (this.users.find(u => u.email === email)) throw new Error('Email exists');\n    const passwordHash = await bcrypt.hash(password, 12);\n    const user: User = { id: crypto.randomUUID(), email, name, passwordHash };\n    this.users.push(user);\n    return { id: user.id, email, name };\n  }\n\n  async login(email: string, password: string) {\n    const user = this.users.find(u => u.email === email);\n    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new Error('Invalid credentials');\n    return { id: user.id, email: user.email, name: user.name };\n  }\n\n  generateTokens(userId: string) {\n    return {\n      accessToken: jwt.sign({ sub: userId }, this.SECRET, { expiresIn: '15m' }),\n      refreshToken: jwt.sign({ sub: userId }, this.REFRESH_SECRET, { expiresIn: '7d' }),\n    };\n  }\n\n  async refreshTokens(token: string) {\n    const payload = jwt.verify(token, this.REFRESH_SECRET) as { sub: string };\n    return this.generateTokens(payload.sub);\n  }\n}` },
          { name: "authSchemas.ts", path: "src/auth/authSchemas.ts", type: "file", content: `import { z } from 'zod';\n\nexport const registerSchema = z.object({\n  email: z.string().email(),\n  password: z.string().min(8).max(128),\n  name: z.string().min(1).max(100),\n});\n\nexport const loginSchema = z.object({\n  email: z.string().email(),\n  password: z.string(),\n});` },
          { name: "authMiddleware.ts", path: "src/auth/authMiddleware.ts", type: "file", content: `import { Request, Response, NextFunction } from 'express';\nimport jwt from 'jsonwebtoken';\n\nconst SECRET = process.env.JWT_SECRET || 'dev-secret';\n\nexport function requireAuth(req: Request, res: Response, next: NextFunction) {\n  const header = req.headers.authorization;\n  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });\n  try {\n    const payload = jwt.verify(header.slice(7), SECRET);\n    (req as Request & { userId: string }).userId = (payload as { sub: string }).sub;\n    next();\n  } catch {\n    res.status(401).json({ error: 'Invalid token' });\n  }\n}` },
        ]},
        { name: "routes", path: "src/routes", type: "folder", children: [
          { name: "authRoutes.ts", path: "src/routes/authRoutes.ts", type: "file", content: `import { Router } from 'express';\nimport { register, login, refresh } from '../auth/authController';\n\nexport const authRouter = Router();\nauthRouter.post('/register', register);\nauthRouter.post('/login', login);\nauthRouter.post('/refresh', refresh);` },
        ]},
      ],
    },
    { name: "package.json", path: "package.json", type: "file", content: `{\n  "name": "auth-app",\n  "dependencies": { "express": "^4.18", "jsonwebtoken": "^9.0", "bcrypt": "^5.1", "zod": "^3.22" }\n}` },
  ],
  diffs: [
    { file: "src/auth/authController.ts", additions: 30, deletions: 0, content: "+ export async function register(req, res) { ... }\n+ export async function login(req, res) { ... }\n+ export async function refresh(req, res) { ... }" },
    { file: "src/auth/authService.ts", additions: 35, deletions: 0, content: "+ export class AuthService {\n+   async register(email, password, name) { ... }\n+   async login(email, password) { ... }\n+   generateTokens(userId) { ... }\n+ }" },
    { file: "src/auth/authMiddleware.ts", additions: 16, deletions: 0, content: "+ export function requireAuth(req, res, next) {\n+   const header = req.headers.authorization;\n+   jwt.verify(header.slice(7), SECRET);\n+ }" },
    { file: "src/auth/authSchemas.ts", additions: 12, deletions: 0, content: "+ export const registerSchema = z.object({ email: z.string().email(), ... });" },
  ],
  understanding: {
    requirements: [
      "JWT-based authentication (access + refresh tokens)",
      "User registration with email/password",
      "Login with credential validation",
      "Protected route middleware",
    ],
    assumptions: [
      "bcrypt for password hashing (12 rounds)",
      "Access tokens expire in 15 minutes",
      "Refresh tokens expire in 7 days",
    ],
    questions: ["Should we add rate limiting to auth endpoints?"],
  },
  approaches: [
    { id: "a1", title: "JWT with Refresh Tokens", description: "Short-lived access tokens + long-lived refresh tokens. Industry standard.", pros: ["Secure", "Stateless", "Scalable"], cons: ["Token revocation complexity", "More endpoints"] },
    { id: "a2", title: "Session-Based Auth", description: "Server-side sessions stored in Redis. Traditional approach.", pros: ["Easy revocation", "Simple"], cons: ["Requires session store", "Less scalable"] },
    { id: "a3", title: "OAuth 2.0 Integration", description: "Delegate auth to Google/GitHub providers.", pros: ["No password storage", "Trusted providers"], cons: ["External dependency", "Complex setup"] },
  ],
  terminalLines: [
    "$ opencode analyze auth requirements...",
    "✓ JWT authentication pattern identified",
    "$ mkdir -p src/auth src/routes",
    "$ touch src/auth/authController.ts",
    "  Writing auth controller... (30 lines)",
    "$ touch src/auth/authService.ts",
    "  Writing auth service with bcrypt... (35 lines)",
    "$ touch src/auth/authMiddleware.ts",
    "  Writing JWT middleware... (16 lines)",
    "$ touch src/auth/authSchemas.ts",
    "  Writing Zod validation schemas... (12 lines)",
    "$ touch src/routes/authRoutes.ts",
    "  Writing auth routes... (8 lines)",
    "$ npm run typecheck",
    "  ✓ No type errors found",
    "$ npm run test",
    "  PASS src/auth/authService.test.ts (8 tests)",
    "  PASS src/auth/authMiddleware.test.ts (4 tests)",
    "  PASS src/auth/authSchemas.test.ts (6 tests)",
    "  Tests: 18 passed, 0 failed",
    "  Coverage: 94%",
    "✓ Authentication system complete",
  ],
  activityScript: [
    { delay: 0, category: "think", message: "Analyzing authentication requirements...", progress: 5 },
    { delay: 400, category: "search", message: "🔍 Checking existing auth setup... none found", progress: 10 },
    { delay: 600, category: "think", message: "🧠 Planning JWT auth flow: register → login → protect", detail: "POST /auth/register\nPOST /auth/login\nPOST /auth/refresh\nMiddleware: requireAuth", progress: 18 },
    { delay: 500, category: "info", message: "📊 Alignment: 90% — auth patterns locked", progress: 24 },
    { delay: 600, category: "think", message: "💡 Evaluating auth strategies...", progress: 30 },
    { delay: 500, category: "info", message: "🎮 JWT with Refresh Tokens selected", progress: 35 },
    { delay: 500, category: "write", message: "📝 Writing authController.ts — register/login/refresh", touchFile: "src/auth/authController.ts", progress: 42 },
    { delay: 600, category: "write", message: "📝 Writing authService.ts — bcrypt + JWT logic", touchFile: "src/auth/authService.ts", progress: 52 },
    { delay: 400, category: "write", message: "📝 Writing authMiddleware.ts — token verification", touchFile: "src/auth/authMiddleware.ts", progress: 60 },
    { delay: 300, category: "write", message: "📝 Writing authSchemas.ts — Zod validation", touchFile: "src/auth/authSchemas.ts", progress: 66 },
    { delay: 300, category: "write", message: "📝 Writing authRoutes.ts — route definitions", touchFile: "src/routes/authRoutes.ts", progress: 72 },
    { delay: 500, category: "test", message: "🧪 Running typecheck... clean", progress: 78 },
    { delay: 400, category: "test", message: "✅ authService.test.ts — 8 tests passing", progress: 84 },
    { delay: 300, category: "test", message: "✅ authMiddleware.test.ts — 4 tests passing", progress: 89 },
    { delay: 300, category: "test", message: "✅ authSchemas.test.ts — 6 tests passing", progress: 93 },
    { delay: 200, category: "verify", message: "✅ 18/18 tests pass — 94% coverage", progress: 97 },
    { delay: 200, category: "verify", message: "🎉 Auth system complete — 5 files, all tests pass", progress: 100 },
  ],
  pillarScores: { alignment: 0.90, steerability: 0.85, verification: 0.94, adaptability: 0.52 },
  testResults: { passed: 18, failed: 0, total: 18, coverage: 94 },
};

const BUGFIX_DATA: ScenarioData = {
  files: [
    {
      name: "src", path: "src", type: "folder", children: [
        { name: "payments", path: "src/payments", type: "folder", children: [
          { name: "paymentProcessor.ts", path: "src/payments/paymentProcessor.ts", type: "file", content: `import { IdempotencyStore } from './idempotencyStore';\nimport { PaymentGateway } from './paymentGateway';\n\nexport class PaymentProcessor {\n  private idempotency = new IdempotencyStore();\n  private gateway = new PaymentGateway();\n\n  async processPayment(orderId: string, amount: number, currency: string) {\n    // FIX: Check idempotency key BEFORE processing\n    const existing = await this.idempotency.get(orderId);\n    if (existing) return existing;\n\n    // FIX: Acquire lock to prevent concurrent processing\n    const lock = await this.idempotency.acquireLock(orderId);\n    if (!lock) throw new Error('Payment already being processed');\n\n    try {\n      const result = await this.gateway.charge(amount, currency);\n      await this.idempotency.set(orderId, result);\n      return result;\n    } finally {\n      await this.idempotency.releaseLock(orderId);\n    }\n  }\n}` },
          { name: "idempotencyStore.ts", path: "src/payments/idempotencyStore.ts", type: "file", content: `interface PaymentResult {\n  transactionId: string;\n  status: 'success' | 'failed';\n  amount: number;\n}\n\nexport class IdempotencyStore {\n  private store = new Map<string, PaymentResult>();\n  private locks = new Set<string>();\n\n  async get(key: string): Promise<PaymentResult | undefined> {\n    return this.store.get(key);\n  }\n\n  async set(key: string, value: PaymentResult): Promise<void> {\n    this.store.set(key, value);\n  }\n\n  async acquireLock(key: string): Promise<boolean> {\n    if (this.locks.has(key)) return false;\n    this.locks.add(key);\n    return true;\n  }\n\n  async releaseLock(key: string): Promise<void> {\n    this.locks.delete(key);\n  }\n}` },
          { name: "paymentGateway.ts", path: "src/payments/paymentGateway.ts", type: "file", content: `export class PaymentGateway {\n  async charge(amount: number, currency: string) {\n    // Simulated gateway call\n    return {\n      transactionId: crypto.randomUUID(),\n      status: 'success' as const,\n      amount,\n      currency,\n      processedAt: new Date(),\n    };\n  }\n}` },
        ]},
      ],
    },
  ],
  diffs: [
    { file: "src/payments/paymentProcessor.ts", additions: 12, deletions: 8, content: "+ // FIX: Check idempotency key BEFORE processing\n+ const existing = await this.idempotency.get(orderId);\n+ if (existing) return existing;\n+ const lock = await this.idempotency.acquireLock(orderId);\n- // Old: no idempotency check\n- const result = await this.gateway.charge(amount, currency);" },
    { file: "src/payments/idempotencyStore.ts", additions: 24, deletions: 0, content: "+ export class IdempotencyStore {\n+   async acquireLock(key) { ... }\n+   async releaseLock(key) { ... }\n+ }" },
  ],
  understanding: {
    requirements: [
      "Fix double-charge bug when users click submit twice",
      "Add idempotency to payment processing",
      "Implement distributed locking mechanism",
    ],
    assumptions: [
      "Race condition between concurrent requests",
      "Need idempotency key per order ID",
      "In-memory lock (production would use Redis)",
    ],
    questions: ["Is there a specific payment gateway SDK we should integrate with?"],
  },
  approaches: [
    { id: "a1", title: "Idempotency Key + Lock", description: "Add idempotency checking and mutex lock before payment processing.", pros: ["Prevents duplicates", "Simple to implement", "Database-friendly"], cons: ["Needs cleanup logic", "Lock timeout needed"] },
    { id: "a2", title: "Database Transaction with UNIQUE", description: "Use a unique constraint on order_id in payments table.", pros: ["DB-enforced", "No extra code"], cons: ["DB-specific", "Error handling complex"] },
    { id: "a3", title: "Frontend Debounce Only", description: "Disable button after click, add loading state.", pros: ["Simplest", "No backend changes"], cons: ["Not reliable", "Race still possible"] },
  ],
  terminalLines: [
    "$ opencode analyze bug report...",
    "✓ Race condition identified in paymentProcessor.ts",
    "✓ Root cause: no idempotency check before charge()",
    "$ git diff HEAD~1 -- src/payments/",
    "  Analyzing recent changes to payment code...",
    "$ Fixing paymentProcessor.ts...",
    "  Adding idempotency check... (12 lines changed)",
    "$ Creating idempotencyStore.ts...",
    "  Writing lock mechanism... (24 lines)",
    "$ npm run typecheck",
    "  ✓ No type errors found",
    "$ npm run test",
    "  PASS src/payments/paymentProcessor.test.ts",
    "  PASS src/payments/idempotencyStore.test.ts",
    "  ● Test: concurrent payments only charge once ✓",
    "  ● Test: idempotent replay returns same result ✓",
    "  Tests: 8 passed, 0 failed",
    "  Coverage: 96%",
    "✓ Bug fix verified — double charge prevented",
  ],
  activityScript: [
    { delay: 0, category: "think", message: "Analyzing the double-charge bug report...", progress: 5 },
    { delay: 500, category: "search", message: "🔍 Reading paymentProcessor.ts... found issue", progress: 12 },
    { delay: 600, category: "think", message: "🧠 Root cause: no idempotency check", detail: "processPayment() calls gateway.charge() without checking if payment was already processed.\nConcurrent requests with same orderId both reach charge().", progress: 22 },
    { delay: 400, category: "info", message: "🐛 Bug identified: missing idempotency guard", progress: 28 },
    { delay: 500, category: "think", message: "💡 Evaluating fix strategies...", progress: 34 },
    { delay: 400, category: "info", message: "🎮 Idempotency Key + Lock approach selected", progress: 38 },
    { delay: 500, category: "fix", message: "🔧 Fixing paymentProcessor.ts — adding idempotency", touchFile: "src/payments/paymentProcessor.ts", progress: 48 },
    { delay: 500, category: "write", message: "📝 Creating idempotencyStore.ts — lock mechanism", touchFile: "src/payments/idempotencyStore.ts", progress: 58 },
    { delay: 300, category: "write", message: "📝 Updating paymentGateway.ts — no changes needed", touchFile: "src/payments/paymentGateway.ts", progress: 64 },
    { delay: 500, category: "test", message: "🧪 Running typecheck... clean", progress: 72 },
    { delay: 400, category: "test", message: "✅ concurrent payment test — charges once ✓", progress: 80 },
    { delay: 300, category: "test", message: "✅ idempotent replay test — same result ✓", progress: 86 },
    { delay: 300, category: "verify", message: "✅ 8/8 tests pass — 96% coverage", progress: 92 },
    { delay: 200, category: "verify", message: "🎉 Bug fixed — double charges prevented", progress: 100 },
  ],
  pillarScores: { alignment: 0.95, steerability: 0.90, verification: 0.96, adaptability: 0.60 },
  testResults: { passed: 8, failed: 0, total: 8, coverage: 96 },
};

const REFACTOR_DATA: ScenarioData = {
  files: [
    {
      name: "prisma", path: "prisma", type: "folder", children: [
        { name: "schema.prisma", path: "prisma/schema.prisma", type: "file", content: `datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\nmodel User {\n  id        String   @id @default(cuid())\n  email     String   @unique\n  name      String\n  posts     Post[]\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Post {\n  id        String   @id @default(cuid())\n  title     String\n  content   String?\n  published Boolean  @default(false)\n  author    User     @relation(fields: [authorId], references: [id])\n  authorId  String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}` },
      ],
    },
    {
      name: "src", path: "src", type: "folder", children: [
        { name: "db", path: "src/db", type: "folder", children: [
          { name: "client.ts", path: "src/db/client.ts", type: "file", content: `import { PrismaClient } from '@prisma/client';\n\nconst globalForPrisma = global as unknown as { prisma: PrismaClient };\n\nexport const prisma = globalForPrisma.prisma || new PrismaClient({\n  log: ['query', 'info', 'warn', 'error'],\n});\n\nif (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;` },
          { name: "userRepository.ts", path: "src/db/userRepository.ts", type: "file", content: `import { prisma } from './client';\n\nexport class UserRepository {\n  async findAll() { return prisma.user.findMany({ include: { posts: true } }); }\n  async findById(id: string) { return prisma.user.findUnique({ where: { id }, include: { posts: true } }); }\n  async findByEmail(email: string) { return prisma.user.findUnique({ where: { email } }); }\n  async create(data: { email: string; name: string }) { return prisma.user.create({ data }); }\n  async update(id: string, data: { email?: string; name?: string }) { return prisma.user.update({ where: { id }, data }); }\n  async delete(id: string) { return prisma.user.delete({ where: { id } }); }\n}` },
          { name: "postRepository.ts", path: "src/db/postRepository.ts", type: "file", content: `import { prisma } from './client';\n\nexport class PostRepository {\n  async findAll() { return prisma.post.findMany({ include: { author: true } }); }\n  async findById(id: string) { return prisma.post.findUnique({ where: { id }, include: { author: true } }); }\n  async create(data: { title: string; content?: string; authorId: string }) { return prisma.post.create({ data }); }\n  async update(id: string, data: { title?: string; content?: string; published?: boolean }) { return prisma.post.update({ where: { id }, data }); }\n  async delete(id: string) { return prisma.post.delete({ where: { id } }); }\n}` },
        ]},
      ],
    },
  ],
  diffs: [
    { file: "prisma/schema.prisma", additions: 24, deletions: 0, content: "+ model User {\n+   id    String @id @default(cuid())\n+   email String @unique\n+   posts Post[]\n+ }\n+ model Post { ... }" },
    { file: "src/db/client.ts", additions: 10, deletions: 22, content: "+ import { PrismaClient } from '@prisma/client';\n+ export const prisma = globalForPrisma.prisma || new PrismaClient();\n- const pool = mysql.createPool(...);\n- export function query(sql, params) { ... }" },
    { file: "src/db/userRepository.ts", additions: 12, deletions: 18, content: "+ async findAll() { return prisma.user.findMany({ include: { posts: true } }); }\n- async findAll() { return query('SELECT * FROM users'); }" },
    { file: "src/db/postRepository.ts", additions: 12, deletions: 16, content: "+ async create(data) { return prisma.post.create({ data }); }\n- async create(data) { return query('INSERT INTO posts...'); }" },
  ],
  understanding: {
    requirements: [
      "Replace raw SQL queries with Prisma ORM",
      "Set up Prisma schema with User and Post models",
      "Implement repository pattern with type-safe queries",
      "Add connection pooling via Prisma's built-in pool",
    ],
    assumptions: [
      "PostgreSQL as the database",
      "Existing data can be migrated",
      "Repository pattern for data access",
    ],
    questions: ["Should we generate migration files for existing data?"],
  },
  approaches: [
    { id: "a1", title: "Prisma ORM + Repository", description: "Full Prisma setup with typed repositories wrapping Prisma client.", pros: ["Type-safe queries", "Auto migrations", "Great DX"], cons: ["Build step required", "Prisma-specific API"] },
    { id: "a2", title: "Drizzle ORM", description: "Lightweight SQL-first ORM with TypeScript inference.", pros: ["SQL-like syntax", "Lightweight", "No codegen"], cons: ["Newer ecosystem", "Less documentation"] },
    { id: "a3", title: "Knex Query Builder", description: "SQL query builder with migration support.", pros: ["Flexible SQL", "Good migration tool"], cons: ["No type inference", "Manual types"] },
  ],
  terminalLines: [
    "$ opencode analyze database layer...",
    "✓ Found 5 files with raw SQL queries",
    "✓ Identified 2 models: User, Post",
    "$ npx prisma init",
    "  Created prisma/schema.prisma",
    "  Created .env with DATABASE_URL",
    "$ Writing Prisma schema...",
    "  Defining User model... (10 lines)",
    "  Defining Post model... (12 lines)",
    "  Adding relations...",
    "$ npx prisma generate",
    "  ✓ Prisma Client generated",
    "$ Writing database client...",
    "  Connection pooling configured",
    "$ Writing userRepository.ts...",
    "  Replacing raw SQL with Prisma queries",
    "$ Writing postRepository.ts...",
    "  Replacing raw SQL with Prisma queries",
    "$ npm run typecheck",
    "  ✓ No type errors found",
    "$ npm run test",
    "  PASS src/db/userRepository.test.ts (6 tests)",
    "  PASS src/db/postRepository.test.ts (5 tests)",
    "  Tests: 11 passed, 0 failed",
    "  Coverage: 89%",
    "✓ Database refactor complete",
  ],
  activityScript: [
    { delay: 0, category: "think", message: "Analyzing database layer for refactoring...", progress: 5 },
    { delay: 500, category: "search", message: "🔍 Found 5 files with raw SQL queries", progress: 12 },
    { delay: 600, category: "think", message: "🧠 Mapping SQL to Prisma models", detail: "users table → User model\nposts table → Post model\nForeign key: posts.author_id → User.id", progress: 20 },
    { delay: 400, category: "info", message: "📊 Alignment: 88% — refactor scope clear", progress: 26 },
    { delay: 500, category: "think", message: "💡 Evaluating ORM options...", progress: 32 },
    { delay: 400, category: "info", message: "🎮 Prisma ORM + Repository pattern selected", progress: 36 },
    { delay: 500, category: "write", message: "📝 Writing prisma/schema.prisma — data models", touchFile: "prisma/schema.prisma", progress: 44 },
    { delay: 400, category: "write", message: "📝 Writing src/db/client.ts — Prisma client singleton", touchFile: "src/db/client.ts", progress: 52 },
    { delay: 500, category: "write", message: "📝 Writing userRepository.ts — type-safe User queries", touchFile: "src/db/userRepository.ts", progress: 62 },
    { delay: 500, category: "write", message: "📝 Writing postRepository.ts — type-safe Post queries", touchFile: "src/db/postRepository.ts", progress: 72 },
    { delay: 500, category: "test", message: "🧪 Running typecheck... clean", progress: 78 },
    { delay: 400, category: "test", message: "✅ userRepository.test.ts — 6 tests passing", progress: 84 },
    { delay: 300, category: "test", message: "✅ postRepository.test.ts — 5 tests passing", progress: 90 },
    { delay: 200, category: "verify", message: "✅ 11/11 tests pass — 89% coverage", progress: 95 },
    { delay: 200, category: "verify", message: "🎉 Refactor complete — raw SQL eliminated", progress: 100 },
  ],
  pillarScores: { alignment: 0.88, steerability: 0.82, verification: 0.89, adaptability: 0.55 },
  testResults: { passed: 11, failed: 0, total: 11, coverage: 89 },
};

// Default scenario (original dashboard demo)
const DEFAULT_DATA: ScenarioData = {
  files: [
    {
      name: "src", path: "src", type: "folder", children: [
        { name: "App.tsx", path: "src/App.tsx", type: "file", content: `import React from 'react';\nimport { Header } from './components/Header';\nimport { Dashboard } from './components/Dashboard';\nimport { useTheme } from './hooks/useTheme';\n\nexport default function App() {\n  const { theme, toggleTheme } = useTheme();\n  return (\n    <div className={\`app \${theme}\`}>\n      <Header onToggleTheme={toggleTheme} />\n      <main className="container mx-auto px-4 py-8">\n        <Dashboard />\n      </main>\n    </div>\n  );\n}` },
        { name: "components", path: "src/components", type: "folder", children: [
          { name: "Header.tsx", path: "src/components/Header.tsx", type: "file", content: `import React from 'react';\n\ninterface HeaderProps { onToggleTheme: () => void; }\n\nexport function Header({ onToggleTheme }: HeaderProps) {\n  return (\n    <header className="flex items-center justify-between p-4 border-b">\n      <h1 className="text-xl font-semibold">Dashboard</h1>\n      <button onClick={onToggleTheme}>Toggle Theme</button>\n    </header>\n  );\n}` },
          { name: "Dashboard.tsx", path: "src/components/Dashboard.tsx", type: "file", content: `import React from 'react';\nimport { StatCard } from './StatCard';\nimport { useStats } from '../hooks/useStats';\n\nexport function Dashboard() {\n  const stats = useStats();\n  return (\n    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">\n      {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}\n    </div>\n  );\n}` },
          { name: "StatCard.tsx", path: "src/components/StatCard.tsx", type: "file", content: `import React from 'react';\n\ninterface StatCardProps { label: string; value: string | number; trend: 'up' | 'down' | 'neutral'; }\n\nexport function StatCard({ label, value, trend }: StatCardProps) {\n  const color = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';\n  return (\n    <div className="rounded-xl border p-6">\n      <p className="text-sm text-gray-500">{label}</p>\n      <p className="text-3xl font-bold mt-1">{value}</p>\n      <p className={\`text-sm mt-2 \${color}\`}>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</p>\n    </div>\n  );\n}` },
        ]},
        { name: "hooks", path: "src/hooks", type: "folder", children: [
          { name: "useTheme.ts", path: "src/hooks/useTheme.ts", type: "file", content: `import { useState, useCallback } from 'react';\n\nexport function useTheme() {\n  const [theme, setTheme] = useState<'light' | 'dark'>('dark');\n  const toggleTheme = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), []);\n  return { theme, toggleTheme };\n}` },
          { name: "useStats.ts", path: "src/hooks/useStats.ts", type: "file", content: `export function useStats() {\n  return [\n    { label: 'Total Users', value: '12,847', trend: 'up' as const },\n    { label: 'Revenue', value: '$48,290', trend: 'up' as const },\n    { label: 'Active Sessions', value: '1,429', trend: 'neutral' as const },\n  ];\n}` },
        ]},
      ],
    },
    { name: "package.json", path: "package.json", type: "file", content: `{ "name": "dashboard-app", "dependencies": { "react": "^18.2.0" } }` },
    { name: "README.md", path: "README.md", type: "file", content: `# Dashboard App\nA modern dashboard built with React and TypeScript.` },
  ],
  diffs: [
    { file: "src/App.tsx", additions: 24, deletions: 0, content: "+ import { Header } from './components/Header';\n+ import { Dashboard } from './components/Dashboard';" },
    { file: "src/components/Header.tsx", additions: 18, deletions: 0, content: "+ export function Header({ onToggleTheme }) { ... }" },
    { file: "src/components/Dashboard.tsx", additions: 15, deletions: 0, content: "+ export function Dashboard() { ... }" },
    { file: "src/components/StatCard.tsx", additions: 22, deletions: 0, content: "+ export function StatCard({ label, value, trend }) { ... }" },
    { file: "README.md", additions: 12, deletions: 0, content: "+ # Dashboard App" },
  ],
  understanding: {
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
    questions: ["Should charts be included in the dashboard?"],
  },
  approaches: [
    { id: "a1", title: "Component-First Architecture", description: "Build small, reusable components. Start with StatCard, compose into Dashboard.", pros: ["Highly reusable", "Easy to test", "Clear separation"], cons: ["More files upfront", "Slightly more boilerplate"] },
    { id: "a2", title: "Feature-Based Structure", description: "Organize by feature with co-located components.", pros: ["Feature isolation", "Easy to navigate"], cons: ["May duplicate shared components"] },
    { id: "a3", title: "Minimal Flat Structure", description: "All components in a single folder.", pros: ["Simple", "Fast to implement"], cons: ["Harder to scale", "Less organized"] },
  ],
  terminalLines: [
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
  ],
  activityScript: [
    { delay: 0, category: "think", message: "Analyzing your request...", progress: 5 },
    { delay: 400, category: "search", message: "🔍 Scanning project structure... found 6 TypeScript files", progress: 10 },
    { delay: 600, category: "think", message: "🧠 Breaking down requirements into 3 features", detail: "1. Responsive dashboard layout\n2. Dark/light theme toggle\n3. Stat cards with trend indicators", progress: 15 },
    { delay: 800, category: "info", message: "📊 Alignment Score: 85% — analyzing your intent", progress: 20 },
    { delay: 1200, category: "think", message: "💡 Evaluating 3 architectural approaches...", progress: 25 },
    { delay: 800, category: "info", message: "🎮 Strategy: Component-First Architecture selected", progress: 30 },
    { delay: 600, category: "write", message: "📝 Writing App.tsx — main application component", touchFile: "src/App.tsx", progress: 40 },
    { delay: 500, category: "write", message: "📝 Writing Header.tsx — navigation with theme toggle", touchFile: "src/components/Header.tsx", progress: 48 },
    { delay: 500, category: "write", message: "📝 Writing Dashboard.tsx — responsive grid layout", touchFile: "src/components/Dashboard.tsx", progress: 55 },
    { delay: 500, category: "write", message: "📝 Writing StatCard.tsx — reusable stat display", touchFile: "src/components/StatCard.tsx", progress: 63 },
    { delay: 400, category: "write", message: "📝 Writing useTheme.ts — theme state hook", touchFile: "src/hooks/useTheme.ts", progress: 70 },
    { delay: 400, category: "write", message: "📝 Writing useStats.ts — data hook with mock data", touchFile: "src/hooks/useStats.ts", progress: 75 },
    { delay: 600, category: "test", message: "🧪 Running TypeScript compiler... no errors", progress: 80 },
    { delay: 500, category: "test", message: "✅ StatCard.test.tsx — 3 tests passing", progress: 85 },
    { delay: 400, category: "test", message: "✅ useTheme.test.ts — 2 tests passing", progress: 88 },
    { delay: 300, category: "verify", message: "✅ All 5 tests passing — code quality looks good", progress: 92 },
    { delay: 400, category: "write", message: "📄 Generating README.md with setup instructions", touchFile: "README.md", progress: 95 },
    { delay: 300, category: "info", message: "📊 Alignment Score: 92% — your intent is well understood", progress: 98 },
    { delay: 200, category: "verify", message: "🎉 Task complete — 6 files created, all tests pass", progress: 100 },
  ],
  pillarScores: { alignment: 0.92, steerability: 0.85, verification: 0.87, adaptability: 0.45 },
  testResults: { passed: 5, failed: 0, total: 5, coverage: 87 },
};

export const SCENARIO_DATA: Record<string, ScenarioData> = {
  "rest-api": REST_API_DATA,
  "auth": AUTH_DATA,
  "bugfix": BUGFIX_DATA,
  "refactor": REFACTOR_DATA,
  "default": DEFAULT_DATA,
};
