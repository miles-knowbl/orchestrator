# Option Exploration

Generating and documenting architectural options systematically.

## Why Explore Options?

The first solution that comes to mind is rarely the best. Exploring multiple options:
- Reveals hidden trade-offs
- Prevents anchoring on familiar patterns
- Ensures you've considered alternatives
- Makes the final decision defensible

**Rule of Three:** Generate at least three options before deciding. If you can only think of one, you haven't explored enough.

## Option Generation Techniques

### 1. Pattern Matching

What architectural patterns fit this problem?

| Problem Type | Candidate Patterns |
|--------------|-------------------|
| Request/response | Layered, MVC, Clean Architecture |
| High throughput | Event-driven, CQRS, streaming |
| Complex domain | Domain-Driven Design, microservices |
| Real-time | WebSockets, Server-Sent Events, polling |
| Batch processing | Queue-based, MapReduce, workflow engines |
| Multi-tenant | Shared database, isolated databases, hybrid |

### 2. Analogy

How have similar systems been built?

```markdown
### Similar Systems Analysis

**Our problem:** Real-time collaboration on documents

**Similar systems:**
- Google Docs → Operational Transformation (OT)
- Figma → CRDTs (Conflict-free Replicated Data Types)
- Notion → Hybrid OT/CRDT

**Insights:**
- OT is complex but well-understood
- CRDTs are simpler but newer
- Hybrid approaches are emerging
```

### 3. Decomposition

Break the problem into smaller decisions:

```markdown
### Decision Decomposition

**Big decision:** How to build real-time collaboration

**Sub-decisions:**
1. Conflict resolution strategy (OT vs CRDT vs locking)
2. Transport mechanism (WebSockets vs SSE vs polling)
3. Persistence strategy (event sourcing vs snapshots)
4. Sync topology (client-server vs peer-to-peer)

Each sub-decision can have its own options.
```

### 4. Extremes

What if we optimized for one thing completely?

| Extreme | What It Looks Like |
|---------|-------------------|
| **Simplest** | Single server, SQLite, no caching |
| **Cheapest** | Serverless, pay-per-use, minimal infrastructure |
| **Most scalable** | Microservices, sharding, global distribution |
| **Most flexible** | Plugin architecture, configuration over code |
| **Fastest to build** | Off-the-shelf SaaS, minimal customization |

### 5. Constraint Removal

What would we do if we didn't have constraint X?

```markdown
### Constraint Removal Analysis

**Current constraints:**
- Must use existing PostgreSQL database
- Team only knows Python
- $5,000/month budget

**If we removed the database constraint:**
→ Could use DynamoDB for infinite scale
→ Could use MongoDB for flexible schema

**Insight:** PostgreSQL can actually handle our scale. 
The constraint isn't limiting us here.

**If we removed the language constraint:**
→ Could use Go for better performance
→ Could use Elixir for better concurrency

**Insight:** Python's performance is sufficient, but 
we should consider async Python for concurrency.
```

## Option Documentation Template

For each option, document:

```markdown
### Option [Letter]: [Name]

**Summary:**
[One paragraph description of the approach]

**How It Works:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Architecture Diagram:**
```
[ASCII diagram showing components and flow]
```

**Key Technologies:**
| Component | Technology | Rationale |
|-----------|------------|-----------|
| [Component] | [Tech] | [Why this tech] |

**Pros:**
- ✅ [Advantage 1]
- ✅ [Advantage 2]
- ✅ [Advantage 3]

**Cons:**
- ❌ [Disadvantage 1]
- ❌ [Disadvantage 2]

**Fits Architectural Drivers:**
| Driver | Fit | Notes |
|--------|-----|-------|
| Performance | ✅ Good | [Why] |
| Scalability | ⚠️ Partial | [Limitation] |
| Simplicity | ❌ Poor | [Why] |

**Effort Estimate:**
- Initial build: [T-shirt size]
- Ongoing maintenance: [Low/Medium/High]

**Risks:**
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | [H/M/L] | [H/M/L] | [How to mitigate] |

**Open Questions:**
- [Question 1]
- [Question 2]
```

## Example: Options for a Notification System

### Option A: Direct Push

**Summary:**
Send notifications directly to users via WebSocket connections. Server maintains connection pool and pushes messages in real-time.

**How It Works:**
1. Event occurs in system
2. Server looks up connected users
3. Server pushes message via WebSocket
4. Client displays notification

**Architecture Diagram:**
```
┌─────────┐    event    ┌─────────────┐   WebSocket   ┌────────┐
│ Service │────────────▶│Notification │◀─────────────▶│ Client │
└─────────┘             │   Server    │               └────────┘
                        └─────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │  Postgres   │
                        │(connections)│
                        └─────────────┘
```

