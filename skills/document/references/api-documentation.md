# API Documentation

Patterns and templates for documenting APIs.

## API Documentation Principles

1. **Complete**: Document every public endpoint
2. **Accurate**: Keep in sync with actual behavior
3. **Exemplified**: Include request/response examples
4. **Testable**: Examples should be copy-paste runnable

## Endpoint Documentation Template

```markdown
## Endpoint Name

Brief description of what this endpoint does.

### Request

```http
METHOD /path/:param
Content-Type: application/json
Authorization: Bearer <token>
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `param` | string | Description of parameter |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `limit` | integer | No | 20 | Items per page (max 100) |
| `sort` | string | No | "created_at" | Sort field |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | User's name (1-100 chars) |
| `email` | string | Yes | Valid email address |
| `role` | string | No | User role (default: "user") |

#### Example

```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "role": "admin"
}
```

### Response

#### Success (200 OK)

```json
{
  "data": {
    "id": "usr_abc123",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "role": "admin",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid request body |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |

#### Error Example

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```
```

## Full API Reference Example

```markdown
# API Reference

Base URL: `https://api.example.com/v1`

## Authentication

All endpoints require authentication via Bearer token unless marked as public.

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/v1/users
```

### Obtaining a Token

```http
POST /auth/token
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

Response:
```json
{
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 3600
  }
}
```

## Rate Limiting

- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated requests

Rate limit headers:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp (Unix)

## Pagination

List endpoints return paginated results:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Query parameters:
- `page` (default: 1) - Page number
- `limit` (default: 20, max: 100) - Items per page

## Errors

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
| VALIDATION_ERROR | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Users

### List Users

Returns a paginated list of users.

```http
GET /users
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `role` | string | Filter by role |
| `search` | string | Search by name/email |

**Response:**

```json
{
  "data": [
    {
      "id": "usr_abc123",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "role": "admin",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### Get User

Returns a single user by ID.

```http
GET /users/:id
```

**Response:**

```json
{
  "data": {
    "id": "usr_abc123",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "role": "admin",
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLoginAt": "2024-01-20T08:15:00Z"
  }
}
```

### Create User

Creates a new user.

```http
POST /users
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | User's name |
| `email` | string | Yes | Email address |
| `password` | string | Yes | Password (min 8 chars) |
| `role` | string | No | Role (default: "user") |

**Example:**

```json
{
  "name": "Bob Jones",
  "email": "bob@example.com",
  "password": "securepassword123",
  "role": "user"
}
```

**Response (201 Created):**

```json
{
  "data": {
    "id": "usr_def456",
    "name": "Bob Jones",
    "email": "bob@example.com",
    "role": "user",
    "createdAt": "2024-01-21T14:00:00Z"
  }
}
```

### Update User

Updates an existing user.

```http
PATCH /users/:id
Content-Type: application/json
```

**Request Body:** (all fields optional)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | User's name |
| `email` | string | Email address |
| `role` | string | User role |

**Example:**

```json
{
  "name": "Robert Jones"
}
```

**Response (200 OK):**

```json
{
  "data": {
    "id": "usr_def456",
    "name": "Robert Jones",
    "email": "bob@example.com",
    "role": "user",
    "createdAt": "2024-01-21T14:00:00Z",
    "updatedAt": "2024-01-22T09:30:00Z"
  }
}
```

### Delete User

Deletes a user.

```http
DELETE /users/:id
```

**Response (204 No Content)**

No response body.

---

## Products

[Continue with other resources...]
```

## OpenAPI/Swagger Documentation

```yaml
# openapi.yaml
openapi: 3.0.3
info:
  title: Example API
  description: API for managing users and resources
  version: 1.0.0
  contact:
    email: api@example.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging

security:
  - bearerAuth: []

paths:
  /users:
    get:
      summary: List users
      description: Returns a paginated list of users
      operationId: listUsers
      tags:
        - Users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
        - name: role
          in: query
          schema:
            type: string
            enum: [user, admin]
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  meta:
                    $ref: '#/components/schemas/PaginationMeta'
        '401':
          $ref: '#/components/responses/Unauthorized'

    post:
      summary: Create user
      description: Creates a new user
      operationId: createUser
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/ValidationError'
        '409':
          $ref: '#/components/responses/Conflict'

  /users/{id}:
    get:
      summary: Get user
      operationId: getUser
      tags:
        - Users
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/User'
        '404':
          $ref: '#/components/responses/NotFound'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          example: usr_abc123
        name:
          type: string
          example: Alice Smith
        email:
          type: string
          format: email
          example: alice@example.com
        role:
          type: string
          enum: [user, admin]
          example: user
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CreateUserRequest:
      type: object
      required:
        - name
        - email
        - password
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
        role:
          type: string
          enum: [user, admin]
          default: user

    PaginationMeta:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer

    Error:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object

  responses:
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: UNAUTHORIZED
              message: Authentication required

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: NOT_FOUND
              message: Resource not found

    ValidationError:
      description: Validation error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: VALIDATION_ERROR
              message: Invalid request data
              details:
                - field: email
                  message: Invalid email format

    Conflict:
      description: Resource conflict
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: CONFLICT
              message: Email already exists
```

## SDK/Client Documentation

```markdown
# JavaScript SDK

## Installation

```bash
npm install example-sdk
```

## Quick Start

```javascript
import { Client } from 'example-sdk';

const client = new Client({
  apiKey: 'your-api-key',
});

// List users
const users = await client.users.list();

// Create user
const user = await client.users.create({
  name: 'Alice',
  email: 'alice@example.com',
});
```

## Configuration

```javascript
const client = new Client({
  apiKey: 'your-api-key',      // Required
  baseUrl: 'https://...',       // Optional, for self-hosted
  timeout: 10000,               // Optional, default 5000ms
  retries: 3,                   // Optional, default 2
});
```

## Users

### List Users

```javascript
const users = await client.users.list({
  page: 1,
  limit: 20,
  role: 'admin',
});

// users.data - array of users
// users.meta - pagination info
```

### Get User

```javascript
const user = await client.users.get('usr_abc123');
```

### Create User

```javascript
const user = await client.users.create({
  name: 'Alice Smith',
  email: 'alice@example.com',
  password: 'securepassword',
});
```

### Update User

```javascript
const user = await client.users.update('usr_abc123', {
  name: 'New Name',
});
```

### Delete User

```javascript
await client.users.delete('usr_abc123');
```

## Error Handling

```javascript
import { APIError, ValidationError, NotFoundError } from 'example-sdk';

try {
  await client.users.get('invalid-id');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('User not found');
  } else if (error instanceof ValidationError) {
    console.log('Validation errors:', error.details);
  } else if (error instanceof APIError) {
    console.log('API error:', error.code, error.message);
  }
}
```

## TypeScript

Full TypeScript support included:

```typescript
import { Client, User, CreateUserInput } from 'example-sdk';

const client = new Client({ apiKey: 'key' });

const input: CreateUserInput = {
  name: 'Alice',
  email: 'alice@example.com',
};

const user: User = await client.users.create(input);
```
```
