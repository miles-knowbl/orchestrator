# Security Patterns

Patterns that indicate security vulnerabilities. These are critical failures—security issues must be fixed before code leaves the development loop.

## Why This Matters

AI code generators produce functionally correct code that often has security holes. They generate the "obvious" solution without considering adversarial input. A working login form with SQL injection is worse than no login form at all.

Your job: Catch these before they become breach headlines.

## Detection Patterns

### Pattern 1: SQL Injection

**Anti-pattern:**
```javascript
// VULNERABLE - string interpolation in SQL
const query = `SELECT * FROM users WHERE id = ${userId}`;
const query = "SELECT * FROM users WHERE name = '" + userName + "'";
```

**Detection signal:** Template literals or string concatenation containing SQL keywords (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `WHERE`, `FROM`).

**Why it's dangerous:** User input like `'; DROP TABLE users; --` becomes part of the query.

**Fix:**
```javascript
// SAFE - parameterized query
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);

// Or with ORM
const user = await User.findOne({ where: { id: userId } });
```

### Pattern 2: NoSQL Injection

**Anti-pattern:**
```javascript
// VULNERABLE - user input directly in query object
const user = await User.findOne({ 
  email: req.body.email,
  password: req.body.password  // Could be { $gt: "" }
});
```

**Detection signal:** Request body or query params used directly in MongoDB/NoSQL query objects.

**Why it's dangerous:** User can pass `{ "$gt": "" }` as password, which matches any non-empty password.

**Fix:**
```javascript
// SAFE - explicit string coercion
const user = await User.findOne({ 
  email: String(req.body.email),
  password: String(req.body.password)
});

// Or validate input types explicitly
if (typeof req.body.password !== 'string') {
  throw new ValidationError('Invalid password format');
}
```

### Pattern 3: Cross-Site Scripting (XSS)

**Anti-pattern:**
```javascript
// VULNERABLE - unescaped user content in HTML
element.innerHTML = userInput;
document.write(userInput);
return `<div>${userComment}</div>`;  // Server-side rendering
```

**Detection signal:** User-derived values assigned to `innerHTML`, `outerHTML`, `document.write()`, or interpolated into HTML strings server-side.

**Why it's dangerous:** User input like `<script>stealCookies()</script>` executes in other users' browsers.

**Fix:**
```javascript
// SAFE - use textContent for text
element.textContent = userInput;

// SAFE - use framework escaping (React does this automatically)
return <div>{userComment}</div>;

// SAFE - explicit sanitization if HTML needed
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

### Pattern 4: Command Injection

**Anti-pattern:**
```javascript
// VULNERABLE - user input in shell command
const exec = require('child_process').exec;
exec(`convert ${filename} output.png`);
exec('grep ' + searchTerm + ' /var/log/app.log');
```

**Detection signal:** User-derived values in `exec()`, `execSync()`, `spawn()` with `shell: true`, or any system command string.

**Why it's dangerous:** User input like `; rm -rf /` becomes part of the command.

**Fix:**
```javascript
// SAFE - use spawn with argument array (no shell)
const { spawn } = require('child_process');
spawn('convert', [filename, 'output.png']);

// SAFE - use library that handles escaping
// Or avoid shell entirely—use native libraries instead
```

### Pattern 5: Path Traversal

**Anti-pattern:**
```javascript
// VULNERABLE - user controls file path
const filePath = `./uploads/${req.params.filename}`;
const content = fs.readFileSync(filePath);

app.get('/files/:path', (req, res) => {
  res.sendFile(req.params.path);
});
```

**Detection signal:** User-derived values used in file paths, especially with `../` potential.

**Why it's dangerous:** User input like `../../../etc/passwd` accesses files outside intended directory.

**Fix:**
```javascript
// SAFE - validate and normalize path
const path = require('path');

const safePath = path.normalize(req.params.filename).replace(/^(\.\.(\/|\\|$))+/, '');
const fullPath = path.join(__dirname, 'uploads', safePath);

// Verify it's still within allowed directory
if (!fullPath.startsWith(path.join(__dirname, 'uploads'))) {
  throw new ForbiddenError('Invalid path');
}
```

### Pattern 6: Missing Authentication

**Anti-pattern:**
```javascript
// VULNERABLE - no auth check on sensitive endpoint
app.delete('/api/users/:id', async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});
```

**Detection signal:** Mutation endpoints (POST, PUT, DELETE) without authentication middleware or checks.

**Why it's dangerous:** Anyone can delete any user.

**Fix:**
```javascript
// SAFE - authentication required
app.delete('/api/users/:id', requireAuth, async (req, res) => {
  // Plus authorization check
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    throw new ForbiddenError('Cannot delete other users');
  }
  await User.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});
```

### Pattern 7: Insecure Direct Object Reference (IDOR)

**Anti-pattern:**
```javascript
// VULNERABLE - no ownership check
app.get('/api/orders/:orderId', requireAuth, async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  res.json(order);  // Returns ANY order, not just user's
});
```

