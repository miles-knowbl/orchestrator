# System Decomposition

How to break a dream state into implementable systems.

## Why Decompose?

A dream state is often too large to build in one pass. Decomposition:
- Creates manageable chunks of work
- Enables parallel development
- Reduces risk (ship incrementally)
- Clarifies dependencies
- Allows different teams/agents to work simultaneously

## Decomposition Principles

### 1. Single Responsibility
Each system should do one thing well.

```
❌ BAD: "ServicePlatform" - does scheduling, billing, reporting, and notifications
✅ GOOD: "Scheduling Service", "Billing Service", "Analytics Service", "Notification Service"
```

### 2. Deployable Independently
Each system should be deployable without deploying others.

```
❌ BAD: System A can't run without System B being updated simultaneously
✅ GOOD: System A has versioned API contract with System B
```

### 3. Owned by One Team
Each system should have clear ownership.

```
❌ BAD: Three teams all modify the same system
✅ GOOD: One team owns each system, others consume via API
```

### 4. Right-Sized
Not too big (becomes monolith), not too small (coordination overhead).

```
❌ BAD: Single function as a system (nano-service)
❌ BAD: 100 features in one system (monolith)
✅ GOOD: Cohesive set of related capabilities
```

## Finding System Boundaries

### Method 1: Domain-Driven Design

Identify bounded contexts from the domain:

```
Domain: Field Service Management
├── Work Order Context → Work Order Service
├── Scheduling Context → Scheduling Service
├── Routing Context → Route Optimization Service
├── Inventory Context → Parts/Inventory Service
├── Customer Context → Customer Portal
└── Reporting Context → Analytics Service
```

### Method 2: User Journey Mapping

Follow user journeys and identify natural handoffs:

```
Technician Journey:
1. Login              → Auth Service
2. View assignments   → Work Order Service
3. Get directions     → Route Service
4. Complete work      → Work Order Service
5. Get signature      → Work Order Service
6. Check inventory    → Inventory Service
7. Submit report      → Work Order Service
```

### Method 3: Data Ownership

Group by who owns the data:

```
User data        → Auth/User Service
Work order data  → Work Order Service
Route data       → Route Service
Inventory data   → Inventory Service
Analytics data   → Analytics Service
```

### Method 4: Rate of Change

Group things that change together:

```
Frequently changing:
- UI components → Frontend App
- Business rules → Core Service

Rarely changing:
- Auth mechanisms → Auth Service
- Notification templates → Notification Service
```

### Method 5: Scaling Requirements

Separate by scaling needs:

```
High throughput, low latency:
- Real-time location → Location Service

Compute intensive:
- Route optimization → Route Service

Storage intensive:
- Photo/document storage → Media Service

Event-driven:
- Notifications → Notification Service
```

## Dependency Analysis

### Mapping Dependencies

Create a dependency matrix:

| System | Depends On | Depended On By |
|--------|------------|----------------|
| Auth | - | All others |
| Work Order | Auth | Route, Inventory, Analytics |
| Route | Auth, Work Order | Mobile App |
| Inventory | Auth, Work Order | Mobile App |
| Analytics | Auth, Work Order | Dashboard |
| Mobile App | Auth, Work Order, Route, Inventory | - |

### Dependency Graph

```
                ┌─────────────┐
                │    Auth     │
                └──────┬──────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
 ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
 │ Work Order  │ │  Inventory  │ │  Analytics  │
 └──────┬──────┘ └──────┬──────┘ └─────────────┘
        │              │
        └──────┬───────┘
               ▼
        ┌─────────────┐
        │    Route    │
        └──────┬──────┘
               │
               ▼
        ┌─────────────┐
        │ Mobile App  │
        └─────────────┘
```

### Build Order

Topologically sort by dependencies:

1. **Level 0** (no dependencies): Auth
2. **Level 1** (depends on Level 0): Work Order, Inventory, Analytics
3. **Level 2** (depends on Level 1): Route
4. **Level 3** (depends on Level 2): Mobile App

Systems at the same level can be built in parallel.

## System Definition Template

For each identified system:

```markdown
## System: [Name]

### Identity
- **ID**: sys-[number]
- **Name**: [Human-readable name]
- **Owner**: [Team/Person responsible]

### Purpose
[One sentence describing what this system does]

### Capabilities
This system will:
- [Capability 1]
- [Capability 2]
- [Capability 3]

### Boundaries
**In Scope:**
- [What's included]

**Out of Scope:**
- [What's explicitly excluded]

### Interfaces

**Inputs:**
| Source | Data | Format | Frequency |
|--------|------|--------|-----------|
| [System/User] | [What] | [JSON/Event/etc] | [Rate] |

**Outputs:**
| Destination | Data | Format | Frequency |
|-------------|------|--------|-----------|
| [System/User] | [What] | [JSON/Event/etc] | [Rate] |

### Dependencies
| System | Type | Required For |
|--------|------|--------------|
| [Name] | Hard/Soft | [What capability] |

### Data Ownership
| Entity | CRUD | Notes |
|--------|------|-------|
| [Entity] | CRUD | This system is source of truth |
| [Entity] | R | Read from [other system] |

### Technical Requirements
- Performance: [SLA]
- Availability: [Uptime target]
- Security: [Requirements]

### Priority
- **Build Order**: [1-N]
- **Business Priority**: P[1-5]
- **Complexity**: S/M/L/XL

### Estimated Effort
- **Duration**: [time estimate]
- **Team Size**: [people needed]
```

## Common Decomposition Patterns

### Pattern 1: Core + Extensions

```
┌─────────────────────────────────────────────────┐
│                   Core Service                   │
│  (Essential functionality, build first)         │
└─────────────────────────────────────────────────┘
         │           │           │
         ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │ Ext 1   │ │ Ext 2   │ │ Ext 3   │
    │(Reports)│ │(Notify) │ │(Import) │
    └─────────┘ └─────────┘ └─────────┘
```

### Pattern 2: Frontend + Backend + Workers

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│   Workers   │
│   (Web)     │     │   (API)     │     │  (Async)    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Database   │
                    └─────────────┘
```

### Pattern 3: Gateway + Microservices

```
┌─────────────────────────────────────────────────┐
│                  API Gateway                     │
└─────────────────────────────────────────────────┘
         │           │           │
         ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │Service A│ │Service B│ │Service C│
    └─────────┘ └─────────┘ └─────────┘
```

### Pattern 4: Event-Driven

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Producer   │────▶│ Event Bus   │────▶│  Consumer   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Consumer   │
                    └─────────────┘
```

## Decomposition Anti-Patterns

### Too Fine-Grained
```
❌ Every database table is a service
❌ Every API endpoint is a service
❌ Functions-as-services for everything
```

**Problem:** Coordination overhead exceeds benefits.

### Too Coarse-Grained
```
❌ Everything in one service
❌ Multiple unrelated features together
❌ Different scaling needs combined
```

**Problem:** Back to monolith problems.

### Distributed Monolith
```
❌ Services that must deploy together
❌ Shared database between services
❌ Synchronous calls everywhere
```

**Problem:** Worst of both worlds.

## Checklist

Before finalizing decomposition:

- [ ] Each system has single clear purpose
- [ ] Each system can deploy independently
- [ ] Dependencies form a DAG (no cycles)
- [ ] Build order is clear
- [ ] No shared databases between systems
- [ ] APIs are the only communication
- [ ] Each system is right-sized
- [ ] Ownership is clear for each system
