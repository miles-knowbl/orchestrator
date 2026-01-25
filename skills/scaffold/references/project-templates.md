# Project Templates

Full project templates organized by technology stack.

## Template Selection Guide

| Project Type | Recommended Template | When to Use |
|--------------|---------------------|-------------|
| React SPA | Vite + React | Single-page apps, no SSR needed |
| React Full-stack | Next.js | SSR, SEO, full-stack features |
| Vue SPA | Vite + Vue | Vue ecosystem |
| Vue Full-stack | Nuxt | SSR, full-stack Vue |
| Node.js API | Express/Fastify | REST APIs, microservices |
| Python API | FastAPI | Modern Python APIs |
| Python Web | Django | Full-featured web apps |
| Go API | Standard library + Chi | High-performance APIs |
| **MCP Server** | **TypeScript + MCP SDK** | **Claude tools/resources** |
| **CLI Tool** | **TypeScript + Commander** | **Command-line utilities** |
| **Django + Elm** | **Django DRF + Elm** | **Full-stack with Elm frontend** |
| **Rust API** | **Axum + SQLx** | **High-performance Rust APIs** |
| **NPM Package** | **TypeScript + tsup** | **Publishable npm libraries** |
| **PyPI Package** | **Python + Hatch** | **Publishable Python libraries** |
| **Chrome Extension** | **TypeScript + Webpack** | **Browser extensions (MV3)** |
| **VS Code Extension** | **TypeScript + vsce** | **Editor extensions** |

## React + Vite Template

### Initialization

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

### Enhanced Structure

```
my-app/
├── src/
│   ├── components/
│   │   └── ui/              # Reusable UI components
│   │       ├── Button/
│   │       │   ├── Button.tsx
│   │       │   ├── Button.test.tsx
│   │       │   └── index.ts
│   │       └── index.ts
│   ├── features/            # Feature modules
│   │   └── auth/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── api.ts
│   │       ├── types.ts
│   │       └── index.ts
│   ├── hooks/               # Shared hooks
│   │   └── useLocalStorage.ts
│   ├── lib/                 # Utilities, helpers
│   │   ├── api.ts           # API client setup
│   │   └── utils.ts
│   ├── types/               # Global types
│   │   └── index.ts
│   ├── routes/              # Route definitions
│   │   └── index.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
├── tests/
│   ├── setup.ts
│   └── e2e/
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

### Essential Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
```

---

## Next.js Template

### Initialization

```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir
cd my-app
```

### Structure (App Router)

```
my-app/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── api/             # API routes
│   │   │   └── users/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   └── layouts/
│   ├── lib/
│   │   ├── db.ts
│   │   └── auth.ts
│   ├── hooks/
│   └── types/
├── public/
├── prisma/                  # If using Prisma
│   └── schema.prisma
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Express + TypeScript Template

### Initialization

```bash
mkdir my-api && cd my-api
npm init -y
npm install express cors helmet
npm install -D typescript @types/node @types/express ts-node-dev
npx tsc --init
```

### Structure

```
my-api/
├── src/
│   ├── modules/
│   │   └── users/
│   │       ├── users.controller.ts
│   │       ├── users.service.ts
│   │       ├── users.repository.ts
│   │       ├── users.routes.ts
│   │       ├── users.validation.ts
│   │       ├── users.types.ts
│   │       └── __tests__/
│   │           └── users.test.ts
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   ├── authenticate.ts
│   │   │   └── validate.ts
│   │   ├── errors/
│   │   │   └── AppError.ts
│   │   └── utils/
│   │       └── logger.ts
│   ├── config/
│   │   ├── index.ts
│   │   └── database.ts
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── types/
│   │   └── express.d.ts
│   ├── app.ts
│   └── server.ts
├── tests/
│   ├── integration/
│   └── fixtures/
├── scripts/
├── .env.example
├── .eslintrc.js
├── jest.config.js
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── package.json
```

### Entry Point

```typescript
// src/server.ts
import app from './app';
import { config } from './config';
import { logger } from './common/utils/logger';

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
```

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './common/middleware/errorHandler';
import { usersRoutes } from './modules/users/users.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/users', usersRoutes);

// Error handling
app.use(errorHandler);

export default app;
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts"
  }
}
```

---

## FastAPI Template

### Initialization

```bash
mkdir my-api && cd my-api
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy alembic pydantic-settings
```

