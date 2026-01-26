# Current State Mapping

How to document existing architecture accurately.

## Why Current State Matters

You cannot assess what you don't understand. Current state mapping ensures:
- You're reviewing what exists, not what was planned
- All stakeholders share the same understanding
- Gaps between documentation and reality are visible
- Changes can be planned from an accurate baseline

## Information Gathering

### Source Priority

Prioritize sources by reliability:

| Priority | Source | Reliability | Notes |
|----------|--------|-------------|-------|
| 1 | Running code | High | Ground truth |
| 2 | Infrastructure config | High | Actual deployment |
| 3 | Monitoring/metrics | High | Actual behavior |
| 4 | Recent git history | High | Recent changes |
| 5 | Interviews (operators) | Medium | Current knowledge |
| 6 | Interviews (developers) | Medium | May be outdated |
| 7 | Documentation | Low | Often stale |
| 8 | Old diagrams | Low | May not reflect reality |

### What to Gather

```markdown
## Information Checklist

### Code & Configuration
- [ ] Repository structure
- [ ] Dependency manifests (package.json, requirements.txt, etc.)
- [ ] Configuration files
- [ ] Infrastructure-as-code (Terraform, CloudFormation, etc.)
- [ ] Docker/container configurations
- [ ] CI/CD pipeline definitions

### Runtime Information
- [ ] Deployed services list
- [ ] Service endpoints and ports
- [ ] Database schemas
- [ ] Message queues/topics
- [ ] Scheduled jobs/crons
- [ ] Feature flags

### Operational Data
- [ ] Monitoring dashboards
- [ ] Alert definitions
- [ ] Recent incidents (last 6 months)
- [ ] Performance metrics
- [ ] Error rates and types
- [ ] Traffic patterns

### Documentation (verify accuracy)
- [ ] Architecture diagrams
- [ ] API documentation
- [ ] Runbooks
- [ ] ADRs (Architecture Decision Records)
```

## Mapping Techniques

### 1. Dependency Analysis

Extract actual dependencies from code:

```bash
# Node.js - list production dependencies
cat package.json | jq '.dependencies'

# Python - list installed packages
pip freeze

# Find internal imports
grep -r "import.*from" src/ | grep -v node_modules

# Find external API calls
grep -r "fetch\|axios\|http" src/ | grep -v node_modules
```

### 2. Infrastructure Discovery

```bash
# Kubernetes - list all resources
kubectl get all --all-namespaces

# Docker - list running containers
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"

# AWS - list EC2 instances
aws ec2 describe-instances --query 'Reservations[].Instances[].[InstanceId,Tags[?Key==`Name`].Value|[0],State.Name]'
```

### 3. Database Schema Extraction

```sql
-- PostgreSQL - list tables and columns
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- List foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY';
```

### 4. Traffic Analysis

```bash
# Analyze access logs for endpoint usage
cat access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head -20

# Find service-to-service calls from logs
grep "calling service" app.log | awk '{print $NF}' | sort | uniq -c
```

## Documenting Current State

### System Context Diagram

```markdown
## System Context

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         [SYSTEM NAME]                                   │
│                                                                         │
│     ┌──────────┐                              ┌──────────────┐          │
│     │ Customer │───── Web/Mobile ─────────────│              │          │
│     │          │                              │              │          │
│     └──────────┘                              │   [System]   │          │
│                                               │              │          │
│     ┌──────────┐                              │              │          │
│     │  Admin   │───── Internal Tools ─────────│              │          │
│     │          │                              │              │          │
│     └──────────┘                              └──────┬───────┘          │
│                                                      │                  │
│                    ┌─────────────────────────────────┼──────────────┐   │
│                    │                                 │              │   │
│                    ▼                                 ▼              ▼   │
│             ┌──────────┐                      ┌──────────┐   ┌────────┐ │
│             │ Payment  │                      │ Email    │   │Analytics│
│             │ Gateway  │                      │ Service  │   │         │
│             │[External]│                      │[External]│   │[External│
│             └──────────┘                      └──────────┘   └────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
```

### Component Inventory

```markdown
## Component Inventory

| Component | Type | Technology | Version | Owner | Status | Notes |
|-----------|------|------------|---------|-------|--------|-------|
| api-gateway | Service | Kong | 2.8 | Platform | 🟢 Healthy | Single instance |
| order-service | Service | Node.js | 18 | Orders Team | 🟡 Degraded | High memory |
| payment-service | Service | Python | 3.11 | Payments Team | 🟢 Healthy | |
| orders-db | Database | PostgreSQL | 14 | DBA | 🟢 Healthy | No replica |
| cache | Cache | Redis | 7 | Platform | 🟢 Healthy | |
| queue | Queue | SQS | - | Platform | 🟢 Healthy | |
```

### Data Flow Diagram

