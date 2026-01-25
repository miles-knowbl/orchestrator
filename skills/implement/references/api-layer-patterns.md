# API Layer Patterns

Patterns for implementing routes, controllers, and middleware.

## Route Organization

### Route File Structure

```typescript
// routes/index.ts
import { Router } from 'express';
import { userRoutes } from './users';
import { productRoutes } from './products';
import { orderRoutes } from './orders';

const router = Router();

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

export const apiRoutes = router;

// app.ts
app.use('/api/v1', apiRoutes);
```

### Module Routes

```typescript
// routes/orders.ts
import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { authorize } from '../middleware/authorize';
import { 
  createOrderSchema, 
  updateOrderStatusSchema 
} from '../validation/orderValidation';

const router = Router();
const controller = new OrderController();

// All order routes require authentication
router.use(authenticate);

// Create order
router.post(
  '/',
  validate(createOrderSchema),
  controller.create
);

// List user's orders
router.get('/', controller.list);

// Get single order
router.get('/:id', controller.getById);

// Update order status (admin only)
router.patch(
  '/:id/status',
  authorize('admin'),
  validate(updateOrderStatusSchema),
  controller.updateStatus
);

// Cancel order
router.post('/:id/cancel', controller.cancel);

export const orderRoutes = router;
```

## Controller Patterns

### Basic Controller

```typescript
// controllers/OrderController.ts
import type { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/OrderService';
import { container } from '../container';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = container.resolve(OrderService);
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.createOrder({
        userId: req.user!.id,
        items: req.body.items,
        shippingAddressId: req.body.shippingAddressId,
      });

      res.status(201).json({
        data: this.formatOrder(order),
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, status } = req.query;
      
      const result = await this.orderService.listForUser(req.user!.id, {
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        status: status as string | undefined,
      });

      res.json({
        data: result.data.map(this.formatOrder),
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.getOrder(
        req.params.id,
        req.user!
      );

      res.json({
        data: this.formatOrder(order),
      });
    } catch (error) {
      next(error);
    }
  };

  private formatOrder(order: Order): OrderResponse {
    return {
      id: order.id,
      status: order.status,
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        priceCents: item.priceCents,
      })),
      subtotalCents: order.subtotalCents,
      taxCents: order.taxCents,
      totalCents: order.totalCents,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
```

### Controller with Dependency Injection

```typescript
// controllers/ProductController.ts
export class ProductController {
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
  ) {}

  // Methods use injected services
}

// Factory function for DI
export function createProductController(container: Container): ProductController {
  return new ProductController(
    container.resolve(ProductService),
    container.resolve(CategoryService),
  );
}
```

## Middleware Patterns

### Authentication Middleware

```typescript
// middleware/authenticate.ts
import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { UserService } from '../services/UserService';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header',
      },
    });
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    
    // Optionally fetch full user
    const user = await userService.getById(payload.userId);
    
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found',
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    });
  }
}
```

### Authorization Middleware

```typescript
// middleware/authorize.ts
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const hasRole = allowedRoles.some(role => 
      req.user!.roles.includes(role)
    );

    if (!hasRole) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    }

    next();
  };
}

// Usage
router.delete('/:id', authorize('admin'), controller.delete);
```

### Validation Middleware

```typescript
// middleware/validate.ts
import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }
      next(error);
    }
  };
}
```

### Request Logging Middleware

```typescript
// middleware/requestLogger.ts
import { randomUUID } from 'crypto';
import { logger } from '../lib/logger';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Generate request ID
  const requestId = randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);

  const startTime = Date.now();

  // Log request
  logger.info('Request started', {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
}
```

### Rate Limiting Middleware

```typescript
// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../lib/redis';

export const apiRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later',
    },
  },
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id ?? req.ip;
  },
});

// Stricter limit for sensitive endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many attempts, please try again later',
    },
  },
});
```

## Request/Response Patterns

### Standard Response Format

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Response helpers
export function success<T>(res: Response, data: T, status = 200) {
  res.status(status).json({ data });
}

export function paginated<T>(
  res: Response,
  data: T[],
  meta: { page: number; limit: number; total: number }
) {
  res.json({
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  });
}

export function created<T>(res: Response, data: T) {
  res.status(201).json({ data });
}

export function noContent(res: Response) {
  res.status(204).send();
}
```

### Query Parameter Parsing

```typescript
// utils/queryParser.ts
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string, 10) || 20));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export function parseSort(
  query: Record<string, unknown>,
  allowedFields: string[],
  defaultField = 'createdAt'
): SortParams {
  let field = (query.sortBy as string) || defaultField;
  let order: 'asc' | 'desc' = (query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

  if (!allowedFields.includes(field)) {
    field = defaultField;
  }

  return { field, order };
}

// Usage in controller
const pagination = parsePagination(req.query);
const sort = parseSort(req.query, ['name', 'price', 'createdAt']);

const result = await productService.list({
  ...pagination,
  sortBy: sort.field,
  sortOrder: sort.order,
});
```

### File Upload Handling

```typescript
// middleware/upload.ts
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

export const uploadSingle = upload.single('file');

// Controller
async uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { code: 'NO_FILE', message: 'No file uploaded' },
      });
    }

    const key = `images/${randomUUID()}-${req.file.originalname}`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: config.s3Bucket,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    res.json({
      data: {
        url: `https://${config.s3Bucket}.s3.amazonaws.com/${key}`,
      },
    });
  } catch (error) {
    next(error);
  }
}
```

## Error Handling

### Global Error Handler

```typescript
// middleware/errorHandler.ts
import type { ErrorRequestHandler } from 'express';
import { AppError } from '../common/errors';
import { logger } from '../lib/logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // Log error
  const requestId = req.headers['x-request-id'];
  
  if (err instanceof AppError && err.isOperational) {
    // Operational error - expected
    logger.warn('Operational error', {
      requestId,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
    });

    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // Programming error - unexpected
  logger.error('Unexpected error', {
    requestId,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
};
```

### 404 Handler

```typescript
// middleware/notFound.ts
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

// app.ts
app.use('/api/v1', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
```

## API Versioning

### URL Versioning

```typescript
// routes/v1/index.ts
import { Router } from 'express';
import { userRoutes } from './users';
import { productRoutes } from './products';

const v1Router = Router();
v1Router.use('/users', userRoutes);
v1Router.use('/products', productRoutes);

export { v1Router };

// routes/v2/index.ts
const v2Router = Router();
// V2 routes with breaking changes

// app.ts
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);
```

### Header Versioning

```typescript
// middleware/apiVersion.ts
export function apiVersion(req: Request, res: Response, next: NextFunction) {
  const version = req.headers['api-version'] || req.query.version || '1';
  req.apiVersion = version as string;
  next();
}

// In controller
if (req.apiVersion === '2') {
  // V2 response format
} else {
  // V1 response format
}
```