### Structure

```
my-api/
├── src/
│   └── app/
│       ├── api/
│       │   ├── v1/
│       │   │   ├── endpoints/
│       │   │   │   ├── __init__.py
│       │   │   │   └── users.py
│       │   │   └── __init__.py
│       │   └── deps.py
│       ├── core/
│       │   ├── __init__.py
│       │   ├── config.py
│       │   └── security.py
│       ├── db/
│       │   ├── __init__.py
│       │   ├── base.py
│       │   └── session.py
│       ├── models/
│       │   ├── __init__.py
│       │   └── user.py
│       ├── schemas/
│       │   ├── __init__.py
│       │   └── user.py
│       ├── services/
│       │   ├── __init__.py
│       │   └── user.py
│       ├── __init__.py
│       └── main.py
├── tests/
│   ├── conftest.py
│   └── test_users.py
├── alembic/
│   └── versions/
├── alembic.ini
├── pyproject.toml
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### Main Application

```python
# src/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
def health_check():
    return {"status": "ok"}

# API routes
app.include_router(api_router, prefix=settings.API_V1_STR)
```

### Configuration

```python
# src/app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "My API"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str
    SECRET_KEY: str
    
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### pyproject.toml

```toml
[project]
name = "my-api"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.100.0",
    "uvicorn[standard]>=0.23.0",
    "sqlalchemy>=2.0.0",
    "alembic>=1.12.0",
    "pydantic-settings>=2.0.0",
    "asyncpg>=0.28.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0",
    "httpx>=0.24.0",
    "ruff>=0.1.0",
    "mypy>=1.5.0",
]

[tool.ruff]
line-length = 88
select = ["E", "F", "I", "N", "W"]

[tool.mypy]
strict = true
```

---

## Django Template

### Initialization

```bash
pip install django djangorestframework
django-admin startproject config .
python manage.py startapp users
```

### Structure

```
my-project/
├── src/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   └── users/
│   │       ├── __init__.py
│   │       ├── admin.py
│   │       ├── apps.py
│   │       ├── models.py
│   │       ├── serializers.py
│   │       ├── views.py
│   │       ├── urls.py
│   │       └── tests/
│   │           ├── __init__.py
│   │           └── test_views.py
│   └── core/
│       ├── __init__.py
│       └── models.py          # Base models
├── tests/
├── static/
├── media/
├── manage.py
├── pyproject.toml
├── Dockerfile
└── docker-compose.yml
```

---

## Go API Template

### Initialization

```bash
mkdir my-api && cd my-api
go mod init github.com/username/my-api
```

### Structure

```
my-api/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── handlers/
│   │   ├── handlers.go
│   │   └── users.go
│   ├── services/
│   │   └── user_service.go
│   ├── repositories/
│   │   └── user_repository.go
│   ├── models/
│   │   └── user.go
│   ├── middleware/
│   │   ├── logging.go
│   │   └── auth.go
│   └── config/
│       └── config.go
├── pkg/                     # Public packages
│   └── validator/
├── migrations/
├── scripts/
├── .env.example
├── go.mod
├── go.sum
├── Makefile
├── Dockerfile
└── README.md
```

### Main Entry Point

```go
// cmd/server/main.go
package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/username/my-api/internal/config"
    "github.com/username/my-api/internal/handlers"
)

func main() {
    cfg := config.Load()
    
    h := handlers.New(cfg)
    
    srv := &http.Server{
        Addr:         ":" + cfg.Port,
        Handler:      h.Router(),
        ReadTimeout:  15 * time.Second,
        WriteTimeout: 15 * time.Second,
    }

    // Start server
    go func() {
        log.Printf("Server starting on port %s", cfg.Port)
        if err := srv.ListenAndServe(); err != http.ErrServerClosed {
            log.Fatalf("Server error: %v", err)
        }
    }()

    // Graceful shutdown
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatalf("Server forced to shutdown: %v", err)
    }

    log.Println("Server exited")
}
```

### Makefile

```makefile
.PHONY: build run test lint

build:
	go build -o bin/server ./cmd/server

run:
	go run ./cmd/server

test:
	go test -v ./...

test-coverage:
	go test -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out

lint:
	golangci-lint run

migrate-up:
	migrate -path migrations -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path migrations -database "$(DATABASE_URL)" down

docker-build:
	docker build -t my-api .

docker-run:
	docker run -p 8080:8080 my-api
```