```markdown
## Data Flow: Order Creation

```
┌────────┐    1. Submit Order    ┌─────────────┐
│ Client │──────────────────────▶│ API Gateway │
└────────┘                       └──────┬──────┘
                                        │
                    2. Route to service │
                                        ▼
                                 ┌─────────────┐
                                 │   Order     │
                                 │   Service   │
                                 └──────┬──────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              │                         │                         │
              ▼                         ▼                         ▼
       3. Reserve         4. Create order              5. Queue payment
       inventory               record                      request
              │                         │                         │
       ┌──────┴──────┐           ┌──────┴──────┐           ┌──────┴──────┐
       │  Inventory  │           │  Orders DB  │           │   Payment   │
       │   Service   │           │             │           │    Queue    │
       └─────────────┘           └─────────────┘           └─────────────┘
```
```

### Technology Stack Matrix

```markdown
## Technology Stack

### Application Layer
| Layer | Technology | Version | Purpose | Alternatives Considered |
|-------|------------|---------|---------|------------------------|
| Frontend | React | 18.2 | Web UI | - |
| Mobile | React Native | 0.72 | iOS/Android | - |
| API | Node.js/Express | 18/4.18 | REST API | - |
| Background Jobs | Bull | 4.10 | Job queue | - |

### Data Layer
| Store | Technology | Version | Purpose | Size | Growth |
|-------|------------|---------|---------|------|--------|
| Primary DB | PostgreSQL | 14 | Orders, Users | 50GB | 2GB/month |
| Cache | Redis | 7 | Session, hot data | 2GB | Stable |
| Search | Elasticsearch | 8 | Product search | 10GB | 500MB/month |
| Files | S3 | - | User uploads | 200GB | 10GB/month |

### Infrastructure
| Component | Technology | Configuration | Notes |
|-----------|------------|---------------|-------|
| Compute | EKS | 3 nodes, m5.large | Auto-scaling |
| Load Balancer | ALB | - | SSL termination |
| CDN | CloudFront | - | Static assets |
| DNS | Route53 | - | - |
| Monitoring | Datadog | - | APM enabled |
```

### Integration Map

```markdown
## External Integrations

| System | Direction | Protocol | Auth | Criticality | SLA | Notes |
|--------|-----------|----------|------|-------------|-----|-------|
| Stripe | Outbound | REST | API Key | Critical | 99.99% | Payment processing |
| SendGrid | Outbound | REST | API Key | High | 99.9% | Email delivery |
| Twilio | Outbound | REST | API Key | Medium | 99.95% | SMS notifications |
| Salesforce | Bidirectional | REST | OAuth | Medium | 99.9% | CRM sync |
| Legacy ERP | Inbound | SOAP | Basic | High | 99% | Inventory updates |

### Integration Diagram

```
                              ┌─────────────┐
                    ┌────────▶│   Stripe    │
                    │         └─────────────┘
┌─────────────┐     │         ┌─────────────┐
│             │─────┼────────▶│  SendGrid   │
│   [System]  │     │         └─────────────┘
│             │─────┼────────▶┌─────────────┐
└─────────────┘     │         │   Twilio    │
       ▲            │         └─────────────┘
       │            │         ┌─────────────┐
       │            └────────▶│ Salesforce  │◀───┐
       │                      └─────────────┘    │
       │                                         │
       │         ┌─────────────┐                 │
       └─────────│ Legacy ERP  │─────────────────┘
                 └─────────────┘
```
```

## Verifying Documentation

### Documentation vs Reality Checklist

```markdown
## Documentation Accuracy Check

| Document | Last Updated | Verified | Accuracy | Notes |
|----------|--------------|----------|----------|-------|
| Architecture diagram | 2023-06 | ✅ | 70% | Missing new services |
| API docs | Auto-gen | ✅ | 95% | Minor gaps |
| Database schema | 2024-01 | ✅ | 85% | New tables undocumented |
| Runbooks | 2022-11 | ✅ | 40% | Severely outdated |
| ADRs | 2023-09 | ✅ | 90% | Recent decisions missing |

### Discrepancies Found
1. Auth service not in diagram (added 6 months ago)
2. Database has 5 tables not in schema docs
3. Runbook references deprecated monitoring tool
```

## Output Template

```markdown
# Current State: [System Name]

**Mapped by:** [Name]
**Date:** [Date]
**Sources:** [Code review, interviews, monitoring, etc.]

## Executive Summary
[One paragraph overview of current state]

## System Context
[Context diagram showing users and external systems]

## Component Architecture
[Container/component diagram]

## Component Inventory
[Table of all components with metadata]

## Technology Stack
[Detailed technology choices by layer]

## Data Architecture
[Data stores, schemas, data flows]

## Integration Points
[External system integrations]

## Deployment Architecture
[How it's deployed and where]

## Operational State
[Current health, known issues, recent incidents]

## Documentation Gaps
[What's missing or inaccurate]

## Appendix
[Detailed schemas, configurations, etc.]
```
