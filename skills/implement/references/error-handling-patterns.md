# Error Handling Patterns

Patterns for defining, throwing, catching, and logging errors.

## Error Class Hierarchy

### Base Application Error

```typescript
// common/errors/AppError.ts
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
```

### Specific Error Types

```typescript
// common/errors/index.ts
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super('NOT_FOUND', message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errors?: ValidationDetail[]) {
    super('VALIDATION_ERROR', message, 400, errors);
  }
}

export interface ValidationDetail {
  field: string;
  code: string;
  message: string;
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super('FORBIDDEN', message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super('CONFLICT', message, 409, details);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(
      'RATE_LIMITED',
      'Too many requests, please try again later',
      429,
      { retryAfter }
    );
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string) {
    super(
      'SERVICE_UNAVAILABLE',
      `${service} is temporarily unavailable`,
      503
    );
  }
}
```

### Domain-Specific Errors

```typescript
// modules/orders/errors.ts
export class CartEmptyError extends AppError {
  constructor() {
    super('CART_EMPTY', 'Cannot create order with empty cart', 400);
  }
}

export class OutOfStockError extends AppError {
  constructor(productId: string, available: number, requested: number) {
    super(
      'OUT_OF_STOCK',
      `Insufficient inventory for product ${productId}`,
      400,
      { productId, available, requested }
    );
  }
}

export class PaymentFailedError extends AppError {
  constructor(reason: string, details?: unknown) {
    super('PAYMENT_FAILED', `Payment failed: ${reason}`, 400, details);
  }
}

export class OrderNotCancellableError extends AppError {
  constructor(orderId: string, status: string) {
    super(
      'ORDER_NOT_CANCELLABLE',
      `Order ${orderId} cannot be cancelled in ${status} status`,
      400,
      { orderId, status }
    );
  }
}
```

## Error Handling in Services

### Try-Catch Pattern

```typescript
// services/OrderService.ts
async createOrder(input: CreateOrderInput): Promise<Order> {
  // Validate input (throws ValidationError)
  this.validateInput(input);

  // Check business rules (throws domain errors)
  await this.checkBusinessRules(input);

  try {
    // Attempt operation
    const order = await this.orderRepo.create(input);
    return order;
  } catch (error) {
    // Transform known database errors
    if (error.code === '23505') { // Unique violation
      throw new ConflictError('Order already exists');
    }
    if (error.code === '23503') { // Foreign key violation
      throw new ValidationError('Referenced entity not found');
    }
    
    // Re-throw operational errors
    if (error instanceof AppError) {
      throw error;
    }

    // Wrap unexpected errors
    this.logger.error('Unexpected error in createOrder', { error, input });
    throw new AppError(
      'CREATE_ORDER_FAILED',
      'Failed to create order',
      500,
      undefined,
      false // Mark as non-operational
    );
  }
}
```

### Error Transformation

```typescript
// Transform external service errors
async processPayment(orderId: string, paymentMethod: PaymentMethod): Promise<Payment> {
  try {
    const result = await this.stripeClient.charges.create({
      amount: order.totalCents,
      currency: 'usd',
      source: paymentMethod.token,
    });
    
    return { id: result.id, status: 'succeeded' };
  } catch (error) {
    // Transform Stripe errors to our domain errors
    if (error.type === 'StripeCardError') {
      throw new PaymentFailedError(error.message, {
        code: error.code,
        decline_code: error.decline_code,
      });
    }
    
    if (error.type === 'StripeRateLimitError') {
      throw new ServiceUnavailableError('Payment service');
    }

    // Log and throw generic error
    this.logger.error('Stripe error', { error, orderId });
    throw new AppError(
      'PAYMENT_ERROR',
      'Payment processing failed',
      500
    );
  }
}
```

## Error Handling in API Layer

### Express Error Handler

