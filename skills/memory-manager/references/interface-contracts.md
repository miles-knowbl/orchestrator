# Interface Contracts

Documenting APIs and events between systems.

## Why Interface Contracts?

When multiple systems need to communicate:
- Contracts define the agreement between producer and consumer
- Changes can be coordinated before implementation
- Documentation serves as single source of truth
- Contracts can be validated automatically

## Contract Types

| Type | Format | Use Case |
|------|--------|----------|
| REST API | OpenAPI 3.0 | Synchronous HTTP APIs |
| GraphQL | SDL | Flexible query APIs |
| Events | AsyncAPI | Async message passing |
| gRPC | Protocol Buffers | High-performance RPC |

## Directory Structure

```
interfaces/
├── api/                    # REST/HTTP APIs
│   ├── auth-service.yaml
│   ├── order-service.yaml
│   └── user-service.yaml
├── events/                 # Async events
│   ├── order-events.yaml
│   └── notification-events.yaml
└── shared/                 # Shared schemas
    ├── common-types.yaml
    └── error-responses.yaml
```

## REST API Contracts (OpenAPI)

### Basic Template

```yaml
openapi: 3.0.3
info:
  title: [Service Name] API
  version: 1.0.0
  description: |
    [Description of what this API does]
  contact:
    name: [Team Name]
    email: team@example.com

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging

tags:
  - name: [Resource]
    description: Operations on [Resource]

paths:
  /resource:
    get:
      summary: List resources
      tags: [Resource]
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResourceList'
        '401':
          $ref: '#/components/responses/Unauthorized'

    post:
      summary: Create resource
      tags: [Resource]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateResourceRequest'
      responses:
        '201':
          description: Resource created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Resource'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /resource/{id}:
    get:
      summary: Get resource by ID
      tags: [Resource]
      parameters:
        - $ref: '#/components/parameters/ResourceId'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Resource'
        '404':
          $ref: '#/components/responses/NotFound'

components:
  schemas:
    Resource:
      type: object
      required:
        - id
        - name
        - createdAt
      properties:
        id:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"
        name:
          type: string
          example: "Example Resource"
        description:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CreateResourceRequest:
      type: object
      required:
        - name
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 255
        description:
          type: string
          maxLength: 1000

    ResourceList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Resource'
        pagination:
          $ref: '#/components/schemas/Pagination'

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        hasMore:
          type: boolean

    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: object

  parameters:
    ResourceId:
      name: id
      in: path
      required: true
      schema:
        type: string
        format: uuid
      description: Resource ID

    PageParam:
      name: page
      in: query
      schema:
        type: integer
        minimum: 1
        default: 1
      description: Page number

    LimitParam:
      name: limit
      in: query
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20
      description: Items per page

  responses:
    BadRequest:
      description: Invalid request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "VALIDATION_ERROR"
            message: "Invalid request parameters"

    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "UNAUTHORIZED"
            message: "Authentication required"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "NOT_FOUND"
            message: "Resource not found"

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

### Example: Order Service API

```yaml
openapi: 3.0.3
info:
  title: Order Service API
  version: 1.0.0
  description: Work order management for field service operations

servers:
  - url: https://api.servicegrid.example.com/v1

paths:
  /orders:
    get:
      summary: List work orders
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, assigned, in_progress, completed, cancelled]
        - name: assignedTo
          in: query
          schema:
            type: string
            format: uuid
        - name: from
          in: query
          schema:
            type: string
            format: date
        - name: to
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: List of orders
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/WorkOrder'

    post:
      summary: Create work order
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateWorkOrderRequest'
      responses:
        '201':
          description: Order created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WorkOrder'

  /orders/{id}/assign:
    post:
      summary: Assign order to technician
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [technicianId]
              properties:
                technicianId:
                  type: string
                  format: uuid
                scheduledFor:
                  type: string
                  format: date-time
      responses:
        '200':
          description: Order assigned

  /orders/{id}/complete:
    post:
      summary: Mark order as complete
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CompleteOrderRequest'
      responses:
        '200':
          description: Order completed

components:
  schemas:
    WorkOrder:
      type: object
      properties:
        id:
          type: string
          format: uuid
        orderNumber:
          type: string
          example: "WO-2024-001234"
        status:
          type: string
          enum: [pending, assigned, in_progress, completed, cancelled]
        priority:
          type: string
          enum: [low, normal, high, urgent]
        customerId:
          type: string
          format: uuid
        assignedTo:
          type: string
          format: uuid
          nullable: true
        location:
          $ref: '#/components/schemas/Location'
        description:
          type: string
        scheduledFor:
          type: string
          format: date-time
          nullable: true
        completedAt:
          type: string
          format: date-time
          nullable: true
        createdAt:
          type: string
          format: date-time

    CreateWorkOrderRequest:
      type: object
      required:
        - customerId
        - location
        - description
      properties:
        customerId:
          type: string
          format: uuid
        location:
          $ref: '#/components/schemas/Location'
        description:
          type: string
        priority:
          type: string
          enum: [low, normal, high, urgent]
          default: normal
        scheduledFor:
          type: string
          format: date-time

    CompleteOrderRequest:
      type: object
      required:
        - signature
        - notes
      properties:
        signature:
          type: string
          description: Base64 encoded signature image
        notes:
          type: string
        photos:
          type: array
          items:
            type: string
            description: Base64 encoded photo

    Location:
      type: object
      required:
        - address
      properties:
        address:
          type: string
        city:
          type: string
        state:
          type: string
        zip:
          type: string
        latitude:
          type: number
        longitude:
          type: number