---

## MCP Server Template (TypeScript)

Model Context Protocol server for exposing tools and resources to Claude.

### Initialization

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk
npm install -D typescript @types/node ts-node
npx tsc --init
```

### Structure

```
my-mcp-server/
├── src/
│   ├── services/           # Business logic
│   │   ├── index.ts        # Export all services
│   │   ├── FileService.ts  # File operations
│   │   └── DataService.ts  # Domain-specific service
│   ├── tools/              # MCP tool definitions
│   │   └── index.ts        # Tool registration
│   ├── resources/          # MCP resources (optional)
│   │   └── index.ts
│   ├── types/              # Type definitions
│   │   └── index.ts
│   ├── utils/              # Utilities
│   │   └── logger.ts
│   └── index.ts            # Server entry point
├── tests/
│   ├── services/
│   │   └── DataService.test.ts
│   └── tools/
│       └── tools.test.ts
├── schemas/                # JSON schemas (if needed)
│   └── data-schema.json
├── .env.example
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

### Entry Point (src/index.ts)

```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools/index.js';
import { FileService } from './services/FileService.js';
import { DataService } from './services/DataService.js';
import { logger } from './utils/logger.js';

async function main() {
  // Initialize services
  const fileService = new FileService(process.env.DATA_DIR || './data');
  const dataService = new DataService(fileService);
  
  const services = { file: fileService, data: dataService };

  // Create MCP server
  const server = new Server(
    { name: 'my-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  // Register tools
  registerTools(server, services);

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  logger.info('MCP server started');
}

main().catch((error) => {
  logger.error('Failed to start server', { error: error.message });
  process.exit(1);
});
```

### Tool Registration (src/tools/index.ts)

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { Services } from '../types/index.js';
import { logger } from '../utils/logger.js';

const TOOLS: Tool[] = [
  {
    name: 'data_list',
    description: 'List all data items',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'data_get',
    description: 'Get a specific data item by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Item ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'data_create',
    description: 'Create a new data item',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Item name' },
        content: { type: 'string', description: 'Item content' },
      },
      required: ['name', 'content'],
    },
  },
];

export function registerTools(server: Server, services: Services): void {
  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    logger.debug('tool_call', { tool: name, args });
    
    try {
      const result = await handleToolCall(name, args || {}, services);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('tool_error', { tool: name, error: message });
      
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  });
}

async function handleToolCall(
  name: string, 
  args: Record<string, unknown>,
  services: Services
): Promise<unknown> {
  switch (name) {
    case 'data_list': {
      const items = await services.data.list();
      return { items };
    }
    
    case 'data_get': {
      const { id } = args as { id: string };
      const item = await services.data.get(id);
      return { item };
    }
    
    case 'data_create': {
      const { name: itemName, content } = args as { name: string; content: string };
      const item = await services.data.create({ name: itemName, content });
      return { item, created: true };
    }
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
```

### Service Layer (src/services/FileService.ts)

```typescript
import fs from 'fs/promises';
import path from 'path';

export class FileService {
  constructor(private baseDir: string) {}

  async read(relativePath: string): Promise<string> {
    const fullPath = path.join(this.baseDir, relativePath);
    return fs.readFile(fullPath, 'utf-8');
  }

  async write(relativePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.baseDir, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async exists(relativePath: string): Promise<boolean> {
    const fullPath = path.join(this.baseDir, relativePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async list(relativePath: string = ''): Promise<string[]> {
    const fullPath = path.join(this.baseDir, relativePath);
    try {
      return await fs.readdir(fullPath);
    } catch {
      return [];
    }
  }

  async readJson<T>(relativePath: string): Promise<T> {
    const content = await this.read(relativePath);
    return JSON.parse(content);
  }

  async writeJson<T>(relativePath: string, data: T): Promise<void> {
    await this.write(relativePath, JSON.stringify(data, null, 2));
  }
}
```

### Types (src/types/index.ts)

```typescript
import { FileService } from '../services/FileService.js';
import { DataService } from '../services/DataService.js';

export interface Services {
  file: FileService;
  data: DataService;
}

export interface DataItem {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

### Logger (src/utils/logger.ts)

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
  };
  
  // Log to stderr (stdout is reserved for MCP communication)
  console.error(JSON.stringify(entry));
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => log('debug', message, data),
  info: (message: string, data?: Record<string, unknown>) => log('info', message, data),
  warn: (message: string, data?: Record<string, unknown>) => log('warn', message, data),
  error: (message: string, data?: Record<string, unknown>) => log('error', message, data),
};
```

### Package.json

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "my-mcp-server": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node --esm src/index.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Claude Code Configuration

Create `.mcp.json` in your project root:

**Option A: Stdio transport (local process)**
```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["/path/to/my-mcp-server/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/data"
      }
    }
  }
}
```

**Option B: HTTP transport (remote/shared server)**
```json
{
  "mcpServers": {
    "my-mcp-server": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "X-API-Key": "${MCP_API_KEY}"
      }
    }
  }
}
```

### Key Patterns

| Pattern | Implementation |
|---------|----------------|
| Service layer | Business logic in services, tools call services |
| Error handling | Try/catch in tool handler, return isError flag |
| Logging | stderr only (stdout is MCP communication) |
| Type safety | Full TypeScript with strict mode |
| Testing | Jest with ts-jest for type-safe tests |

---

## CLI Tool Template (TypeScript)

### Initialization

```bash
mkdir my-cli && cd my-cli
npm init -y
npm install commander chalk
npm install -D typescript @types/node
```

### Structure

```
my-cli/
├── src/
│   ├── commands/
│   │   ├── index.ts
│   │   └── process.ts
│   ├── lib/
│   │   └── processor.ts
│   └── index.ts
├── bin/
│   └── cli.js
├── package.json
└── tsconfig.json
```

### Entry Point

```typescript
#!/usr/bin/env node
// src/index.ts
import { Command } from 'commander';
import { processCommand } from './commands/process.js';