```typescript
// middleware/errorHandler.ts
import { ErrorRequestHandler } from 'express';
import { AppError, ValidationError } from '../common/errors';
import { logger } from '../lib/logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = req.headers['x-request-id'] as string;

  // Handle known operational errors
  if (err instanceof AppError && err.isOperational) {
    logger.warn('Operational error', {
      requestId,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
    });

    const response: ErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
      },
    };

    // Include validation details if present
    if (err instanceof ValidationError && err.details) {
      response.error.details = err.details;
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const details = err.errors.map((e: ZodIssue) => ({
      field: e.path.join('.'),
      code: e.code,
      message: e.message,
    }));

    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details,
      },
    });
  }

  // Log unexpected errors
  logger.error('Unexpected error', {
    requestId,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

### Async Error Wrapper

```typescript
// middleware/asyncHandler.ts
import { RequestHandler } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage in routes
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req.body);
    res.status(201).json({ data: order });
  })
);
```

## Error Handling in UI

### Global Error Boundary

```typescript
// components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    // reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-500">Something went wrong</h1>
          <p className="mt-2 text-gray-600">
            Please refresh the page or try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// lib/api.ts
import axios, { AxiosError } from 'axios';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
  }
}

const api = axios.create({
  baseURL: '/api/v1',
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error: { code: string; message: string; details?: unknown } }>) => {
    if (error.response?.data?.error) {
      const { code, message, details } = error.response.data.error;
      throw new ApiError(code, message, error.response.status, details);
    }

    // Network error or other
    throw new ApiError(
      'NETWORK_ERROR',
      'Unable to connect to server',
      0
    );
  }
);

export { api };
```

### Component Error Handling

```typescript
// components/OrderForm.tsx
export function OrderForm() {
  const createOrder = useCreateOrder();
  const { addToast } = useToast();

  const handleSubmit = async (data: OrderFormData) => {
    try {
      const order = await createOrder.mutateAsync(data);
      addToast('success', 'Order placed successfully');
      navigate(`/orders/${order.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle specific error codes
        switch (error.code) {
          case 'CART_EMPTY':
            addToast('error', 'Your cart is empty');
            break;
          case 'OUT_OF_STOCK':
            addToast('error', 'Some items are out of stock');
            // Could show which items
            break;
          case 'PAYMENT_FAILED':
            addToast('error', 'Payment failed. Please try again.');
            break;
          case 'VALIDATION_ERROR':
            // Set form errors from API response
            if (error.details) {
              (error.details as ValidationDetail[]).forEach((detail) => {
                form.setError(detail.field, { message: detail.message });
              });
            }
            break;
          default:
            addToast('error', error.message);
        }
      } else {
        addToast('error', 'An unexpected error occurred');
      }
    }
  };
}
```

### React Query Error Handling

```typescript
// hooks/useOrders.ts
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: CreateOrderInput) =>
      api.post<{ data: Order }>('/orders', input).then(r => r.data.data),
    
    onError: (error: ApiError) => {
      // Global error handling
      if (error.statusCode === 401) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }

      if (error.statusCode >= 500) {
        addToast('error', 'Server error. Please try again later.');
        return;
      }

      // Let component handle other errors
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
```

## Logging

### Structured Logger

```typescript
// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL as LogLevel] ?? LOG_LEVELS.info;

function log(level: LogLevel, message: string, context?: LogContext) {
  if (LOG_LEVELS[level] < currentLevel) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
    // Add request context if available
    ...(getRequestContext() && { request: getRequestContext() }),
  };

  // In production, output JSON
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(entry));
  } else {
    // In development, pretty print
    console[level](
      `[${entry.timestamp}] ${level.toUpperCase()}: ${message}`,
      context ?? ''
    );
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};
```

### Error Logging Best Practices

```typescript
// Good: Structured, includes context
logger.error('Failed to create order', {
  userId: input.userId,
  itemCount: input.items.length,
  error: error.message,
  stack: error.stack,
  code: error instanceof AppError ? error.code : 'UNKNOWN',
});

// Bad: Unstructured, no context
console.log('Error:', error);

// Good: Different log levels for different situations
logger.info('Order created', { orderId: order.id, userId: order.userId });
logger.warn('Inventory low', { productId, available, threshold });
logger.error('Payment failed', { orderId, error: error.message });

// Good: Include correlation IDs
logger.info('Processing request', { requestId, path, method });
```

## Error Codes Reference

```typescript
// common/errors/codes.ts
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Business Logic
  CART_EMPTY: 'CART_EMPTY',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ORDER_NOT_CANCELLABLE: 'ORDER_NOT_CANCELLABLE',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',

  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
  TIMEOUT: 'TIMEOUT',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
```
