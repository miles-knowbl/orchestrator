# Stack Configurations

Stack-specific setup guides and best practices.

## Node.js / TypeScript

### Recommended Setup

```bash
# Initialize
npm init -y

# TypeScript
npm install -D typescript @types/node ts-node-dev

# Linting & Formatting
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier

# Testing
npm install -D jest @types/jest ts-jest

# Initialize TypeScript
npx tsc --init
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "type-check": "tsc --noEmit"
  }
}
```

### Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/config/*": ["./src/config/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  }
}
```

```javascript
// jest.config.js - for path aliases in tests
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Production Checklist

```markdown
- [ ] TypeScript strict mode enabled
- [ ] ESLint with strict rules
- [ ] Test coverage > 80%
- [ ] No `any` types (or justified)
- [ ] Error handling in all async code
- [ ] Environment variables validated
- [ ] Logging configured
- [ ] Health check endpoint
- [ ] Graceful shutdown
```

---

## React / Vite

### Recommended Setup

```bash
# Create project
npm create vite@latest my-app -- --template react-ts

# Essential dependencies
npm install react-router-dom @tanstack/react-query

# Development dependencies
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D vitest jsdom
npm install -D @types/react @types/react-dom
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
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
```

### React Query Setup

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// src/main.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

### Production Checklist

```markdown
- [ ] Error boundaries implemented
- [ ] Loading states for all async
- [ ] Lazy loading for routes
- [ ] Bundle size optimized
- [ ] Lighthouse score > 90
- [ ] Accessibility audit passed
- [ ] SEO meta tags (if applicable)
```

---

## Python / FastAPI

### Recommended Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Core dependencies
pip install fastapi uvicorn[standard] pydantic-settings

# Database
pip install sqlalchemy asyncpg alembic

# Development
pip install pytest pytest-asyncio httpx
pip install ruff mypy

# Save dependencies
pip freeze > requirements.txt
# Or use poetry/pyproject.toml
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
    "pydantic-settings>=2.0.0",
    "sqlalchemy>=2.0.0",
    "asyncpg>=0.28.0",
    "alembic>=1.12.0",
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
select = ["E", "F", "I", "N", "W", "UP", "B", "C4"]
ignore = ["E501"]

[tool.ruff.isort]
known-first-party = ["app"]

[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

### Application Structure

```python
# src/app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.api.v1 import api_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
```

### Production Checklist

```markdown
- [ ] Type hints on all functions
- [ ] Pydantic models for validation
- [ ] Async database operations
- [ ] Connection pooling configured
- [ ] Rate limiting implemented
- [ ] CORS configured
- [ ] Structured logging
- [ ] Exception handlers
```

---

## Django

### Recommended Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Core dependencies
pip install django djangorestframework
pip install psycopg2-binary  # PostgreSQL
pip install django-cors-headers
pip install django-environ

# Development
pip install pytest-django
pip install ruff mypy django-stubs

# Start project
django-admin startproject config .
```

### Settings Structure

```python
# config/settings/base.py
import environ
from pathlib import Path

env = environ.Env()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = env("SECRET_KEY")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "rest_framework",
    "corsheaders",
    # Local
    "apps.users",
]

# config/settings/development.py
from .base import *

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DB_NAME", default="myapp"),
        "USER": env("DB_USER", default="postgres"),
        "PASSWORD": env("DB_PASSWORD", default="postgres"),
        "HOST": env("DB_HOST", default="localhost"),
        "PORT": env("DB_PORT", default="5432"),
    }
}

# config/settings/production.py
from .base import *

DEBUG = False
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")

DATABASES = {
    "default": env.db("DATABASE_URL"),
}
```

### Production Checklist

```markdown
- [ ] DEBUG = False
- [ ] SECRET_KEY from environment
- [ ] ALLOWED_HOSTS configured
- [ ] HTTPS enforced
- [ ] CSRF protection enabled
- [ ] Secure cookies
- [ ] Static files served via CDN
- [ ] Database connection pooling
- [ ] Logging configured
```

---

## Go

### Recommended Setup

```bash
# Initialize module
go mod init github.com/username/project

# Common dependencies
go get github.com/go-chi/chi/v5
go get github.com/jackc/pgx/v5
go get github.com/kelseyhightower/envconfig

# Testing
go get github.com/stretchr/testify

# Linting (install golangci-lint separately)
# https://golangci-lint.run/usage/install/
```

### Project Layout

```
project/
├── cmd/
│   └── server/
│       └── main.go          # Entry point
├── internal/                # Private packages
│   ├── config/
│   ├── handlers/
│   ├── services/
│   ├── repositories/
│   └── models/
├── pkg/                     # Public packages
├── migrations/
├── go.mod
├── go.sum
├── Makefile
└── .golangci.yml
```

### Makefile

```makefile
.PHONY: build run test lint clean

BINARY_NAME=server
BUILD_DIR=bin

build:
	go build -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/server

run:
	go run ./cmd/server

test:
	go test -v ./...

test-coverage:
	go test -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

lint:
	golangci-lint run

clean:
	rm -rf $(BUILD_DIR)

docker-build:
	docker build -t $(BINARY_NAME) .

docker-run:
	docker run -p 8080:8080 $(BINARY_NAME)
```

### golangci-lint Configuration

```yaml
# .golangci.yml
run:
  timeout: 5m

linters:
  enable:
    - errcheck
    - gosimple
    - govet
    - ineffassign
    - staticcheck
    - unused
    - gofmt
    - goimports
    - misspell
    - unconvert
    - gosec

linters-settings:
  gofmt:
    simplify: true
  goimports:
    local-prefixes: github.com/username/project

issues:
  exclude-rules:
    - path: _test\.go
      linters:
        - errcheck
```

### Production Checklist

```markdown
- [ ] Error handling (no ignored errors)
- [ ] Graceful shutdown
- [ ] Context propagation
- [ ] Structured logging
- [ ] Connection pooling
- [ ] Health/ready endpoints
- [ ] Metrics endpoint
- [ ] No data races (test with -race)
```

---

## Database Setup

### PostgreSQL with Docker

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

### Migration Tools

| Language | Tool | Command |
|----------|------|---------|
| Node.js | Prisma | `npx prisma migrate dev` |
| Node.js | Knex | `npx knex migrate:latest` |
| Python | Alembic | `alembic upgrade head` |
| Python | Django | `python manage.py migrate` |
| Go | golang-migrate | `migrate -path migrations -database $DB_URL up` |

---

## Common Development Tools

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: local
    hooks:
      - id: typecheck
        name: Type check
        entry: npm run type-check
        language: system
        pass_filenames: false
```

### VS Code Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  }
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-python.python",
    "charliermarsh.ruff",
    "golang.go",
    "bradlc.vscode-tailwindcss"
  ]
}
```
