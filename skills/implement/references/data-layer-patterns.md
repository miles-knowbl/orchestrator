# Data Layer Patterns

Patterns for implementing database models, migrations, and repositories.

## Migration Patterns

### Migration Structure

```typescript
// migrations/YYYYMMDD_HHMMSS_description.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Create tables, indexes, etc.
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Reverse the migration
}
```

### Creating Tables

```typescript
export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('products')
    // Primary key
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    
    // Foreign key
    .addColumn('category_id', 'uuid', (col) => 
      col.notNull().references('categories.id').onDelete('cascade'))
    
    // Required string with length
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    
    // Optional string
    .addColumn('description', 'text')
    
    // Integer with constraint
    .addColumn('price_cents', 'integer', (col) => 
      col.notNull().check(sql`price_cents >= 0`))
    
    // Enum-like column
    .addColumn('status', 'varchar(50)', (col) => 
      col.notNull().defaultTo('draft'))
    
    // JSON column
    .addColumn('metadata', 'jsonb', (col) => 
      col.notNull().defaultTo(sql`'{}'::jsonb`))
    
    // Boolean with default
    .addColumn('is_active', 'boolean', (col) => 
      col.notNull().defaultTo(true))
    
    // Timestamps
    .addColumn('created_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`))
    
    // Soft delete
    .addColumn('deleted_at', 'timestamptz')
    
    .execute();
}
```

### Adding Indexes

```typescript
// Single column index
await db.schema
  .createIndex('idx_products_category_id')
  .on('products')
  .column('category_id')
  .execute();

// Composite index
await db.schema
  .createIndex('idx_products_category_status')
  .on('products')
  .columns(['category_id', 'status'])
  .execute();

// Unique index
await db.schema
  .createIndex('idx_products_slug')
  .on('products')
  .column('slug')
  .unique()
  .execute();

// Partial index
await db.schema
  .createIndex('idx_active_products')
  .on('products')
  .column('name')
  .where('is_active', '=', true)
  .execute();

// GIN index for JSONB
await sql`CREATE INDEX idx_products_metadata ON products USING GIN (metadata)`.execute(db);
```

### Adding Constraints

```typescript
// Check constraint
await sql`
  ALTER TABLE products 
  ADD CONSTRAINT chk_products_price 
  CHECK (price_cents >= 0)
`.execute(db);

// Unique constraint
await sql`
  ALTER TABLE products 
  ADD CONSTRAINT uq_products_sku 
  UNIQUE (sku)
`.execute(db);
```

### Safe Migrations

```typescript
// Add column with default (safe)
await db.schema
  .alterTable('products')
  .addColumn('new_column', 'varchar(255)', (col) => 
    col.defaultTo('default_value'))
  .execute();

// Add NOT NULL with default (safe)
await db.schema
  .alterTable('products')
  .addColumn('required_column', 'varchar(255)', (col) => 
    col.notNull().defaultTo(''))
  .execute();

// Drop column (careful!)
await db.schema
  .alterTable('products')
  .dropColumn('old_column')
  .execute();
```

## Entity Models

### TypeScript Types

```typescript
// models/Product.ts

// Database row type (matches DB schema)
export interface ProductRow {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  status: string;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// Domain type (camelCase, transformed)
export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  priceCents: number;
  status: ProductStatus;
  metadata: ProductMetadata;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Status enum
export type ProductStatus = 'draft' | 'active' | 'archived';

// Metadata type
export interface ProductMetadata {
  weight?: number;
  dimensions?: { width: number; height: number; depth: number };
  tags?: string[];
}

// Create input (partial, no ID or timestamps)
export interface CreateProductInput {
  categoryId: string;
  name: string;
  description?: string;
  priceCents: number;
  metadata?: ProductMetadata;
}

// Update input (all optional except ID)
export interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  priceCents?: number;
  status?: ProductStatus;
  metadata?: ProductMetadata;
  isActive?: boolean;
}
```

### Mapping Functions

```typescript
// Map DB row to domain type
function mapRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    status: row.status as ProductStatus,
    metadata: row.metadata as ProductMetadata,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Map domain type to DB row (for inserts/updates)
