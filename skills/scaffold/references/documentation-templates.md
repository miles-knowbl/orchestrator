# Documentation Templates

Templates for README files and project documentation.

## README Template (Full)

```markdown
# Project Name

Brief description of what this project does and who it's for.

[![CI](https://github.com/org/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/org/repo/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/org/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/org/repo)

## Features

- Feature 1
- Feature 2
- Feature 3

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ ([download](https://nodejs.org/))
- pnpm 8+ (`npm install -g pnpm`)
- PostgreSQL 14+ ([download](https://www.postgresql.org/))
- Docker (optional, for containerized development)

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/org/repo.git
   cd repo
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. Set up the database:
   ```bash
   pnpm db:migrate
   pnpm db:seed  # Optional: seed with sample data
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

The application will be available at http://localhost:3000.

### Using Docker

Start infrastructure services:

```bash
# For projects with frontend: start infra + backend, run frontend natively
docker-compose up -d db redis backend
cd client && npm run dev

# For backend-only projects: start everything in Docker
docker-compose up --build
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open database GUI |

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── layouts/     # Layout components
├── features/        # Feature modules
│   └── [feature]/   # Feature-specific code
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── types/           # TypeScript type definitions
└── app.tsx          # Application entry point
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret for JWT signing | Yes | - |
| `PORT` | Server port | No | 3000 |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | No | info |

## API Documentation

API documentation is available at `/api/docs` when running the server.

### Authentication

All API requests require authentication via Bearer token:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/users
```

### Example Endpoints

```bash
# Get all users
GET /api/users

# Create a user
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

## Testing

Run the test suite:

```bash
pnpm test
```

Run tests with coverage:

```bash
pnpm test:coverage
```

### Writing Tests

Tests are located next to the files they test:

```
src/
└── features/
    └── users/
        ├── UserList.tsx
        └── UserList.test.tsx
```

## Deployment

### Production Build

```bash
pnpm build
pnpm start
```

### Docker

Build and run the Docker image:

```bash
docker build -t myapp .
docker run -p 3000:3000 myapp
```

### Environment-Specific Configuration

- Development: `.env.development`
- Production: `.env.production`
- Testing: `.env.test`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Library 1](https://example.com) - Description
- [Library 2](https://example.com) - Description
```

## README Template (Minimal)

```markdown
# Project Name

Brief description.

## Quick Start

```bash
# Install
npm install

# Configure
cp .env.example .env

# Run
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - Database connection string
- `API_KEY` - API key for external service

## License

MIT
```

## CONTRIBUTING.md Template

```markdown
# Contributing to Project Name

Thank you for your interest in contributing!

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

1. Search existing issues to avoid duplicates
2. Use the bug report template
3. Include steps to reproduce
4. Include expected vs actual behavior
5. Include environment details

### Suggesting Features

1. Search existing issues/discussions
2. Use the feature request template
3. Explain the use case
4. Describe the proposed solution

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/repo.git

# Add upstream remote
git remote add upstream https://github.com/org/repo.git

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/my-feature
```

## Coding Standards

### Style Guide

- Use Prettier for formatting
- Follow ESLint rules
- Write meaningful commit messages
- Add tests for new features

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
test: add tests for user service
refactor: simplify error handling
```

### Pull Request Guidelines

- Keep PRs focused and small
- Write a clear description
- Reference related issues
- Ensure CI passes
- Request review from maintainers

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- --grep "test name"
```

## Questions?

- Open a [Discussion](https://github.com/org/repo/discussions)
- Join our [Discord](https://discord.gg/...)
```

## CHANGELOG.md Template

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature X

### Changed
- Updated dependency Y

### Fixed
- Bug in component Z

## [1.1.0] - 2024-01-15

### Added
- User authentication system
- API rate limiting
- Dark mode support

### Changed
- Improved error messages
- Updated to Node.js 20

### Fixed
- Login redirect loop
- Memory leak in dashboard

### Security
- Updated dependencies with vulnerabilities

## [1.0.0] - 2024-01-01

### Added
- Initial release
- User management
- Dashboard
- API endpoints

[Unreleased]: https://github.com/org/repo/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/org/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/org/repo/releases/tag/v1.0.0
```

## API Documentation Template

```markdown
# API Documentation

Base URL: `https://api.example.com/v1`

## Authentication

All endpoints require authentication via Bearer token:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Users

#### List Users

```http
GET /users
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20, max: 100) |
| search | string | Search by name or email |

**Response:**

```json
{
  "data": [
    {
      "id": "123",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Create User

```http
POST /users
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword"
}
```

**Response:** `201 Created`

```json
{
  "data": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Invalid or missing authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| INTERNAL_ERROR | 500 | Server error |

## Rate Limiting

- 100 requests per minute per user
- Headers included in response:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp
```

## ADR Template (Architecture Decision Record)

```markdown
# ADR-001: [Title]

## Status

Proposed | Accepted | Deprecated | Superseded

## Date

YYYY-MM-DD

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?

### Positive

- Benefit 1
- Benefit 2

### Negative

- Tradeoff 1
- Tradeoff 2

## Alternatives Considered

### Alternative 1

Description and why it was rejected.

### Alternative 2

Description and why it was rejected.
```
