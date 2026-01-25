# Architecture Documentation

Templates and patterns for documenting system architecture.

## Architecture Documentation Types

| Document | Purpose | Audience | Updates |
|----------|---------|----------|---------|
| **Overview** | High-level system view | All stakeholders | Major changes |
| **Component Docs** | Individual component details | Developers | Component changes |
| **ADRs** | Decision records | Future team | When decisions made |
| **Data Model** | Database schema | Developers, DBAs | Schema changes |
| **Integration Docs** | External system integration | Integrators | Integration changes |

## Architecture Overview Template

```markdown
# Architecture Overview

## Executive Summary

[2-3 sentences describing the system's purpose and architecture style]

Example: "OrderFlow is a microservices-based order management system handling 10M orders/month. It uses event-driven architecture for scalability and CQRS for optimized read/write operations."

## System Context

[Diagram showing system boundaries and external actors]

```
                         ┌─────────────┐
                         │   Mobile    │
                         │    App      │
                         └──────┬──────┘
                                │
      ┌──────────────┐          │          ┌──────────────┐
      │   Partners   │          ▼          │   Admins     │
      │    (API)     │────▶┌─────────┐◀────│   (Web)      │
      └──────────────┘     │         │     └──────────────┘
                           │ OrderFlow│
      ┌──────────────┐     │ System   │     ┌──────────────┐
      │   Payment    │◀────│         │────▶│   Shipping   │
      │   Gateway    │     └─────────┘     │   Provider   │
      └──────────────┘          │          └──────────────┘
                                │
                                ▼
                         ┌─────────────┐
                         │  Analytics  │
                         │   Platform  │
                         └─────────────┘
```

## High-Level Architecture

[Diagram showing major components]

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer                           │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
    ┌───────────▼───────────┐       ┌─────────────▼───────────┐
    │     API Gateway       │       │     Admin Gateway       │
    │   (Authentication,    │       │   (Internal tools)      │
    │    Rate Limiting)     │       │                         │
    └───────────┬───────────┘       └─────────────┬───────────┘
                │                                 │
    ┌───────────▼─────────────────────────────────▼───────────┐
    │                    Service Mesh                         │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
    │  │  Order   │  │  User    │  │ Inventory│  │ Payment  ││
    │  │ Service  │  │ Service  │  │ Service  │  │ Service  ││
    │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘│
    │       │             │             │             │      │
    │       └─────────────┼─────────────┼─────────────┘      │
    │                     │             │                    │
    │              ┌──────▼─────┐ ┌─────▼──────┐            │
    │              │  Message   │ │   Event    │            │
    │              │   Queue    │ │   Store    │            │
    │              └────────────┘ └────────────┘            │
    └─────────────────────────────────────────────────────────┘
                │                         │
    ┌───────────▼───────────┐ ┌───────────▼───────────┐
    │    PostgreSQL         │ │      Redis            │
    │    (Primary DB)       │ │      (Cache)          │
    └───────────────────────┘ └───────────────────────┘
```

## Components

### Order Service

**Purpose:** Manages order lifecycle from creation to completion.

**Responsibilities:**
- Order creation and validation
- Order status management
- Order history and reporting

**Technology:** Node.js, Express, PostgreSQL

**API:** REST, documented at `/api/orders`

**Dependencies:** User Service, Inventory Service, Payment Service

### User Service

**Purpose:** Manages user accounts and authentication.

[Continue for each component...]

## Data Flow

### Order Creation Flow

```
┌────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐
│ Client │────▶│   API   │────▶│  Order   │────▶│Inventory│
│        │     │ Gateway │     │ Service  │     │ Service │
└────────┘     └─────────┘     └────┬─────┘     └────┬────┘
                                    │                │
                                    │  ┌─────────────┘
                                    │  │
                                    ▼  ▼
                               ┌─────────┐
                               │ Payment │
                               │ Service │
                               └────┬────┘
                                    │
                                    ▼
                               ┌─────────┐
                               │  Event  │──────▶ Email, Analytics
                               │  Queue  │
                               └─────────┘
```

## Technology Stack