function mapProductToRow(product: Partial<Product>): Partial<ProductRow> {
  const row: Partial<ProductRow> = {};
  
  if (product.categoryId !== undefined) row.category_id = product.categoryId;
  if (product.name !== undefined) row.name = product.name;
  if (product.description !== undefined) row.description = product.description;
  if (product.priceCents !== undefined) row.price_cents = product.priceCents;
  if (product.status !== undefined) row.status = product.status;
  if (product.metadata !== undefined) row.metadata = product.metadata;
  if (product.isActive !== undefined) row.is_active = product.isActive;
  
  return row;
}
```

## Repository Pattern

### Base Repository

```typescript
// repositories/BaseRepository.ts
import { Kysely, Insertable, Updateable, Selectable } from 'kysely';
import { Database } from '../database';

export abstract class BaseRepository<
  TableName extends keyof Database,
  Row = Selectable<Database[TableName]>,
  InsertRow = Insertable<Database[TableName]>,
  UpdateRow = Updateable<Database[TableName]>,
> {
  constructor(
    protected db: Kysely<Database>,
    protected tableName: TableName,
  ) {}

  async findById(id: string): Promise<Row | null> {
    const row = await this.db
      .selectFrom(this.tableName)
      .selectAll()
      .where('id' as any, '=', id)
      .executeTakeFirst();
    
    return (row as Row) ?? null;
  }

  async findAll(): Promise<Row[]> {
    const rows = await this.db
      .selectFrom(this.tableName)
      .selectAll()
      .execute();
    
    return rows as Row[];
  }

  async create(data: InsertRow): Promise<Row> {
    const [row] = await this.db
      .insertInto(this.tableName)
      .values(data as any)
      .returningAll()
      .execute();
    
    return row as Row;
  }

  async update(id: string, data: UpdateRow): Promise<Row | null> {
    const [row] = await this.db
      .updateTable(this.tableName)
      .set(data as any)
      .where('id' as any, '=', id)
      .returningAll()
      .execute();
    
    return (row as Row) ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom(this.tableName)
      .where('id' as any, '=', id)
      .executeTakeFirst();
    
    return result.numDeletedRows > 0;
  }
}
```

### Specific Repository

```typescript
// repositories/ProductRepository.ts
import { db } from '../database';
import type { Product, CreateProductInput, UpdateProductInput } from '../models/Product';

export class ProductRepository {
  async findById(id: string): Promise<Product | null> {
    const row = await db
      .selectFrom('products')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return row ? mapRowToProduct(row) : null;
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const rows = await db
      .selectFrom('products')
      .selectAll()
      .where('category_id', '=', categoryId)
      .where('deleted_at', 'is', null)
      .where('is_active', '=', true)
      .orderBy('name', 'asc')
      .execute();

    return rows.map(mapRowToProduct);
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    const rows = await db
      .selectFrom('products')
      .selectAll()
      .where('id', 'in', ids)
      .where('deleted_at', 'is', null)
      .execute();

    return rows.map(mapRowToProduct);
  }

  async create(input: CreateProductInput): Promise<Product> {
    const [row] = await db
      .insertInto('products')
      .values({
        category_id: input.categoryId,
        name: input.name,
        description: input.description ?? null,
        price_cents: input.priceCents,
        metadata: input.metadata ?? {},
        status: 'draft',
        is_active: true,
      })
      .returningAll()
      .execute();

    return mapRowToProduct(row);
  }

  async update(input: UpdateProductInput): Promise<Product | null> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.priceCents !== undefined) updateData.price_cents = input.priceCents;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.metadata !== undefined) updateData.metadata = input.metadata;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;

    const [row] = await db
      .updateTable('products')
      .set(updateData)
      .where('id', '=', input.id)
      .where('deleted_at', 'is', null)
      .returningAll()
      .execute();

    return row ? mapRowToProduct(row) : null;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await db
      .updateTable('products')
      .set({ deleted_at: new Date() })
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return result.numUpdatedRows > 0;
  }

  async search(query: string, limit = 20): Promise<Product[]> {
    const rows = await db
      .selectFrom('products')
      .selectAll()
      .where('deleted_at', 'is', null)
      .where('is_active', '=', true)
      .where((eb) =>
        eb.or([
          eb('name', 'ilike', `%${query}%`),
          eb('description', 'ilike', `%${query}%`),
        ])
      )
      .orderBy('name', 'asc')
      .limit(limit)
      .execute();

    return rows.map(mapRowToProduct);
  }
}
```

## Query Patterns

### Pagination

```typescript
interface PaginationInput {
  page?: number;
  limit?: number;
}

interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async findPaginated(
  input: PaginationInput,
): Promise<PaginatedResult<Product>> {
  const page = input.page ?? 1;
  const limit = Math.min(input.limit ?? 20, 100);
  const offset = (page - 1) * limit;

  // Get total count
  const [{ count }] = await db
    .selectFrom('products')
    .select(db.fn.count('id').as('count'))
    .where('deleted_at', 'is', null)
    .execute();

  const total = Number(count);

  // Get page data
  const rows = await db
    .selectFrom('products')
    .selectAll()
    .where('deleted_at', 'is', null)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();

  return {
    data: rows.map(mapRowToProduct),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

### Cursor-Based Pagination

```typescript
interface CursorPaginationInput {
  cursor?: string;
  limit?: number;
}

interface CursorPaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
}

async findWithCursor(
  input: CursorPaginationInput,
): Promise<CursorPaginatedResult<Product>> {
  const limit = Math.min(input.limit ?? 20, 100);

  let query = db
    .selectFrom('products')
    .selectAll()
    .where('deleted_at', 'is', null)
    .orderBy('created_at', 'desc')
    .orderBy('id', 'desc')
    .limit(limit + 1); // Fetch one extra to check for next page

  if (input.cursor) {
    const [createdAt, id] = decodeCursor(input.cursor);
    query = query.where((eb) =>
      eb.or([
        eb('created_at', '<', createdAt),
        eb.and([
          eb('created_at', '=', createdAt),
          eb('id', '<', id),
        ]),
      ])
    );
  }

  const rows = await query.execute();
  const hasMore = rows.length > limit;
  const data = rows.slice(0, limit).map(mapRowToProduct);

  return {
    data,
    nextCursor: hasMore
      ? encodeCursor(data[data.length - 1].createdAt, data[data.length - 1].id)
      : null,
  };
}
```

### Batch Loading (DataLoader Pattern)

```typescript
// loaders/ProductLoader.ts
import DataLoader from 'dataloader';
import { ProductRepository } from '../repositories/ProductRepository';

export function createProductLoader(repo: ProductRepository) {
  return new DataLoader<string, Product | null>(async (ids) => {
    const products = await repo.findByIds([...ids]);
    const productMap = new Map(products.map(p => [p.id, p]));
    return ids.map(id => productMap.get(id) ?? null);
  });
}

// Usage
const loader = createProductLoader(productRepo);

// These will be batched into a single query
const [product1, product2, product3] = await Promise.all([
  loader.load('id-1'),
  loader.load('id-2'),
  loader.load('id-3'),
]);
```

### Joins and Relationships

```typescript
// Get product with category
async findWithCategory(id: string): Promise<ProductWithCategory | null> {
  const row = await db
    .selectFrom('products')
    .innerJoin('categories', 'categories.id', 'products.category_id')
    .select([
      'products.id',
      'products.name',
      'products.price_cents',
      'categories.id as category_id',
      'categories.name as category_name',
    ])
    .where('products.id', '=', id)
    .where('products.deleted_at', 'is', null)
    .executeTakeFirst();

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    priceCents: row.price_cents,
    category: {
      id: row.category_id,
      name: row.category_name,
    },
  };
}
```

### Transactions

```typescript
async createOrderWithItems(
  input: CreateOrderInput,
): Promise<Order> {
  return await db.transaction().execute(async (trx) => {
    // Create order
    const [orderRow] = await trx
      .insertInto('orders')
      .values({
        user_id: input.userId,
        status: 'pending',
        total_cents: 0,
      })
      .returningAll()
      .execute();

    // Create order items
    let totalCents = 0;
    for (const item of input.items) {
      const product = await trx
        .selectFrom('products')
        .select(['price_cents'])
        .where('id', '=', item.productId)
        .executeTakeFirst();

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      await trx
        .insertInto('order_items')
        .values({
          order_id: orderRow.id,
          product_id: item.productId,
          quantity: item.quantity,
          price_cents: product.price_cents,
        })
        .execute();

      totalCents += product.price_cents * item.quantity;
    }

    // Update order total
    const [updatedOrder] = await trx
      .updateTable('orders')
      .set({ total_cents: totalCents })
      .where('id', '=', orderRow.id)
      .returningAll()
      .execute();

    return mapRowToOrder(updatedOrder);
  });
}
```
