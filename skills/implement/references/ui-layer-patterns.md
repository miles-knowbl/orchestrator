# UI Layer Patterns

Patterns for implementing React components, state management, and user interactions.

## Component Structure

### Basic Component

```typescript
// components/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <img 
        src={product.imageUrl} 
        alt={product.name}
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="mt-2 font-semibold">{product.name}</h3>
      <p className="text-gray-600">${(product.priceCents / 100).toFixed(2)}</p>
      {onAddToCart && (
        <button
          onClick={() => onAddToCart(product.id)}
          className="mt-2 w-full bg-blue-500 text-white py-2 rounded"
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}
```

### Component with Loading/Error States

```typescript
// components/ProductList.tsx
interface ProductListProps {
  categoryId: string;
}

export function ProductList({ categoryId }: ProductListProps) {
  const { data: products, isLoading, error } = useProducts(categoryId);

  if (isLoading) {
    return <ProductListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load products</p>
        <button 
          onClick={() => refetch()}
          className="mt-2 text-blue-500 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No products found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Compound Components

```typescript
// components/Card/index.tsx
interface CardContextValue {
  variant: 'default' | 'outlined';
}

const CardContext = createContext<CardContextValue | null>(null);

function useCardContext() {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('Card components must be used within Card');
  }
  return context;
}

interface CardProps {
  variant?: 'default' | 'outlined';
  children: React.ReactNode;
}

export function Card({ variant = 'default', children }: CardProps) {
  return (
    <CardContext.Provider value={{ variant }}>
      <div className={cn(
        'rounded-lg',
        variant === 'outlined' ? 'border' : 'bg-white shadow'
      )}>
        {children}
      </div>
    </CardContext.Provider>
  );
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-3 border-b">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-4">{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-3 border-t bg-gray-50">{children}</div>;
};

// Usage
<Card variant="outlined">
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

## Data Fetching

### React Query Hooks

```typescript
// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Product, CreateProductInput } from '../types';

// Query keys factory
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Fetch single product
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => api.get<{ data: Product }>(`/products/${id}`)
      .then(r => r.data.data),
    enabled: !!id,
  });
}

// Fetch product list
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => api.get<{ data: Product[]; meta: PaginationMeta }>(
      '/products',
      { params: filters }
    ).then(r => r.data),
  });
}

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) =>
      api.post<{ data: Product }>('/products', input)
        .then(r => r.data.data),
    
    onSuccess: () => {
      // Invalidate product lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateProductInput) =>
      api.patch<{ data: Product }>(`/products/${id}`, input)
        .then(r => r.data.data),
    
    onSuccess: (product) => {
      // Update cache for this product
      queryClient.setQueryData(productKeys.detail(product.id), product);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
```

### Optimistic Updates

```typescript
// hooks/useUpdateCart.ts
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      api.patch(`/cart/items/${itemId}`, { quantity }),
    
    // Optimistic update
    onMutate: async ({ itemId, quantity }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData<Cart>(['cart']);

      // Optimistically update
      queryClient.setQueryData<Cart>(['cart'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        };
      });

      return { previousCart };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    
    // Refetch after mutation
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
```

## Form Handling

### Form with React Hook Form + Zod

```typescript
// components/ProductForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(5000).optional(),
  priceCents: z.number().min(0, 'Price cannot be negative'),
  categoryId: z.string().uuid('Select a category'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      if (error instanceof ApiError) {
        // Set field-specific errors from API
        error.details?.forEach((detail) => {
          setError(detail.field as keyof ProductFormData, {
            message: detail.message,
          });
        });
      } else {
        setError('root', { message: 'An unexpected error occurred' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {errors.root && (
        <div className="bg-red-50 text-red-500 p-3 rounded">
          {errors.root.message}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          {...register('name')}
          className={cn(
            'mt-1 block w-full rounded border p-2',
            errors.name && 'border-red-500'
          )}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="priceCents" className="block text-sm font-medium">
          Price (cents)
        </label>
        <input
          id="priceCents"
          type="number"
          {...register('priceCents', { valueAsNumber: true })}
          className={cn(
            'mt-1 block w-full rounded border p-2',
            errors.priceCents && 'border-red-500'
          )}
        />
        {errors.priceCents && (
          <p className="mt-1 text-sm text-red-500">{errors.priceCents.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

## Feedback Patterns

### Haptic Feedback Hook

```typescript
// hooks/useHaptic.ts
export function useHaptic() {
  const isSupported = 'vibrate' in navigator;

  const impact = (style: 'light' | 'medium' | 'heavy') => {
    if (!isSupported) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };
    
    navigator.vibrate(patterns[style]);
  };

  const notification = (type: 'success' | 'warning' | 'error') => {
    if (!isSupported) return;
    
    const patterns = {
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [30, 100, 30, 100, 30],
    };
    
    navigator.vibrate(patterns[type]);
  };

  return { impact, notification, isSupported };
}
```

### Button with Feedback

```typescript
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  haptic?: boolean;
}