| Layer | Technology | Purpose | Rationale |
|-------|------------|---------|-----------|
| Frontend | React | Web UI | Team expertise, ecosystem |
| Mobile | React Native | iOS/Android | Code sharing with web |
| API Gateway | Kong | Routing, auth | Enterprise features |
| Services | Node.js | Business logic | JavaScript ecosystem |
| Database | PostgreSQL | Primary data | ACID, reliability |
| Cache | Redis | Performance | Sub-ms latency |
| Queue | RabbitMQ | Async processing | Reliable delivery |
| Search | Elasticsearch | Full-text search | Scalable search |

## Cross-Cutting Concerns

### Authentication

- JWT-based authentication
- Tokens issued by User Service
- Validated at API Gateway
- 24-hour token expiration

### Logging

- Structured JSON logging
- Centralized in Elasticsearch
- Correlation IDs across services
- 30-day retention

### Monitoring

- Prometheus metrics
- Grafana dashboards
- PagerDuty alerting
- SLOs: 99.9% availability, <500ms p95

## Deployment

- Kubernetes on AWS EKS
- Multi-AZ deployment
- Blue/green deployments
- Automated via GitHub Actions

## Security

- All traffic over HTTPS
- Secrets in AWS Secrets Manager
- Network segmentation via VPC
- Regular security scans

## Related Documentation

- [ADRs](adrs/README.md)
- [API Documentation](api/README.md)
- [Runbooks](runbooks/README.md)
- [Data Model](data-model.md)
```

## Architecture Decision Record (ADR)

```markdown
# ADR-001: Use PostgreSQL for Primary Database

## Status

Accepted

## Date

2024-01-15

## Context

We need to choose a primary database for the OrderFlow system. The database will store:
- User accounts and profiles
- Orders and order history
- Product catalog
- Inventory levels

Requirements:
- ACID transactions for order processing
- Support for complex queries (reporting)
- Horizontal read scaling
- Team has SQL experience

Options considered:
1. PostgreSQL
2. MySQL
3. MongoDB
4. CockroachDB

## Decision

We will use **PostgreSQL** as our primary database.

## Rationale

### Why PostgreSQL

- **ACID compliance**: Critical for financial transactions in order processing
- **Rich query capabilities**: JSON support, CTEs, window functions for reporting
- **Read replicas**: Easy horizontal read scaling for our read-heavy workload
- **Team expertise**: 4 of 5 engineers have PostgreSQL experience
- **Ecosystem**: Excellent tooling (pgAdmin, pg_dump, etc.)
- **Maturity**: Proven at scale, excellent documentation

### Why Not Alternatives

**MySQL:**
- Weaker JSON support
- Less sophisticated query planner
- Similar operational complexity

**MongoDB:**
- Would need additional system for ACID transactions
- Team lacks NoSQL experience
- Harder to enforce data integrity

**CockroachDB:**
- Higher operational complexity
- Cost implications for our scale
- Team unfamiliar with distributed SQL

## Consequences

### Positive

- Strong data integrity for orders and payments
- Rich querying for reports and analytics
- Team can be productive immediately
- Large community for support

### Negative

- Vertical scaling limits (acceptable for 3-5 year horizon)
- Need to manage read replicas ourselves
- Some flexibility lost vs document stores

### Neutral

- Standard PostgreSQL operational knowledge required
- Need connection pooling (PgBouncer) at scale

## Follow-up Actions

- [ ] Set up PostgreSQL 15 on RDS
- [ ] Configure read replicas for reporting
- [ ] Implement connection pooling
- [ ] Document backup/recovery procedures

## References