const program = new Command();

program
  .name('my-cli')
  .description('CLI tool description')
  .version('1.0.0');

program
  .command('process')
  .description('Process files')
  .argument('<input>', 'Input file')
  .option('-o, --output <file>', 'Output file')
  .option('-v, --verbose', 'Verbose output')
  .action(processCommand);

program.parse();
```

---

## Django + Elm Template

Full-stack template with Django REST Framework backend and Elm frontend.

### Initialization

```bash
# Create project directory
mkdir my-project && cd my-project

# Backend setup
python -m venv venv
source venv/bin/activate
pip install django djangorestframework django-cors-headers
django-admin startproject config backend
cd backend
python manage.py startapp api

# Frontend setup
cd ..
mkdir frontend && cd frontend
elm init
npm init -y
npm install --save-dev elm-live parcel
```

### Structure

```
my-project/
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests/
│   │       ├── __init__.py
│   │       ├── test_models.py
│   │       └── test_views.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── Main.elm
│   │   ├── Api.elm           # HTTP requests
│   │   ├── Route.elm         # Routing
│   │   ├── Session.elm       # Auth state
│   │   ├── Page/
│   │   │   ├── Home.elm
│   │   │   ├── Login.elm
│   │   │   └── NotFound.elm
│   │   └── Components/
│   │       ├── Header.elm
│   │       └── Form.elm
│   ├── static/
│   │   └── styles.css
│   ├── index.html
│   ├── elm.json
│   └── package.json
├── docker-compose.yml
├── Makefile
└── README.md
```

### Backend Settings (backend/config/settings/base.py)

```python
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'corsheaders',
    # Local
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

CORS_ALLOWED_ORIGINS = [
    'http://localhost:1234',  # Parcel dev server
]
```

### Elm Main (frontend/src/Main.elm)

```elm
module Main exposing (main)

import Browser
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
import Url

import Route exposing (Route)
import Session exposing (Session)
import Page.Home as Home
import Page.Login as Login


type Model
    = Home Home.Model
    | Login Login.Model
    | NotFound Session


type Msg
    = LinkClicked Browser.UrlRequest
    | UrlChanged Url.Url
    | GotHomeMsg Home.Msg
    | GotLoginMsg Login.Msg


main : Program () Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlChange = UrlChanged
        , onUrlRequest = LinkClicked
        }


init : () -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init _ url key =
    changeRouteTo (Route.fromUrl url) (NotFound (Session.guest key))
```

### Elm API Module (frontend/src/Api.elm)

```elm
module Api exposing (get, post, put, delete, Error(..))

