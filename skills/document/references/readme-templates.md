# README Templates

Templates for different project types and contexts.

## README Principles

1. **Answer the first question first**: What is this?
2. **Get users running quickly**: Quick start in <2 minutes
3. **Don't bury the lede**: Important info at the top
4. **Link, don't duplicate**: Point to detailed docs
5. **Keep it current**: Update with major changes

## Standard README Template

```markdown
# Project Name

[![Build Status](https://img.shields.io/github/actions/workflow/status/org/repo/ci.yml)](https://github.com/org/repo/actions)
[![npm version](https://img.shields.io/npm/v/package-name)](https://www.npmjs.com/package/package-name)
[![License](https://img.shields.io/github/license/org/repo)](LICENSE)

One-line description of what this project does and why it matters.

## Features

- ✅ Feature one with brief benefit
- ✅ Feature two with brief benefit
- ✅ Feature three with brief benefit

## Quick Start

```bash
npm install package-name
```

```javascript
import { thing } from 'package-name';

const result = thing.doSomething();
console.log(result);
```

## Installation

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Install

```bash
npm install package-name
```

Or with yarn:

```bash
yarn add package-name
```

## Usage

### Basic Example

```javascript
import { Client } from 'package-name';

const client = new Client({ apiKey: 'your-key' });
const data = await client.getData();
```

### Advanced Usage

See the [Usage Guide](docs/usage.md) for more examples.

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | - | Your API key (required) |
| `timeout` | number | 5000 | Request timeout in ms |
| `retries` | number | 3 | Number of retry attempts |

## API Reference

See [API Documentation](docs/api.md).

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) © [Your Name]
```

## Library/Package README

```markdown
# library-name

A lightweight library for doing X in JavaScript/TypeScript.

## Why This Library?

- 🚀 **Fast**: 10x faster than alternatives
- 📦 **Small**: Only 2KB gzipped
- 🔒 **Type-safe**: Full TypeScript support
- 🧪 **Tested**: 100% test coverage

## Install

```bash
npm install library-name
```

## Quick Start

```typescript
import { parse, format } from 'library-name';

// Parse input
const data = parse('input string');

// Format output
const output = format(data, { pretty: true });
```

## API

### `parse(input: string, options?: ParseOptions): Data`

Parses the input string into a Data object.

**Parameters:**
- `input` - The string to parse
- `options.strict` - Enable strict mode (default: false)

**Returns:** Parsed data object

**Example:**
```typescript
const data = parse('hello world', { strict: true });
```

### `format(data: Data, options?: FormatOptions): string`

Formats data back to a string.

**Parameters:**
- `data` - The data to format
- `options.pretty` - Pretty print output (default: false)

**Returns:** Formatted string

## TypeScript

Full TypeScript definitions are included:

```typescript
import type { Data, ParseOptions, FormatOptions } from 'library-name';
```

## Browser Support

Works in all modern browsers and Node.js 16+.

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

## Benchmarks

```
library-name    x 1,234,567 ops/sec
alternative-1   x   123,456 ops/sec
alternative-2   x    12,345 ops/sec
```

## Related

- [similar-library](https://github.com/...) - Another approach
- [related-tool](https://github.com/...) - Complementary tool

## License

MIT
```

## API/Backend Service README

```markdown
# Service Name API

REST API for managing [resources].

## Overview

This service provides:
- User authentication and authorization
- Resource CRUD operations
- Webhook notifications
- Rate-limited API access

## Quick Start

### Development Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development (auto-detects project type)
./scripts/dev.sh
```

Or manually:

```bash
# Start infrastructure
docker-compose up -d db redis

# Run migrations
npm run db:migrate

# Start server
npm run dev
```

API available at http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Authenticate user |
| GET | /users | List users |
| POST | /users | Create user |
| GET | /users/:id | Get user by ID |
| PUT | /users/:id | Update user |
| DELETE | /users/:id | Delete user |

Full API documentation: http://localhost:3000/api/docs

## Authentication

All API requests require a Bearer token:

```bash
curl -H "Authorization: Bearer <token>" \
  https://api.example.com/users
```

Obtain a token via the `/auth/login` endpoint.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | PostgreSQL connection string |
| JWT_SECRET | Yes | - | Secret for JWT signing |
| PORT | No | 3000 | Server port |
| LOG_LEVEL | No | info | Logging level |

## Development

```bash
# Run tests
npm test

# Run with hot reload
npm run dev

# Check types
npm run type-check

# Lint
npm run lint
```