**Detection signal:** Resource lookup by ID without filtering by current user's ownership.

**Why it's dangerous:** User can access other users' data by guessing/incrementing IDs.

**Fix:**
```javascript
// SAFE - include ownership in query
app.get('/api/orders/:orderId', requireAuth, async (req, res) => {
  const order = await Order.findOne({
    where: { 
      id: req.params.orderId,
      userId: req.user.id  // Only return if owned by current user
    }
  });
  if (!order) throw new NotFoundError('Order not found');
  res.json(order);
});
```

### Pattern 8: Sensitive Data Exposure

**Anti-pattern:**
```javascript
// VULNERABLE - password hash in response
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);  // Includes passwordHash, maybe SSN, etc.
});

// VULNERABLE - sensitive data in logs
console.log('Login attempt:', { email, password });
logger.info('Payment processed', { cardNumber, cvv });
```

**Detection signal:** 
- Model objects returned directly without field filtering
- Logging statements containing auth credentials, PII, or payment info

**Fix:**
```javascript
// SAFE - explicit field selection
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id, {
    attributes: ['id', 'name', 'email', 'createdAt']  // Whitelist
  });
  res.json(user);
});

// SAFE - redact sensitive fields
const { password, ...safeUser } = user.toJSON();
res.json(safeUser);

// SAFE - structured logging without sensitive data
logger.info('Payment processed', { 
  userId, 
  amount, 
  last4: cardNumber.slice(-4) 
});
```

### Pattern 9: Hardcoded Secrets

**Anti-pattern:**
```javascript
// VULNERABLE - secrets in code
const API_KEY = 'sk_live_abc123xyz789';
const dbPassword = 'production_password_123';
const jwtSecret = 'my-secret-key';
```

**Detection signal:** Strings that look like API keys, passwords, or secrets assigned to variables. Patterns:
- `sk_live_`, `sk_test_`, `pk_live_` (Stripe)
- `AKIA` prefix (AWS)
- Long alphanumeric strings assigned to variables named `key`, `secret`, `password`, `token`

**Fix:**
```javascript
// SAFE - environment variables
const API_KEY = process.env.STRIPE_API_KEY;
const jwtSecret = process.env.JWT_SECRET;

// And validate they exist
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable required');
}
```

### Pattern 10: Insufficient Input Validation

**Anti-pattern:**
```javascript
// VULNERABLE - no validation
app.post('/api/transfer', async (req, res) => {
  const { amount, toAccount } = req.body;
  await transfer(req.user.id, toAccount, amount);
});
```

**Detection signal:** Request body/params used without type checking or validation.

**Why it's dangerous:** User can pass negative amounts, wrong types, or extreme values.

**Fix:**
```javascript
// SAFE - explicit validation
app.post('/api/transfer', async (req, res) => {
  const { amount, toAccount } = req.body;
  
  if (typeof amount !== 'number' || amount <= 0 || amount > 1000000) {
    throw new ValidationError('Invalid amount');
  }
  if (typeof toAccount !== 'string' || !/^\d{10}$/.test(toAccount)) {
    throw new ValidationError('Invalid account number');
  }
  
  await transfer(req.user.id, toAccount, amount);
});

// Or use validation library
import { z } from 'zod';
const TransferSchema = z.object({
  amount: z.number().positive().max(1000000),
  toAccount: z.string().regex(/^\d{10}$/)
});
```

## Quick Reference Table

| Vulnerability | Detection Signal | Severity | Fix Strategy |
|--------------|------------------|----------|--------------|
| SQL Injection | String concat with SQL keywords | Critical | Parameterized queries |
| NoSQL Injection | Request body in query objects | Critical | Type coercion/validation |
| XSS | User input in innerHTML/HTML strings | Critical | textContent or sanitization |
| Command Injection | User input in exec/spawn | Critical | Argument arrays, no shell |
| Path Traversal | User input in file paths | High | Normalize + validate prefix |
| Missing Auth | Mutation without auth middleware | High | Add auth middleware |
| IDOR | Resource lookup without ownership | High | Include user ID in query |
| Data Exposure | Full model objects in response | Medium | Explicit field selection |
| Hardcoded Secrets | Key-like strings in code | High | Environment variables |
| Input Validation | Unvalidated request data | Medium | Schema validation |

## Verification Checklist

For every code block, scan for:

1. [ ] String concatenation/interpolation in database queries
2. [ ] Request body/params used directly in NoSQL query objects
3. [ ] User input assigned to innerHTML or interpolated in HTML
4. [ ] User input in shell commands (exec, spawn with shell)
5. [ ] User input in file paths without normalization
6. [ ] Mutation endpoints without auth middleware
7. [ ] Resource lookups without ownership filtering
8. [ ] Full model objects returned in API responses
9. [ ] Hardcoded strings that look like keys/secrets
10. [ ] Request data used without type/value validation

If any found: **FAIL** (Critical/High severity) with location and fix.