import Http
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode


type Error
    = BadUrl String
    | Timeout
    | NetworkError
    | BadStatus Int String
    | BadBody String


baseUrl : String
baseUrl =
    "http://localhost:8000/api"


get : { url : String, expect : Result Error a -> msg, decoder : Decoder a } -> Cmd msg
get config =
    Http.get
        { url = baseUrl ++ config.url
        , expect = expectJson config.expect config.decoder
        }


post : { url : String, body : Encode.Value, expect : Result Error a -> msg, decoder : Decoder a } -> Cmd msg
post config =
    Http.post
        { url = baseUrl ++ config.url
        , body = Http.jsonBody config.body
        , expect = expectJson config.expect config.decoder
        }


expectJson : (Result Error a -> msg) -> Decoder a -> Http.Expect msg
expectJson toMsg decoder =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err (BadUrl url)

                Http.Timeout_ ->
                    Err Timeout

                Http.NetworkError_ ->
                    Err NetworkError

                Http.BadStatus_ metadata body ->
                    Err (BadStatus metadata.statusCode body)

                Http.GoodStatus_ _ body ->
                    case Decode.decodeString decoder body of
                        Ok value ->
                            Ok value

                        Err err ->
                            Err (BadBody (Decode.errorToString err))
```

### Makefile

```makefile
.PHONY: dev backend frontend test

dev:
	make -j2 backend frontend

backend:
	cd backend && python manage.py runserver

frontend:
	cd frontend && npx parcel index.html

test:
	cd backend && python manage.py test

migrate:
	cd backend && python manage.py migrate

build-frontend:
	cd frontend && npx parcel build index.html --dist-dir ../backend/static/elm
```

---

## Rust API Template

High-performance API using Axum framework.

### Initialization

```bash
cargo new my-api
cd my-api
cargo add axum tokio serde serde_json tower-http sqlx
cargo add --dev tokio-test
```

### Structure

```
my-api/
├── src/
│   ├── main.rs
│   ├── lib.rs
│   ├── config.rs
│   ├── error.rs
│   ├── routes/
│   │   ├── mod.rs
│   │   ├── health.rs
│   │   └── users.rs
│   ├── handlers/
│   │   ├── mod.rs
│   │   └── users.rs
│   ├── models/
│   │   ├── mod.rs
│   │   └── user.rs
│   ├── services/
│   │   ├── mod.rs
│   │   └── user_service.rs
│   └── db/
│       ├── mod.rs
│       └── pool.rs
├── migrations/
│   └── 001_create_users.sql
├── tests/
│   └── integration_tests.rs
├── Cargo.toml
├── Cargo.lock
├── .env.example
├── Dockerfile
└── README.md
```

### Main Entry (src/main.rs)

```rust
use axum::{Router, Server};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use tracing_subscriber;

mod config;
mod error;
mod routes;
mod handlers;
mod models;
mod services;
mod db;

use config::Config;
use db::pool::create_pool;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::init();

    // Load config
    let config = Config::from_env()?;

    // Create database pool
    let pool = create_pool(&config.database_url).await?;

    // Build application
    let app = Router::new()
        .merge(routes::health::router())
        .merge(routes::users::router())
        .layer(CorsLayer::permissive())
        .with_state(pool);

    // Run server
    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("Server listening on {}", addr);

    Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;

    Ok(())
}
```

### Error Handling (src/error.rs)

```rust
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

pub type Result<T> = std::result::Result<T, AppError>;

#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    BadRequest(String),
    Internal(String),
    Unauthorized,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized".to_string()),
        };

        let body = Json(json!({ "error": message }));
        (status, body).into_response()
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        AppError::Internal(err.to_string())
    }
}
```

### Handler Example (src/handlers/users.rs)

```rust
use axum::{
    extract::{Path, State},
    Json,
};
use sqlx::PgPool;

use crate::error::{AppError, Result};
use crate::models::user::{CreateUser, User};
use crate::services::user_service;

pub async fn list_users(State(pool): State<PgPool>) -> Result<Json<Vec<User>>> {
    let users = user_service::list_all(&pool).await?;
    Ok(Json(users))
}

pub async fn get_user(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
) -> Result<Json<User>> {
    let user = user_service::find_by_id(&pool, id)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("User {} not found", id)))?;
    Ok(Json(user))
}