## Deployment

See [Deployment Guide](docs/deployment.md).

### Docker

```bash
docker build -t service-name .
docker run -p 3000:3000 service-name
```

## Monitoring

- Health check: GET /health
- Metrics: GET /metrics (Prometheus format)
- API docs: GET /api/docs

## License

Proprietary - © Company Name
```

## CLI Tool README

```markdown
# cli-tool

A command-line tool for doing X.

## Installation

### npm (recommended)

```bash
npm install -g cli-tool
```

### Homebrew (macOS)

```bash
brew install cli-tool
```

### Binary

Download from [Releases](https://github.com/org/cli-tool/releases).

## Usage

```bash
cli-tool <command> [options]
```

### Commands

#### `init`

Initialize a new project:

```bash
cli-tool init my-project
cli-tool init my-project --template typescript
```

Options:
- `--template, -t` - Project template (default: "basic")
- `--force, -f` - Overwrite existing files

#### `build`

Build the project:

```bash
cli-tool build
cli-tool build --output dist
cli-tool build --watch
```

Options:
- `--output, -o` - Output directory
- `--watch, -w` - Watch for changes
- `--minify` - Minify output

#### `deploy`

Deploy to production:

```bash
cli-tool deploy
cli-tool deploy --env staging
```

Options:
- `--env, -e` - Target environment
- `--dry-run` - Preview without deploying

### Global Options

- `--help, -h` - Show help
- `--version, -v` - Show version
- `--verbose` - Verbose output
- `--config, -c` - Path to config file

## Configuration

Create `cli-tool.config.js`:

```javascript
module.exports = {
  build: {
    output: 'dist',
    minify: true,
  },
  deploy: {
    provider: 'aws',
    region: 'us-east-1',
  },
};
```

Or use `cli-tool.config.json`:

```json
{
  "build": {
    "output": "dist",
    "minify": true
  }
}
```

## Examples

### Basic workflow

```bash
# Create new project
cli-tool init my-app

# Navigate to project
cd my-app

# Build
cli-tool build

# Deploy
cli-tool deploy
```

### CI/CD integration

```yaml
# .github/workflows/deploy.yml
- name: Build and Deploy
  run: |
    npm install -g cli-tool
    cli-tool build --minify
    cli-tool deploy --env production
```

## Troubleshooting

### Common Issues

**Error: EACCES permission denied**

Fix npm permissions:
```bash
sudo chown -R $(whoami) ~/.npm
```

**Error: Config file not found**

Ensure you're in a project directory or specify config:
```bash
cli-tool build --config /path/to/config.js
```

## License

MIT
```

## Monorepo README

```markdown
# Project Name

Monorepo for the Project Name ecosystem.

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [@project/core](packages/core) | Core library | [![npm](https://img.shields.io/npm/v/@project/core)](https://www.npmjs.com/package/@project/core) |
| [@project/cli](packages/cli) | CLI tool | [![npm](https://img.shields.io/npm/v/@project/cli)](https://www.npmjs.com/package/@project/cli) |
| [@project/react](packages/react) | React bindings | [![npm](https://img.shields.io/npm/v/@project/react)](https://www.npmjs.com/package/@project/react) |

## Apps

| App | Description |
|-----|-------------|
| [web](apps/web) | Main web application |
| [docs](apps/docs) | Documentation site |
| [admin](apps/admin) | Admin dashboard |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Clone repository
git clone https://github.com/org/project.git
cd project

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development
pnpm dev
```

### Working with Packages

```bash
# Run command in specific package
pnpm --filter @project/core build

# Run command in all packages
pnpm -r build

# Add dependency to package
pnpm --filter @project/core add lodash
```

## Development

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all packages and apps |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm clean` | Clean all build outputs |

### Creating a New Package

```bash
pnpm create-package my-package
```

## Architecture

```
project/
├── apps/
│   ├── web/          # Next.js web app
│   ├── docs/         # Documentation site
│   └── admin/        # Admin dashboard
├── packages/
│   ├── core/         # Core library
│   ├── cli/          # CLI tool
│   ├── react/        # React bindings
│   ├── config/       # Shared configs
│   └── tsconfig/     # Shared TypeScript configs
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
```

## Minimal README

For small projects or internal tools:

```markdown
# tool-name

Brief description.

## Install

```bash
npm install
```

## Usage

```bash
npm start
```

## Configuration

Copy `.env.example` to `.env` and configure.

## License

MIT
```
