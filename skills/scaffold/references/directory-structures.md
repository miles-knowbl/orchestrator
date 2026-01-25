# Directory Structures

Common directory layout patterns and when to use them.

## Structure Philosophies

### Feature-Based (Vertical Slices)

Group by feature/domain, not by technical role:

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── orders/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── types.ts
│   └── products/
└── shared/
    ├── components/
    ├── hooks/
    └── utils/
```

**When to use:**
- Medium to large applications
- Multiple features with clear boundaries
- Teams working on different features
- Easy to find everything related to a feature

### Layer-Based (Horizontal)

Group by technical role:

```
src/
├── components/
├── hooks/
├── services/
├── utils/
├── types/
└── pages/
```

**When to use:**
- Small applications
- Strong code reuse across features
- Single developer or small team

### Hybrid

Features for domain code, layers for shared:

```
src/
├── features/          # Feature-based
│   ├── auth/
│   └── orders/
├── components/        # Shared components
├── hooks/             # Shared hooks
├── lib/               # Utilities
└── types/             # Global types
```

**When to use:**
- Most medium-sized applications
- Balance between organization and simplicity

## Frontend Structures

### React SPA

```
src/
├── components/              # Shared UI components
│   ├── ui/                  # Basic UI (Button, Input, etc.)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx  # If using Storybook
│   │   │   └── index.ts
│   │   └── index.ts         # Re-exports all UI
│   └── layouts/             # Layout components
│       └── MainLayout.tsx
├── features/                # Feature modules
│   └── [feature]/
│       ├── components/      # Feature-specific components
│       ├── hooks/           # Feature-specific hooks
│       ├── api.ts           # API calls
│       ├── types.ts         # Types
│       ├── utils.ts         # Utilities
│       └── index.ts         # Public exports
├── hooks/                   # Shared hooks
│   ├── useAuth.ts
│   ├── useLocalStorage.ts
│   └── index.ts
├── lib/                     # Utilities, helpers
│   ├── api.ts               # API client setup
│   ├── storage.ts           # Storage utilities
│   └── utils.ts             # General utilities
├── types/                   # Global types
│   ├── api.ts
│   └── index.ts
├── routes/                  # Routing
│   ├── ProtectedRoute.tsx
│   └── index.tsx
├── stores/                  # State management (if using)
│   └── authStore.ts
├── styles/                  # Global styles
│   └── globals.css
├── App.tsx
└── main.tsx
```

### Next.js (App Router)

```
src/
├── app/
│   ├── (marketing)/         # Route group - no URL impact
│   │   ├── page.tsx         # / route
│   │   └── about/
│   │       └── page.tsx     # /about route
│   ├── (dashboard)/         # Another route group
│   │   ├── layout.tsx       # Dashboard layout
│   │   └── dashboard/
│   │       └── page.tsx     # /dashboard route
│   ├── api/                 # API routes
│   │   └── users/
│   │       └── route.ts     # /api/users
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── error.tsx            # Error boundary
│   ├── loading.tsx          # Loading UI
│   └── not-found.tsx        # 404 page
├── components/
│   ├── ui/
│   └── layouts/
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   └── utils.ts
├── hooks/
└── types/
```

### Vue/Nuxt

```
src/
├── components/
│   ├── ui/
│   │   └── UiButton.vue
│   └── layouts/
├── composables/             # Vue 3 composables (like hooks)
│   └── useAuth.ts
├── pages/                   # File-based routing
│   ├── index.vue
│   └── users/
│       └── [id].vue
├── layouts/
│   └── default.vue
├── stores/                  # Pinia stores
│   └── auth.ts
├── plugins/
├── middleware/
├── utils/
└── types/
```

## Backend Structures

### Modular Monolith

```
src/
├── modules/                 # Feature modules
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   ├── users.routes.ts
│   │   ├── users.validation.ts
│   │   ├── users.types.ts
│   │   ├── users.events.ts      # Domain events
│   │   └── __tests__/
│   └── orders/
│       └── ...
├── common/                  # Shared code
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── requestLogger.ts
│   │   └── validate.ts
│   ├── errors/
│   │   ├── AppError.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── crypto.ts
│   └── types/
│       └── express.d.ts
├── config/
│   ├── index.ts
│   ├── database.ts
│   └── redis.ts
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── client.ts
├── jobs/                    # Background jobs
│   └── emailJob.ts
├── events/                  # Event system
│   ├── eventBus.ts
│   └── handlers/
├── app.ts
└── server.ts
```

### Clean Architecture

```
src/
├── domain/                  # Enterprise business rules
│   ├── entities/
│   │   └── User.ts
│   ├── repositories/        # Interfaces only
│   │   └── IUserRepository.ts
│   └── services/            # Domain services
│       └── PasswordService.ts
├── application/             # Application business rules
│   ├── usecases/
│   │   └── users/
│   │       ├── CreateUser.ts
│   │       └── GetUser.ts
│   ├── dtos/
│   └── interfaces/
│       └── IEmailService.ts
├── infrastructure/          # Frameworks & drivers
│   ├── database/
│   │   ├── repositories/
│   │   │   └── UserRepository.ts
│   │   └── models/
│   ├── services/
│   │   └── EmailService.ts
│   └── web/
│       ├── controllers/
│       ├── middleware/
│       └── routes/
├── config/
└── main.ts
```

### Django

```
src/
├── config/                  # Project configuration
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── production.py
│   │   └── test.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/                    # Django apps
│   ├── users/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   ├── signals.py
│   │   ├── tasks.py         # Celery tasks
│   │   └── tests/
│   │       ├── __init__.py
│   │       ├── test_models.py
│   │       └── test_views.py
│   └── core/                # Shared app
│       ├── __init__.py
│       ├── models.py        # Base models
│       └── utils.py
├── templates/
├── static/
└── manage.py
```

## Full-Stack Monorepo

### Turborepo/Nx Structure

```
my-monorepo/
├── apps/
│   ├── web/                 # Frontend app
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── api/                 # Backend app
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── admin/               # Admin app
├── packages/                # Shared packages
│   ├── ui/                  # Shared components
│   │   ├── src/
│   │   └── package.json
│   ├── config/              # Shared configs
│   │   ├── eslint/
│   │   └── typescript/
│   └── types/               # Shared types
├── package.json
├── turbo.json               # Turborepo config
└── pnpm-workspace.yaml
```

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| React component | PascalCase | `UserProfile.tsx` |
| Hook | camelCase with use- | `useAuth.ts` |
| Utility | camelCase | `formatDate.ts` |
| Type definition | camelCase or PascalCase | `user.types.ts` or `User.ts` |
| Test | same as source + .test | `UserProfile.test.tsx` |
| Constant | SCREAMING_SNAKE | `API_ENDPOINTS.ts` |

### Directories

| Type | Convention | Example |
|------|------------|---------|
| Feature | kebab-case | `user-profile/` |
| Component group | PascalCase or kebab-case | `Button/` or `button/` |
| General directory | kebab-case | `shared-utils/` |

## Co-location Principles

### Keep Related Files Together

```
# Good - related files together
features/
└── checkout/
    ├── CheckoutForm.tsx
    ├── CheckoutForm.test.tsx
    ├── useCheckout.ts
    └── checkout.types.ts