pub async fn create_user(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateUser>,
) -> Result<Json<User>> {
    let user = user_service::create(&pool, payload).await?;
    Ok(Json(user))
}
```

### Cargo.toml

```toml
[package]
name = "my-api"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
sqlx = { version = "0.7", features = ["runtime-tokio", "postgres"] }
tower-http = { version = "0.5", features = ["cors"] }
tracing = "0.1"
tracing-subscriber = "0.3"
anyhow = "1"
dotenvy = "0.15"

[dev-dependencies]
tokio-test = "0.4"
```

---

## Library/Package Template

### NPM Package (TypeScript)

```bash
mkdir my-lib && cd my-lib
npm init -y
npm install -D typescript tsup vitest @types/node
```

#### Structure

```
my-lib/
├── src/
│   ├── index.ts          # Main exports
│   ├── core/
│   │   └── processor.ts
│   ├── utils/
│   │   └── helpers.ts
│   └── types.ts
├── tests/
│   └── processor.test.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── .npmignore
└── README.md
```

#### package.json

```json
{
  "name": "@scope/my-lib",
  "version": "0.1.0",
  "description": "My library description",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/index.js",
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "prepublishOnly": "npm run build"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0",
    "@types/node": "^20.0.0"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
```

#### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
```

#### src/index.ts

```typescript
// Re-export public API
export { Processor, type ProcessorOptions } from './core/processor';
export { formatOutput, parseInput } from './utils/helpers';
export type { InputData, OutputData } from './types';
```

---

### PyPI Package (Python)

```bash
mkdir my-lib && cd my-lib
python -m venv venv
source venv/bin/activate
pip install build twine pytest pytest-cov
```

#### Structure

```
my-lib/
├── src/
│   └── my_lib/
│       ├── __init__.py
│       ├── core.py
│       ├── utils.py
│       └── py.typed        # PEP 561 marker
├── tests/
│   ├── __init__.py
│   ├── test_core.py
│   └── conftest.py
├── pyproject.toml
├── README.md
├── LICENSE
└── .gitignore
```

#### pyproject.toml

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "my-lib"
version = "0.1.0"
description = "My library description"
readme = "README.md"
license = "MIT"
requires-python = ">=3.10"
authors = [
    { name = "Your Name", email = "you@example.com" }
]
classifiers = [
    "Development Status :: 3 - Alpha",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
    "Typing :: Typed",
]
dependencies = []

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "pytest-cov>=4.0",
    "mypy>=1.0",
    "ruff>=0.1",
]

[project.urls]
Homepage = "https://github.com/username/my-lib"
Documentation = "https://my-lib.readthedocs.io"

[tool.hatch.build.targets.wheel]
packages = ["src/my_lib"]

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --cov=my_lib"

[tool.mypy]
strict = true

[tool.ruff]
line-length = 88
select = ["E", "F", "I", "N", "W", "UP"]
```

#### src/my_lib/__init__.py

```python
"""My library for doing things."""

from my_lib.core import Processor, process
from my_lib.utils import format_output, parse_input

__version__ = "0.1.0"
__all__ = ["Processor", "process", "format_output", "parse_input"]
```

---

## Chrome Extension Template

### Initialization

```bash
mkdir my-extension && cd my-extension
npm init -y
npm install -D typescript webpack webpack-cli copy-webpack-plugin
```

### Structure

```
my-extension/
├── src/
│   ├── background/
│   │   └── index.ts        # Service worker
│   ├── content/
│   │   └── index.ts        # Content script
│   ├── popup/
│   │   ├── index.html
│   │   ├── index.ts
│   │   └── styles.css
│   ├── options/
│   │   ├── index.html
│   │   └── index.ts
│   └── utils/
│       ├── storage.ts
│       └── messaging.ts
├── public/
│   ├── manifest.json
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── dist/                   # Built extension
├── webpack.config.js
├── tsconfig.json
├── package.json
└── README.md
```

### manifest.json (Manifest V3)

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "description": "Extension description",
  
  "permissions": [
    "storage",
    "activeTab"
  ],
  
  "host_permissions": [
    "https://*.example.com/*"
  ],
  
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  
  "content_scripts": [
    {
      "matches": ["https://*.example.com/*"],
      "js": ["content.js"],
      "css": ["content.css"]
    }
  ],
  
  "action": {
    "default_popup": "popup/index.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  
  "options_page": "options/index.html",
  
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### Background Service Worker (src/background/index.ts)

```typescript
/// <reference types="chrome"/>

