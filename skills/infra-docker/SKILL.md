---
name: infra-docker
description: "Create Docker configuration with multi-stage builds, docker-compose for local development, and container optimization."
phase: IMPLEMENT
category: engineering
version: "1.0.0"
depends_on: ["scaffold"]
tags: [infrastructure, docker, containerization, deployment, images]
---

# Infra Docker

Create Docker configuration for containerized deployment and local development.

## When to Use

- **Containerizing an application** — Creating Dockerfile for deployment
- **Local development** — Setting up docker-compose for multi-service dev
- **CI/CD integration** — Building images for automated pipelines
- When you say: "dockerize", "create Dockerfile", "container setup"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `Dockerfile` | Project root | Always |
| `docker-compose.yml` | Project root | When multiple services |
| `.dockerignore` | Project root | Always |

## Core Concept

Docker setup answers: **"How do we package this application for consistent, reproducible deployment?"**

```
Source Code → Multi-stage Build → Optimized Image → Container Registry → Deployment
```

## Multi-Stage Dockerfile (Node.js)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Docker Compose (Local Development)

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/app
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./src:/app/src

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## .dockerignore

```
node_modules
dist
.git
.env*
*.md
.vscode
.idea
coverage
```

## Image Optimization

| Technique | Impact | How |
|-----------|--------|-----|
| Alpine base | -80% image size | `node:20-alpine` instead of `node:20` |
| Multi-stage | -60% final size | Separate build and production stages |
| .dockerignore | Faster builds | Exclude non-essential files |
| Layer ordering | Better caching | Copy package.json before source code |
| Non-root user | Security | `USER node` in production stage |

## Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
```

## Checklist

- [ ] Multi-stage build separates build and runtime
- [ ] Alpine base image used
- [ ] .dockerignore excludes node_modules, .git, .env
- [ ] Non-root user in production stage
- [ ] Health check configured
- [ ] docker-compose.yml for local multi-service development

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `scaffold` | Project structure informs Dockerfile paths |
| `distribute` | Docker images published to GHCR via distribute pipeline |
| `deploy` | Containers deployed to production via deploy strategies |
| `infra-devenv` | docker-compose provides local dev environment |

## Key Principles

**Multi-stage builds.** Never ship build tools in production images.

**Alpine base.** Smaller images mean faster deploys and less attack surface.

**Non-root user.** Always run as non-root in production containers.

**Layer caching.** Order Dockerfile commands from least to most frequently changing.
