# Kanban Skill

> Linear-style visualization of the module ladder to system completion

## Overview

The kanban module provides a visual dashboard for tracking roadmap progress across all 7 layers of the system. It displays module status, dependencies, leverage scores, and critical path information in a human-readable format suitable for both monitoring and delegation.

## Architecture

### Dashboard Component

Located at `apps/dashboard/app/roadmap/page.tsx`, the kanban view:

- Fetches data from `/api/roadmap/progress` and `/api/roadmap/leverage`
- Displays 7 layers (0-6) with collapsible sections
- Shows per-module status with color-coded indicators
- Highlights current module and next available modules with leverage scores
- Supports expand/collapse for layer sections

### Data Flow

```
RoadmapService → API Endpoints → Dashboard Component
     ↑
ROADMAP.md → roadmap-state.json (parsed state)
```

## Features

### Overall Progress Panel

- Aggregate completion percentage
- Counts by status: complete, in-progress, pending, blocked
- Visual progress bar

### Leverage Scoring Panel

- Top 3 highest-leverage next modules
- Score breakdown: DSA, Unlock, Likelihood
- Highlighted recommendation for next action

### Layer Sections

Each layer (0-6) displays:
- Layer number and name
- Progress bar and percentage
- Module count breakdown
- Expandable module cards

### Module Cards

Each module shows:
- Status icon (checkmark, play, circle, X)
- Module name
- Current/Next badges
- Leverage score (for next available)
- Expandable details with description and dependencies

## Status Indicators

| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| complete | CheckCircle | Green | Module finished |
| in-progress | PlayCircle | Yellow | Currently active |
| pending | Circle | Gray | Ready or blocked |
| blocked | XCircle | Red | Dependencies unmet |

## API Dependencies

| Endpoint | Purpose |
|----------|---------|
| `GET /api/roadmap/progress` | Overall and per-layer progress |
| `GET /api/roadmap/leverage` | Leverage scores for available modules |

## Layer Names

| Layer | Name |
|-------|------|
| 0 | Foundation |
| 1 | Core Capabilities |
| 2 | Intelligence |
| 3 | Interface |
| 4 | Domain Loops |
| 5 | Meta & Collaboration |
| 6 | Sovereignty |

## Delegation Ready

The kanban view is designed for worktree-based delegation:

1. View current state and identify next module
2. Check leverage scores for priority
3. Review dependencies before starting
4. Monitor progress from Layer 1 orchestrator

## Integration

- **RoadmapService**: Provides all progress and leverage data
- **OrchestrationService**: Uses roadmap data for work assignment
- **Dashboard**: Navigation includes Roadmap link

## Version

- v1.0.0 - Initial implementation with layer visualization, leverage scoring, and module cards