import { getStorage, setStorage } from '../utils/storage';

// Listen for installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Initialize default settings
    await setStorage({ enabled: true, count: 0 });
    console.log('Extension installed');
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    getStorage(['enabled']).then((data) => {
      sendResponse({ enabled: data.enabled });
    });
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'INCREMENT') {
    getStorage(['count']).then(async (data) => {
      const newCount = (data.count || 0) + 1;
      await setStorage({ count: newCount });
      sendResponse({ count: newCount });
    });
    return true;
  }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('example.com')) {
    // Do something when example.com loads
    console.log('Example.com loaded');
  }
});
```

### Content Script (src/content/index.ts)

```typescript
/// <reference types="chrome"/>

// Run when page loads
function init() {
  console.log('Content script loaded');
  
  // Send message to background
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
    if (response?.enabled) {
      injectUI();
    }
  });
}

function injectUI() {
  const container = document.createElement('div');
  container.id = 'my-extension-container';
  container.innerHTML = `
    <div class="my-extension-widget">
      <button id="my-extension-btn">Click me</button>
    </div>
  `;
  document.body.appendChild(container);
  
  document.getElementById('my-extension-btn')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'INCREMENT' }, (response) => {
      console.log('Count:', response?.count);
    });
  });
}

// Listen for messages from background/popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE') {
    const container = document.getElementById('my-extension-container');
    if (container) {
      container.style.display = container.style.display === 'none' ? 'block' : 'none';
    }
    sendResponse({ success: true });
  }
});

init();
```

### Storage Utility (src/utils/storage.ts)

```typescript
/// <reference types="chrome"/>

export async function getStorage<T extends Record<string, unknown>>(
  keys: (keyof T)[]
): Promise<Partial<T>> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(keys as string[], (result) => {
      resolve(result as Partial<T>);
    });
  });
}

export async function setStorage<T extends Record<string, unknown>>(
  data: Partial<T>
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(data, resolve);
  });
}

export function watchStorage<T>(
  callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      callback(changes);
    }
  });
}
```

### webpack.config.js

```javascript
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background/index.ts',
    content: './src/content/index.ts',
    'popup/popup': './src/popup/index.ts',
    'options/options': './src/options/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public', to: '.' },
        { from: 'src/popup/index.html', to: 'popup/index.html' },
        { from: 'src/popup/styles.css', to: 'popup/styles.css' },
        { from: 'src/options/index.html', to: 'options/index.html' },
      ],
    }),
  ],
};
```

---

## VS Code Extension Template

### Initialization

```bash
npm install -g yo generator-code
yo code  # Select TypeScript extension