```

## Event Contracts (AsyncAPI)

### Basic Template

```yaml
asyncapi: 2.6.0
info:
  title: [Service] Events
  version: 1.0.0
  description: Events published by [Service]

servers:
  production:
    url: kafka.example.com:9092
    protocol: kafka

channels:
  domain/event-name:
    description: Description of this event channel
    publish:
      operationId: publishEventName
      message:
        $ref: '#/components/messages/EventName'

components:
  messages:
    EventName:
      name: EventName
      title: Event Name
      summary: What this event represents
      contentType: application/json
      payload:
        $ref: '#/components/schemas/EventNamePayload'

  schemas:
    EventNamePayload:
      type: object
      required:
        - eventId
        - timestamp
        - data
      properties:
        eventId:
          type: string
          format: uuid
        timestamp:
          type: string
          format: date-time
        data:
          type: object
          properties:
            # Event-specific fields
```

### Example: Order Events

```yaml
asyncapi: 2.6.0
info:
  title: Order Service Events
  version: 1.0.0
  description: Events published by the Order Service

servers:
  production:
    url: kafka.servicegrid.example.com:9092
    protocol: kafka

channels:
  orders/created:
    description: Published when a new work order is created
    publish:
      operationId: publishOrderCreated
      message:
        $ref: '#/components/messages/OrderCreated'

  orders/assigned:
    description: Published when an order is assigned to a technician
    publish:
      operationId: publishOrderAssigned
      message:
        $ref: '#/components/messages/OrderAssigned'

  orders/status-changed:
    description: Published when order status changes
    publish:
      operationId: publishOrderStatusChanged
      message:
        $ref: '#/components/messages/OrderStatusChanged'

  orders/completed:
    description: Published when an order is completed
    publish:
      operationId: publishOrderCompleted
      message:
        $ref: '#/components/messages/OrderCompleted'

components:
  messages:
    OrderCreated:
      name: OrderCreated
      title: Order Created Event
      contentType: application/json
      payload:
        type: object
        required: [eventId, timestamp, orderId, customerId]
        properties:
          eventId:
            type: string
            format: uuid
          timestamp:
            type: string
            format: date-time
          orderId:
            type: string
            format: uuid
          orderNumber:
            type: string
          customerId:
            type: string
            format: uuid
          priority:
            type: string
            enum: [low, normal, high, urgent]

    OrderAssigned:
      name: OrderAssigned
      title: Order Assigned Event
      contentType: application/json
      payload:
        type: object
        required: [eventId, timestamp, orderId, technicianId]
        properties:
          eventId:
            type: string
            format: uuid
          timestamp:
            type: string
            format: date-time
          orderId:
            type: string
            format: uuid
          technicianId:
            type: string
            format: uuid
          scheduledFor:
            type: string
            format: date-time

    OrderStatusChanged:
      name: OrderStatusChanged
      title: Order Status Changed Event
      contentType: application/json
      payload:
        type: object
        required: [eventId, timestamp, orderId, previousStatus, newStatus]
        properties:
          eventId:
            type: string
            format: uuid
          timestamp:
            type: string
            format: date-time
          orderId:
            type: string
            format: uuid
          previousStatus:
            type: string
            enum: [pending, assigned, in_progress, completed, cancelled]
          newStatus:
            type: string
            enum: [pending, assigned, in_progress, completed, cancelled]
          changedBy:
            type: string
            format: uuid

    OrderCompleted:
      name: OrderCompleted
      title: Order Completed Event
      contentType: application/json
      payload:
        type: object
        required: [eventId, timestamp, orderId, completedAt]
        properties:
          eventId:
            type: string
            format: uuid
          timestamp:
            type: string
            format: date-time
          orderId:
            type: string
            format: uuid
          completedAt:
            type: string
            format: date-time
          completedBy:
            type: string
            format: uuid
          hasSignature:
            type: boolean
          photoCount:
            type: integer
```

## Contract Governance

### Versioning

| Change Type | Version Impact | Example |
|-------------|----------------|---------|
| Additive (new field, optional) | Patch/Minor | 1.0.0 → 1.0.1 |
| Behavioral (new validation) | Minor | 1.0.0 → 1.1.0 |
| Breaking (remove field, change type) | Major | 1.0.0 → 2.0.0 |

### Change Process

1. **Propose** — Update contract in branch
2. **Review** — Affected teams review
3. **Coordinate** — Agree on rollout plan
4. **Implement** — Producer implements, then consumers
5. **Deprecate** — Old version with notice period

### Breaking Change Checklist

- [ ] All consumers identified
- [ ] Migration path documented
- [ ] Deprecation notice sent
- [ ] Support both versions during transition
- [ ] Sunset date communicated
