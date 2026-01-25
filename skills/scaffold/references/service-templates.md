# Service Templates

Templates for scaffolding microservices and API services.

## Service Scaffold Checklist

```markdown
## Service Setup Checklist

### Core
- [ ] Entry point (main.ts/main.py/main.go)
- [ ] HTTP server setup
- [ ] Health check endpoint (/health)
- [ ] Ready check endpoint (/ready)
- [ ] Graceful shutdown

### Configuration
- [ ] Environment variable loading
- [ ] Config validation
- [ ] Secrets from vault/env

### API
- [ ] Route definitions
- [ ] Request validation
- [ ] Error handling middleware
- [ ] CORS configuration
- [ ] Rate limiting

### Database
- [ ] Connection setup
- [ ] Migration system
- [ ] Connection pooling
- [ ] Health check integration

### Observability
- [ ] Structured logging
- [ ] Metrics endpoint (/metrics)
- [ ] Request tracing
- [ ] Error tracking

### Deployment
- [ ] Dockerfile
- [ ] docker-compose.yml (dev)
- [ ] Kubernetes manifests (if applicable)
- [ ] CI/CD pipeline
```

## Node.js Service Template

### Directory Structure

```
my-service/
├── src/
│   ├── modules/
│   │   └── health/
│   │       ├── health.controller.ts
│   │       └── health.routes.ts
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   ├── requestLogger.ts
│   │   │   └── validate.ts
│   │   ├── errors/
│   │   │   └── AppError.ts
│   │   └── utils/
│   │       └── logger.ts
│   ├── config/
│   │   └── index.ts
│   ├── app.ts
│   └── server.ts
├── tests/
├── .env.example
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

### server.ts

```typescript
import app from './app';
import { config } from './config';
import { logger } from './common/utils/logger';

const server = app.listen(config.PORT, () => {
  logger.info(`Service started`, {
    port: config.PORT,
    env: config.NODE_ENV,
  });
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  
  server.close(() => {
    logger.info('HTTP server closed');
  });

  // Close database connections, etc.
  // await db.close();
  
  // Force exit after timeout
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});
```

### app.ts

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from './common/middleware/requestLogger';
import { errorHandler } from './common/middleware/errorHandler';
import { healthRoutes } from './modules/health/health.routes';
// Import other routes

const app = express();

// Security
app.use(helmet());
app.use(cors());

// Parsing
app.use(express.json({ limit: '10mb' }));

// Logging
app.use(requestLogger);

// Health routes (no auth)
app.use(healthRoutes);

// API routes
// app.use('/api/v1/users', authMiddleware, userRoutes);

// Error handling
app.use(errorHandler);

export default app;
```

### Health Module

```typescript
// modules/health/health.controller.ts
import type { Request, Response } from 'express';
import { db } from '../../config/database';

export const healthCheck = async (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

export const readyCheck = async (_req: Request, res: Response) => {
  const checks = {
    database: false,
    // redis: false,
  };

  try {
    // Check database
    await db.query('SELECT 1');
    checks.database = true;
  } catch (error) {
    // Log error
  }

  const isReady = Object.values(checks).every(Boolean);
  
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not_ready',
    checks,
    timestamp: new Date().toISOString(),
  });
};

// modules/health/health.routes.ts
import { Router } from 'express';
import { healthCheck, readyCheck } from './health.controller';

const router = Router();

router.get('/health', healthCheck);
router.get('/ready', readyCheck);

export const healthRoutes = router;
```

### Error Handling

```typescript
// common/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

// common/middleware/errorHandler.ts
import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    logger.warn('Operational error', {
      code: err.code,
      message: err.message,
      path: req.path,
    });

    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof ValidationError && { errors: err.errors }),
      },
    });
  }

  // Unexpected error
  logger.error('Unexpected error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};
```

### Logger

```typescript
// common/utils/logger.ts
import { config } from '../../config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = levels[config.LOG_LEVEL as LogLevel] ?? levels.info;

const log = (level: LogLevel, message: string, context?: LogContext) => {
  if (levels[level] < currentLevel) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  console.log(JSON.stringify(entry));
};

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};
```

## Python FastAPI Service Template

### Directory Structure