# Avoid - related files scattered
components/
└── CheckoutForm.tsx
hooks/
└── useCheckout.ts
tests/
└── CheckoutForm.test.ts
types/
└── checkout.ts
```

### Index Files for Clean Imports

```typescript
// features/auth/index.ts
export { LoginForm } from './components/LoginForm';
export { useAuth } from './hooks/useAuth';
export type { User, AuthState } from './types';

// Usage
import { LoginForm, useAuth, User } from '@/features/auth';
```

## Anti-patterns

### Too Deep Nesting

```
# Bad - too many levels
src/components/features/dashboard/widgets/charts/line/LineChart.tsx

# Good - flatter structure  
src/features/dashboard/components/LineChart.tsx
```

### Premature Abstraction

```
# Bad - over-structured for small project
src/
├── domain/
├── application/
├── infrastructure/
├── presentation/
└── ... (8 more directories)

# Good - simple structure that can grow
src/
├── components/
├── lib/
└── pages/
```

### Mixed Conventions

```
# Bad - inconsistent naming
src/
├── UserProfile/          # PascalCase
├── order-history/        # kebab-case
├── settings_page/        # snake_case
└── CONSTANTS/            # SCREAMING

# Good - consistent convention
src/
├── user-profile/
├── order-history/
├── settings-page/
└── constants/
```
