# Queue Operations

Managing the system queue for domain progression.

## Queue File Location

```
domain-memory/
└── {domain-name}/
    └── system-queue.json
```

## Queue Schema

```typescript
interface SystemQueue {
  // Domain identification
  domain: string;              // e.g., "azure-standard-ops"
  repository: string;          // e.g., "org/azure-standard"
  dreamState: string;          // Brief description of end vision

  // Metadata
  createdAt: string;           // ISO datetime
  updatedAt: string;           // ISO datetime

  // Systems in the queue
  systems: System[];
}

interface System {
  // Identity
  id: string;                  // e.g., "sys-001"
  name: string;                // e.g., "Auth Service"
  description: string;         // One sentence purpose

  // GitHub tracking
  githubIssue: number | null;  // Issue number once created

  // Status
  status: SystemStatus;

  // Dependencies
  dependencies: string[];      // Array of system IDs

  // Priority
  priority: number;            // 1 = highest priority

  // Timestamps
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;

  // Notes
  blockedReason?: string;      // If status is 'blocked'
  notes?: string;              // Additional context
}

type SystemStatus =
  | 'discovered'    // Identified, not yet specified
  | 'specified'     // FeatureSpec complete, issue created
  | 'ready'         // Dependencies met, can start
  | 'in-progress'   // Currently being built
  | 'review'        // In PR review
  | 'complete'      // Merged and deployed
  | 'blocked';      // Cannot proceed
```

## Queue Operations

### Initialize Queue

Create a new queue for a domain:

```json
{
  "domain": "azure-standard-ops",
  "repository": "azure-standard/field-service",
  "dreamState": "Fully integrated field service management platform",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "systems": []
}
```

### Add System

Append a new system to the queue:

```javascript
function addSystem(queue, system) {
  const newSystem = {
    id: `sys-${String(queue.systems.length + 1).padStart(3, '0')}`,
    name: system.name,
    description: system.description,
    githubIssue: null,
    status: 'discovered',
    dependencies: system.dependencies || [],
    priority: system.priority || queue.systems.length + 1,
    createdAt: new Date().toISOString(),
  };

  queue.systems.push(newSystem);
  queue.updatedAt = new Date().toISOString();

  return newSystem;
}
```

### Update System Status

Transition a system to a new status:

```javascript
function updateStatus(queue, systemId, newStatus, metadata = {}) {
  const system = queue.systems.find(s => s.id === systemId);
  if (!system) throw new Error(`System ${systemId} not found`);

  // Validate transition
  const validTransitions = {
    'discovered': ['specified', 'blocked'],
    'specified': ['ready', 'in-progress', 'blocked'],
    'ready': ['in-progress', 'blocked'],
    'in-progress': ['review', 'blocked'],
    'review': ['complete', 'in-progress', 'blocked'],
    'blocked': ['discovered', 'specified', 'ready', 'in-progress'],
    'complete': [], // Terminal state
  };

  if (!validTransitions[system.status].includes(newStatus)) {
    throw new Error(`Invalid transition: ${system.status} -> ${newStatus}`);
  }

  system.status = newStatus;

  // Set timestamps
  if (newStatus === 'in-progress' && !system.startedAt) {
    system.startedAt = new Date().toISOString();
  }
  if (newStatus === 'complete') {
    system.completedAt = new Date().toISOString();
  }
  if (newStatus === 'blocked') {
    system.blockedReason = metadata.reason || 'Reason not specified';
  }

  // Set GitHub issue if provided
  if (metadata.githubIssue) {
    system.githubIssue = metadata.githubIssue;
  }

  queue.updatedAt = new Date().toISOString();

  return system;
}
```

### Get Next Ready System

Find the next system that can be started:

```javascript
function getNextReady(queue) {
  // Get IDs of completed systems
  const completedIds = new Set(
    queue.systems
      .filter(s => s.status === 'complete')
      .map(s => s.id)
  );

  // Find systems that are specified/ready with all dependencies met
  const readySystems = queue.systems.filter(system => {
    // Must be in specified or ready status
    if (!['specified', 'ready'].includes(system.status)) {
      return false;
    }

    // All dependencies must be complete
    const depsComplete = system.dependencies.every(depId =>
      completedIds.has(depId)
    );

    return depsComplete;
  });

  // Sort by priority (lowest number = highest priority)
  readySystems.sort((a, b) => a.priority - b.priority);

  return readySystems[0] || null;
}
```

### Get Queue Summary

Generate a status summary:

```javascript
function getQueueSummary(queue) {
  const statusCounts = {};
  queue.systems.forEach(s => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });

  const total = queue.systems.length;
  const complete = statusCounts.complete || 0;
  const inProgress = statusCounts['in-progress'] || 0;
  const blocked = statusCounts.blocked || 0;

  return {
    domain: queue.domain,
    dreamState: queue.dreamState,
    total,
    complete,
    inProgress,
    blocked,
    remaining: total - complete,
    progress: total > 0 ? Math.round((complete / total) * 100) : 0,
    nextReady: getNextReady(queue),
  };
}
```

### Reorder Priorities