```
my-service/
├── src/
│   └── app/
│       ├── api/
│       │   ├── v1/
│       │   │   ├── endpoints/
│       │   │   │   ├── __init__.py
│       │   │   │   └── health.py
│       │   │   └── __init__.py
│       │   └── deps.py
│       ├── core/
│       │   ├── __init__.py
│       │   ├── config.py
│       │   └── logging.py
│       ├── db/
│       │   ├── __init__.py
│       │   └── session.py
│       ├── models/
│       ├── schemas/
│       ├── services/
│       ├── __init__.py
│       └── main.py
├── tests/
├── alembic/
├── alembic.ini
├── pyproject.toml
├── Dockerfile
└── README.md
```

### main.py

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check (outside versioned API)
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "version": settings.VERSION,
    }


@app.get("/ready")
async def ready_check():
    # Check dependencies
    checks = {"database": False}
    
    try:
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
            checks["database"] = True
    except Exception:
        pass
    
    is_ready = all(checks.values())
    
    return {
        "status": "ready" if is_ready else "not_ready",
        "checks": checks,
    }


# API routes
app.include_router(api_router, prefix=settings.API_V1_STR)
```

### config.py

```python
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "My Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
```

## Go Service Template

### Directory Structure

```
my-service/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   │   └── config.go
│   ├── handlers/
│   │   ├── handlers.go
│   │   └── health.go
│   ├── middleware/
│   │   ├── logging.go
│   │   └── recovery.go
│   ├── services/
│   └── models/
├── pkg/
├── migrations/
├── go.mod
├── go.sum
├── Makefile
├── Dockerfile
└── README.md
```

### main.go

```go
package main

import (
    "context"
    "log/slog"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/go-chi/chi/v5"
    chimiddleware "github.com/go-chi/chi/v5/middleware"
    
    "myservice/internal/config"
    "myservice/internal/handlers"
    "myservice/internal/middleware"
)

func main() {
    // Load config
    cfg, err := config.Load()
    if err != nil {
        slog.Error("Failed to load config", "error", err)
        os.Exit(1)
    }

    // Setup logger
    logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
        Level: cfg.LogLevel,
    }))
    slog.SetDefault(logger)

    // Create router
    r := chi.NewRouter()

    // Middleware
    r.Use(chimiddleware.RequestID)
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)

    // Health routes
    r.Get("/health", handlers.Health)
    r.Get("/ready", handlers.Ready)

    // API routes
    r.Route("/api/v1", func(r chi.Router) {
        // Add routes here
    })

    // Create server
    srv := &http.Server{
        Addr:         ":" + cfg.Port,
        Handler:      r,
        ReadTimeout:  15 * time.Second,
        WriteTimeout: 15 * time.Second,
        IdleTimeout:  60 * time.Second,
    }

    // Start server
    go func() {
        slog.Info("Server starting", "port", cfg.Port)
        if err := srv.ListenAndServe(); err != http.ErrServerClosed {
            slog.Error("Server error", "error", err)
            os.Exit(1)
        }
    }()

    // Graceful shutdown
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    slog.Info("Shutting down server...")

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        slog.Error("Server forced to shutdown", "error", err)
    }

    slog.Info("Server exited")
}
```

### health.go

```go
package handlers

import (
    "encoding/json"
    "net/http"
    "time"
)

type HealthResponse struct {
    Status    string `json:"status"`
    Timestamp string `json:"timestamp"`
}

type ReadyResponse struct {
    Status string         `json:"status"`
    Checks map[string]bool `json:"checks"`
}

func Health(w http.ResponseWriter, r *http.Request) {
    resp := HealthResponse{
        Status:    "ok",
        Timestamp: time.Now().UTC().Format(time.RFC3339),
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(resp)
}

func Ready(w http.ResponseWriter, r *http.Request) {
    checks := map[string]bool{
        "database": false,
    }

    // Check database
    // if err := db.Ping(); err == nil {
    //     checks["database"] = true
    // }

    isReady := true
    for _, v := range checks {
        if !v {
            isReady = false
            break
        }
    }

    status := "ready"
    statusCode := http.StatusOK
    if !isReady {
        status = "not_ready"
        statusCode = http.StatusServiceUnavailable
    }

    resp := ReadyResponse{
        Status: status,
        Checks: checks,
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(statusCode)
    json.NewEncoder(w).Encode(resp)
}
```

## Kubernetes Manifests

### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-service
  labels:
    app: my-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-service
  template:
    metadata:
      labels:
        app: my-service
    spec:
      containers:
        - name: my-service
          image: my-service:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: my-service-secrets
                  key: database-url
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: my-service
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```