- [PostgreSQL documentation](https://www.postgresql.org/docs/)
- [Scaling PostgreSQL guide](internal-wiki/scaling-postgres)
- [Database comparison analysis](docs/database-comparison.md)
```

## Component Documentation

```markdown
# Order Service

## Overview

The Order Service manages the complete order lifecycle, from creation through fulfillment.

## Responsibilities

- Create and validate new orders
- Manage order status transitions
- Calculate order totals and taxes
- Coordinate with Inventory and Payment services
- Emit order events for downstream consumers

## API

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /orders | Create new order |
| GET | /orders | List orders |
| GET | /orders/:id | Get order details |
| PATCH | /orders/:id/cancel | Cancel order |

See [API documentation](../api/orders.md) for details.

### Events Published

| Event | Description |
|-------|-------------|
| order.created | New order created |
| order.paid | Payment confirmed |
| order.shipped | Order shipped |
| order.delivered | Order delivered |
| order.cancelled | Order cancelled |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Order Service                        │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │   HTTP API   │───▶│   Service    │───▶│Repository │ │
│  │  (Express)   │    │    Layer     │    │  (Kysely) │ │
│  └──────────────┘    └──────┬───────┘    └─────┬─────┘ │
│                             │                  │       │
│                      ┌──────▼───────┐    ┌─────▼─────┐ │
│                      │   Event      │    │PostgreSQL │ │
│                      │   Publisher  │    │           │ │
│                      └──────────────┘    └───────────┘ │
└─────────────────────────────────────────────────────────┘
           │
           ▼
    ┌─────────────┐
    │  RabbitMQ   │
    └─────────────┘
```

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | PostgreSQL connection string |
| RABBITMQ_URL | Yes | - | RabbitMQ connection string |
| PORT | No | 3000 | HTTP server port |
| LOG_LEVEL | No | info | Logging level |

## Dependencies

### Internal

- **User Service**: Validate user exists
- **Inventory Service**: Check/reserve inventory
- **Payment Service**: Process payments

### External

- **PostgreSQL**: Primary data store
- **RabbitMQ**: Event publishing

## Data Model

```
┌──────────────────┐       ┌──────────────────┐
│     orders       │       │   order_items    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ user_id (FK)     │◀──────│ order_id (FK)    │
│ status           │       │ product_id       │
│ total_cents      │       │ quantity         │
│ created_at       │       │ price_cents      │
│ updated_at       │       │ created_at       │
└──────────────────┘       └──────────────────┘
```

## Runbooks

- [Order stuck in pending](../runbooks/order-stuck-pending.md)
- [High order failure rate](../runbooks/order-failure-rate.md)

## SLOs

| Metric | Target | Current |
|--------|--------|---------|
| Availability | 99.9% | 99.95% |
| Create order p50 | <100ms | 45ms |
| Create order p99 | <500ms | 320ms |
| Error rate | <0.1% | 0.05% |
```

## Integration Documentation

```markdown
# Payment Gateway Integration

## Overview

Integration with Stripe for payment processing.

## Authentication

All requests require API key authentication:

```bash
Authorization: Bearer sk_live_xxxxx
```

Store the API key in AWS Secrets Manager under `payment/stripe/api_key`.

## Endpoints Used

### Create Payment Intent

```http
POST https://api.stripe.com/v1/payment_intents
```

Request:
```json
{
  "amount": 2000,
  "currency": "usd",
  "payment_method": "pm_xxxxx",
  "confirm": true
}
```

Response:
```json
{
  "id": "pi_xxxxx",
  "status": "succeeded",
  "amount": 2000
}
```

### Refund Payment

```http
POST https://api.stripe.com/v1/refunds
```

Request:
```json
{
  "payment_intent": "pi_xxxxx",
  "amount": 1000
}
```

## Webhook Events

We subscribe to these webhook events:

| Event | Handler | Description |
|-------|---------|-------------|
| payment_intent.succeeded | handlePaymentSuccess | Mark order as paid |
| payment_intent.failed | handlePaymentFailed | Mark order as failed |
| charge.refunded | handleRefund | Update refund status |

Webhook endpoint: `POST /webhooks/stripe`

Webhook secret: AWS Secrets Manager `payment/stripe/webhook_secret`

## Error Handling

| Stripe Error | Our Action | User Message |
|--------------|------------|--------------|
| card_declined | Retry once, then fail | "Payment declined" |
| insufficient_funds | Fail immediately | "Insufficient funds" |
| rate_limit | Retry with backoff | "Please try again" |
| api_error | Alert on-call, retry | "Payment processing error" |

## Testing

Use Stripe test mode with `sk_test_xxxxx`.

Test card numbers:
- Success: 4242424242424242
- Decline: 4000000000000002
- Insufficient funds: 4000000000009995

## Monitoring

Dashboard: [Grafana - Payment Metrics](https://grafana.../payments)

Alerts:
- Payment success rate < 95%
- Payment latency p99 > 5s
- Stripe API errors > 10/min
```