**Pros:**
- ✅ Simple architecture
- ✅ True real-time (no polling)
- ✅ Low latency

**Cons:**
- ❌ Requires persistent connections
- ❌ Scaling is complex (sticky sessions)
- ❌ Mobile battery impact

**Fits Drivers:**
| Driver | Fit | Notes |
|--------|-----|-------|
| Real-time | ✅ Good | Sub-second delivery |
| Scalability | ⚠️ Partial | Needs Redis pub/sub at scale |
| Battery | ❌ Poor | Always-on connection |

---

### Option B: Queue + Push Service

**Summary:**
Use message queue for reliable delivery, integrate with push notification services (FCM, APNs) for mobile delivery.

**How It Works:**
1. Event occurs in system
2. Message published to queue
3. Worker processes queue
4. Worker sends via FCM/APNs for mobile, WebSocket for web

**Architecture Diagram:**
```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌──────┐
│ Service │───▶│  Queue  │───▶│ Worker  │───▶│ FCM  │
└─────────┘    └─────────┘    └─────────┘    └──────┘
                                   │          
                                   ▼          
                              ┌─────────┐    ┌────────┐
                              │WebSocket│───▶│ Client │
                              │ Server  │    └────────┘
                              └─────────┘
```

**Pros:**
- ✅ Reliable delivery (queue persistence)
- ✅ Works on mobile (native push)
- ✅ Scales horizontally

**Cons:**
- ❌ More complex architecture
- ❌ Higher latency (queue processing)
- ❌ Dependency on external services

**Fits Drivers:**
| Driver | Fit | Notes |
|--------|-----|-------|
| Real-time | ⚠️ Partial | ~1-3s latency typical |
| Reliability | ✅ Good | Queue ensures delivery |
| Mobile | ✅ Good | Native push support |

---

### Option C: Polling + SSE Hybrid

**Summary:**
Use Server-Sent Events for connected clients, periodic polling as fallback, store notifications in database.

**How It Works:**
1. Event occurs, notification stored in database
2. SSE channel notifies connected clients
3. Disconnected clients poll on reconnect
4. Mobile apps poll in background

**Architecture Diagram:**
```
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Service │───▶│Postgres │◀───│   API   │◀─── polling ───┐
└─────────┘    └─────────┘    └─────────┘                 │
                    │              │                      │
                    │              ▼                      │
                    │         ┌─────────┐           ┌────────┐
                    └────────▶│   SSE   │──────────▶│ Client │
                              │ Server  │           └────────┘
                              └─────────┘
```

**Pros:**
- ✅ Simple, uses existing infrastructure
- ✅ Graceful degradation (polling fallback)
- ✅ Notifications persist in database

**Cons:**
- ❌ Not true real-time (polling delay)
- ❌ Database load from polling
- ❌ SSE is one-way only

**Fits Drivers:**
| Driver | Fit | Notes |
|--------|-----|-------|
| Simplicity | ✅ Good | Minimal new infrastructure |
| Real-time | ⚠️ Partial | Good for web, polling for mobile |
| Reliability | ✅ Good | Database-backed |

## Narrowing Down

After generating options, narrow down:

### Quick Elimination

Some options can be eliminated quickly:

```markdown
### Eliminated Options

**Option D: Third-party notification SaaS**
❌ Eliminated: Doesn't meet data residency requirements (P0 driver)

**Option E: Peer-to-peer WebRTC**
❌ Eliminated: Team has no WebRTC experience, timeline too tight
```

### Head-to-Head Comparison

For remaining options, compare directly:

```markdown
### Comparison: Option A vs Option B vs Option C

| Criterion | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| Latency | <100ms ✅ | 1-3s ⚠️ | 5-30s ❌ |
| Reliability | Medium ⚠️ | High ✅ | High ✅ |
| Complexity | Low ✅ | High ❌ | Medium ⚠️ |
| Mobile support | Poor ❌ | Good ✅ | Medium ⚠️ |
| Build time | 2 weeks ✅ | 4 weeks ❌ | 3 weeks ⚠️ |
```

## Option Exploration Checklist

```markdown
- [ ] Generated at least 3 viable options
- [ ] Used multiple generation techniques
- [ ] Each option is genuinely different (not minor variations)
- [ ] Documented pros/cons for each
- [ ] Evaluated against architectural drivers
- [ ] Estimated effort for each
- [ ] Identified risks for each
- [ ] Eliminated clearly unfit options with rationale
- [ ] Remaining options ready for trade-off analysis
```