Adjust priorities after changes:

```javascript
function reorderPriorities(queue, newOrder) {
  // newOrder is array of system IDs in desired priority order
  newOrder.forEach((systemId, index) => {
    const system = queue.systems.find(s => s.id === systemId);
    if (system) {
      system.priority = index + 1;
    }
  });

  queue.updatedAt = new Date().toISOString();
}
```

## Status Transitions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STATUS STATE MACHINE                                  │
│                                                                             │
│                    ┌──────────────┐                                         │
│                    │  discovered  │                                         │
│                    └──────┬───────┘                                         │
│                           │ specify                                         │
│                           ▼                                                 │
│                    ┌──────────────┐                                         │
│         ┌─────────│  specified   │─────────┐                                │
│         │         └──────┬───────┘         │                                │
│         │                │ deps met        │ start directly                 │
│         │                ▼                 │ (if deps met)                  │
│         │         ┌──────────────┐         │                                │
│         │         │    ready     │─────────┤                                │
│         │         └──────┬───────┘         │                                │
│         │                │ start           │                                │
│         │                ▼                 │                                │
│         │         ┌──────────────┐◀────────┘                                │
│         │         │ in-progress  │                                          │
│         │         └──────┬───────┘                                          │
│         │                │ submit PR                                        │
│         │                ▼                                                  │
│         │         ┌──────────────┐                                          │
│         │         │    review    │───┐                                      │
│         │         └──────┬───────┘   │ changes requested                    │
│         │                │ approve   │                                      │
│         │                ▼           │                                      │
│         │         ┌──────────────┐   │                                      │
│         │         │   complete   │◀──┘                                      │
│         │         └──────────────┘                                          │
│         │                                                                   │
│         │ blocked        ┌──────────────┐                                   │
│         └───────────────▶│   blocked    │                                   │
│                          └──────────────┘                                   │
│                                 │ unblocked                                 │
│                                 └──────────▶ (return to previous state)     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Example Queue

```json
{
  "domain": "azure-standard-ops",
  "repository": "azure-standard/field-service",
  "dreamState": "Fully integrated field service management platform",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-17T14:30:00Z",
  "systems": [
    {
      "id": "sys-001",
      "name": "Auth Service",
      "description": "Authentication and authorization for all services",
      "githubIssue": 100,
      "status": "complete",
      "dependencies": [],
      "priority": 1,
      "createdAt": "2024-01-15T10:00:00Z",
      "startedAt": "2024-01-15T11:00:00Z",
      "completedAt": "2024-01-16T16:00:00Z"
    },
    {
      "id": "sys-002",
      "name": "Work Order Service",
      "description": "Core work order management and lifecycle",
      "githubIssue": 123,
      "status": "in-progress",
      "dependencies": ["sys-001"],
      "priority": 1,
      "createdAt": "2024-01-15T10:00:00Z",
      "startedAt": "2024-01-17T09:00:00Z"
    },
    {
      "id": "sys-003",
      "name": "Route Optimization",
      "description": "Intelligent route planning and optimization",
      "githubIssue": 124,
      "status": "specified",
      "dependencies": ["sys-002"],
      "priority": 2,
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "sys-004",
      "name": "Mobile App",
      "description": "Technician mobile application",
      "githubIssue": 125,
      "status": "specified",
      "dependencies": ["sys-002", "sys-003"],
      "priority": 3,
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "sys-005",
      "name": "Analytics Dashboard",
      "description": "Operational analytics and reporting",
      "githubIssue": null,
      "status": "discovered",
      "dependencies": ["sys-002"],
      "priority": 4,
      "createdAt": "2024-01-16T14:00:00Z"
    }
  ]
}
```

## CLI Commands (Manual Operations)

```bash
# View queue status
cat domain-memory/azure-standard-ops/system-queue.json | jq '.systems[] | {id, name, status}'

# Find next ready system
cat domain-memory/azure-standard-ops/system-queue.json | jq '
  .systems
  | map(select(.status == "specified" or .status == "ready"))
  | sort_by(.priority)
  | .[0]'

# Count by status
cat domain-memory/azure-standard-ops/system-queue.json | jq '
  .systems
  | group_by(.status)
  | map({status: .[0].status, count: length})'

# Update status (use jq or edit directly)
# After editing, validate JSON: jq . system-queue.json > /dev/null
```

## Queue Visualization

Generate a text-based visualization:

```
Domain: azure-standard-ops
Progress: ████████░░░░░░░░░░░░ 20% (1/5 complete)

Systems:
  ✅ sys-001 Auth Service [P1] #100
  🔄 sys-002 Work Order Service [P1] #123 ← IN PROGRESS
  ⏳ sys-003 Route Optimization [P2] #124 (waiting: sys-002)
  ⏳ sys-004 Mobile App [P3] #125 (waiting: sys-002, sys-003)
  📝 sys-005 Analytics Dashboard [P4] (not specified)

Legend: ✅ complete | 🔄 in-progress | ⏳ ready/specified | 📝 discovered | 🚫 blocked

Next: sys-003 Route Optimization (when sys-002 completes)
```