# Or manually:
mkdir my-vscode-extension && cd my-vscode-extension
npm init -y
npm install -D @types/vscode typescript @vscode/test-electron
```

### Structure

```
my-vscode-extension/
├── src/
│   ├── extension.ts        # Entry point
│   ├── commands/
│   │   ├── index.ts
│   │   └── helloWorld.ts
│   ├── providers/
│   │   ├── completionProvider.ts
│   │   └── hoverProvider.ts
│   ├── views/
│   │   └── treeView.ts
│   └── utils/
│       └── config.ts
├── test/
│   ├── runTest.ts
│   └── suite/
│       ├── index.ts
│       └── extension.test.ts
├── .vscode/
│   ├── launch.json
│   └── tasks.json
├── package.json
├── tsconfig.json
├── .vscodeignore
└── README.md
```

### package.json

```json
{
  "name": "my-vscode-extension",
  "displayName": "My Extension",
  "description": "Extension description",
  "version": "0.1.0",
  "publisher": "your-publisher-name",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["Other"],
  "activationEvents": [],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "myExtension.helloWorld",
        "title": "Hello World",
        "category": "My Extension"
      },
      {
        "command": "myExtension.processFile",
        "title": "Process Current File",
        "category": "My Extension"
      }
    ],
    "keybindings": [
      {
        "command": "myExtension.processFile",
        "key": "ctrl+shift+p",
        "mac": "cmd+shift+p",
        "when": "editorTextFocus"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "command": "myExtension.processFile",
          "when": "editorTextFocus",
          "group": "myExtension"
        }
      ]
    },
    "configuration": {
      "title": "My Extension",
      "properties": {
        "myExtension.enabled": {
          "type": "boolean",
          "default": true,
          "description": "Enable the extension"
        },
        "myExtension.maxItems": {
          "type": "number",
          "default": 10,
          "description": "Maximum number of items to show"
        }
      }
    },
    "views": {
      "explorer": [
        {
          "id": "myExtensionView",
          "name": "My Extension",
          "when": "myExtension.enabled"
        }
      ]
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "pretest": "npm run compile",
    "test": "node ./out/test/runTest.js",
    "package": "vsce package",
    "publish": "vsce publish"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "@vscode/test-electron": "^2.3.0",
    "@vscode/vsce": "^2.22.0"
  }
}
```

### Extension Entry (src/extension.ts)

```typescript
import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { MyTreeDataProvider } from './views/treeView';
import { MyCompletionProvider } from './providers/completionProvider';
import { MyHoverProvider } from './providers/hoverProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "my-vscode-extension" is now active');

  // Register commands
  registerCommands(context);

  // Register tree view
  const treeDataProvider = new MyTreeDataProvider();
  vscode.window.registerTreeDataProvider('myExtensionView', treeDataProvider);

  // Register completion provider
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    { scheme: 'file', language: 'typescript' },
    new MyCompletionProvider(),
    '.' // Trigger character
  );
  context.subscriptions.push(completionProvider);

  // Register hover provider
  const hoverProvider = vscode.languages.registerHoverProvider(
    { scheme: 'file', language: 'typescript' },
    new MyHoverProvider()
  );
  context.subscriptions.push(hoverProvider);

  // Watch configuration changes
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('myExtension')) {
      const config = vscode.workspace.getConfiguration('myExtension');
      const enabled = config.get<boolean>('enabled');
      vscode.commands.executeCommand(
        'setContext',
        'myExtension.enabled',
        enabled
      );
    }
  });
}

export function deactivate() {
  console.log('Extension "my-vscode-extension" is now deactivated');
}
```

### Command Registration (src/commands/index.ts)

```typescript
import * as vscode from 'vscode';

export function registerCommands(context: vscode.ExtensionContext) {
  // Hello World command
  const helloWorld = vscode.commands.registerCommand(
    'myExtension.helloWorld',
    () => {
      vscode.window.showInformationMessage('Hello World from My Extension!');
    }
  );
  context.subscriptions.push(helloWorld);

  // Process file command
  const processFile = vscode.commands.registerCommand(
    'myExtension.processFile',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const document = editor.document;
      const text = document.getText();

      // Show progress
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Processing file...',
          cancellable: true,
        },
        async (progress, token) => {
          token.onCancellationRequested(() => {
            console.log('User cancelled');
          });

          progress.report({ increment: 0 });

          // Simulate processing
          await new Promise((resolve) => setTimeout(resolve, 1000));
          progress.report({ increment: 50, message: 'Halfway there...' });

          await new Promise((resolve) => setTimeout(resolve, 1000));
          progress.report({ increment: 50, message: 'Done!' });

          vscode.window.showInformationMessage(
            `Processed ${text.length} characters`
          );
        }
      );
    }
  );
  context.subscriptions.push(processFile);
}
```

### Tree View (src/views/treeView.ts)

```typescript
import * as vscode from 'vscode';

export class MyTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeItem): Thenable<TreeItem[]> {
    if (!element) {
      // Root items
      return Promise.resolve([
        new TreeItem('Item 1', vscode.TreeItemCollapsibleState.Collapsed),
        new TreeItem('Item 2', vscode.TreeItemCollapsibleState.None),
      ]);
    }

    // Child items
    return Promise.resolve([
      new TreeItem('Child 1', vscode.TreeItemCollapsibleState.None),
      new TreeItem('Child 2', vscode.TreeItemCollapsibleState.None),
    ]);
  }
}

class TreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}`;
    this.description = 'description';
  }
}
```

### .vscode/launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
      "outFiles": ["${workspaceFolder}/out/**/*.js"],
      "preLaunchTask": "npm: watch"
    },
    {
      "name": "Extension Tests",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
      ],
      "outFiles": ["${workspaceFolder}/out/test/**/*.js"],
      "preLaunchTask": "npm: watch"
    }
  ]
}
```