export function Button({
  variant = 'primary',
  loading,
  haptic = true,
  onClick,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const { impact } = useHaptic();
  const [pressed, setPressed] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    // Immediate haptic (0ms)
    if (haptic) impact('light');
    
    onClick?.(e);
  };

  const handlePointerDown = () => {
    if (!disabled && !loading) {
      setPressed(true);
    }
  };

  const handlePointerUp = () => {
    setPressed(false);
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      disabled={disabled || loading}
      className={cn(
        'relative px-4 py-2 rounded font-medium transition-transform',
        pressed && 'scale-95',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        variant === 'danger' && 'bg-red-500 text-white',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
      )}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" />
        </span>
      )}
      <span className={cn(loading && 'invisible')}>{children}</span>
    </button>
  );
}
```

### Toast Notifications

```typescript
// components/Toast.tsx
import { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// Usage
const { addToast } = useToast();

const handleSave = async () => {
  try {
    await saveProduct(data);
    addToast('success', 'Product saved successfully');
  } catch (error) {
    addToast('error', 'Failed to save product');
  }
};
```

## State Management

### Local Component State

```typescript
// components/Counter.tsx
export function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);

  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

### Reducer for Complex State

```typescript
// components/CheckoutWizard.tsx
type CheckoutState = {
  step: 'cart' | 'shipping' | 'payment' | 'confirmation';
  shippingAddress: Address | null;
  paymentMethod: PaymentMethod | null;
  error: string | null;
};

type CheckoutAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_SHIPPING'; payload: Address }
  | { type: 'SET_PAYMENT'; payload: PaymentMethod }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'NEXT_STEP':
      const steps: CheckoutState['step'][] = ['cart', 'shipping', 'payment', 'confirmation'];
      const currentIndex = steps.indexOf(state.step);
      return {
        ...state,
        step: steps[currentIndex + 1] ?? state.step,
        error: null,
      };
    case 'PREV_STEP':
      const stepsBack: CheckoutState['step'][] = ['cart', 'shipping', 'payment', 'confirmation'];
      const idx = stepsBack.indexOf(state.step);
      return {
        ...state,
        step: stepsBack[idx - 1] ?? state.step,
        error: null,
      };
    case 'SET_SHIPPING':
      return { ...state, shippingAddress: action.payload };
    case 'SET_PAYMENT':
      return { ...state, paymentMethod: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function CheckoutWizard() {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  // Component implementation
}
```

### Context for Shared State

```typescript
// context/CartContext.tsx
interface CartContextValue {
  items: CartItem[];
  addItem: (productId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: cart, refetch } = useCart();
  const addItemMutation = useAddCartItem();
  const removeItemMutation = useRemoveCartItem();
  const updateQuantityMutation = useUpdateCartItem();

  const value: CartContextValue = {
    items: cart?.items ?? [],
    addItem: (productId, quantity) => {
      addItemMutation.mutate({ productId, quantity });
    },
    removeItem: (itemId) => {
      removeItemMutation.mutate(itemId);
    },
    updateQuantity: (itemId, quantity) => {
      updateQuantityMutation.mutate({ itemId, quantity });
    },
    total: cart?.totalCents ?? 0,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
}
```

## Performance Patterns

### Memoization

```typescript
// Memo component
const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  return <div>{/* ... */}</div>;
});

// Memoized callback
function ProductList({ onSelect }: { onSelect: (id: string) => void }) {
  const handleSelect = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);

  return products.map(p => (
    <ProductCard key={p.id} product={p} onSelect={handleSelect} />
  ));
}

// Memoized value
function ExpensiveCalculation({ items }: { items: Item[] }) {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  return <div>Total: {total}</div>;
}
```

### Code Splitting

```typescript
// Lazy load pages
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  );
}
```

### Virtualized Lists

```typescript
// components/VirtualizedProductList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedProductList({ products }: { products: Product[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated row height
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ProductCard product={products[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```
