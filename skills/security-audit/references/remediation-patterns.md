# Remediation Patterns

Strategies for fixing security vulnerabilities.

## Remediation Principles

1. **Fix the root cause** — Don't just patch symptoms
2. **Defense in depth** — Multiple layers of protection
3. **Fail secure** — Errors should deny access
4. **Least privilege** — Minimum permissions necessary
5. **Verify the fix** — Test that vulnerability is closed

## Input Validation Patterns

### Validation Strategy

```typescript
// Defense in depth: validate at multiple layers

// 1. API Gateway / Edge
// Rate limiting, basic format checks

// 2. Application Layer
const userSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(100).regex(/^[\p{L}\s'-]+$/u),
  age: z.number().int().min(13).max(150).optional(),
});

// 3. Domain Layer
class User {
  constructor(data: ValidatedUserInput) {
    this.email = new Email(data.email);  // Value object validates
    this.name = new PersonName(data.name);
  }
}

// 4. Database Layer
// Constraints, triggers
```

### Allow-List Validation

```typescript
// For enumerated values
const ALLOWED_ROLES = ['user', 'editor', 'admin'] as const;
type Role = typeof ALLOWED_ROLES[number];

function setRole(role: string): Role {
  if (!ALLOWED_ROLES.includes(role as Role)) {
    throw new ValidationError(`Invalid role: ${role}`);
  }
  return role as Role;
}

// For file types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

async function validateUpload(file: Express.Multer.File) {
  const type = await fileTypeFromBuffer(file.buffer);
  if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
    throw new ValidationError('Invalid file type');
  }
}
```

### Sanitization

```typescript
// HTML sanitization for rich text
import DOMPurify from 'dompurify';

function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
  });
}

// Filename sanitization
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')  // Replace unsafe chars
    .replace(/\.{2,}/g, '.')           // No directory traversal
    .substring(0, 255);                // Length limit
}

// URL sanitization
function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}
```

## Authentication Hardening

### Password Security

```typescript
import bcrypt from 'bcrypt';
import { zxcvbn } from '@zxcvbn-ts/core';

const PASSWORD_MIN_SCORE = 3;  // 0-4 scale

async function setPassword(userId: string, password: string): Promise<void> {
  // Check password strength
  const strength = zxcvbn(password);
  if (strength.score < PASSWORD_MIN_SCORE) {
    throw new ValidationError('Password is too weak', {
      suggestions: strength.feedback.suggestions
    });
  }
  
  // Check against breached passwords
  if (await isBreachedPassword(password)) {
    throw new ValidationError('Password found in data breach');
  }
  
  // Hash with bcrypt
  const hash = await bcrypt.hash(password, 12);
  
  await db.users.update(userId, { passwordHash: hash });
}

// Breached password check (k-anonymity)
async function isBreachedPassword(password: string): Promise<boolean> {
  const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = hash.substring(0, 5);
  const suffix = hash.substring(5);
  
  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await response.text();
  
  return text.split('\n').some(line => line.startsWith(suffix));
}
```

### Session Management

```typescript
// Secure session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  name: '__Host-session',  // Cookie prefix for extra security
  cookie: {
    secure: true,           // HTTPS only
    httpOnly: true,         // No JavaScript access
    sameSite: 'strict',     // CSRF protection
    maxAge: 3600000,        // 1 hour
    path: '/',
  },
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({ client: redisClient }),  // Server-side storage
};

// Session lifecycle
class SessionService {
  async createSession(userId: string, req: Request): Promise<void> {
    // Regenerate to prevent fixation
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    req.session.userId = userId;
    req.session.createdAt = Date.now();
    req.session.ip = req.ip;
    req.session.userAgent = req.headers['user-agent'];
  }
  
  async destroySession(req: Request): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  validateSession(req: Request): boolean {
    if (!req.session.userId) return false;
    
    // Check session age
    const maxAge = 24 * 60 * 60 * 1000;  // 24 hours
    if (Date.now() - req.session.createdAt > maxAge) {
      return false;
    }
    
    // Optional: validate IP (may cause issues with mobile)
    // if (req.session.ip !== req.ip) return false;
    
    return true;
  }
}
```

### Multi-Factor Authentication

```typescript
import { authenticator } from 'otplib';

class MfaService {
  async setupMfa(userId: string): Promise<{ secret: string; qrCode: string }> {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(userId, 'MyApp', secret);
    
    // Store encrypted secret
    const encrypted = encrypt(secret);
    await db.users.update(userId, { mfaSecret: encrypted, mfaEnabled: false });
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpauth);
    
    return { secret, qrCode };
  }
  
  async verifyAndEnable(userId: string, token: string): Promise<boolean> {
    const user = await db.users.findById(userId);
    const secret = decrypt(user.mfaSecret);
    
    if (!authenticator.verify({ token, secret })) {
      return false;
    }
    
    await db.users.update(userId, { mfaEnabled: true });
    return true;
  }
  
  async verify(userId: string, token: string): Promise<boolean> {
    const user = await db.users.findById(userId);
    if (!user.mfaEnabled) return true;  // MFA not required
    
    const secret = decrypt(user.mfaSecret);
    return authenticator.verify({ token, secret });
  }
}
```

## Authorization Patterns

### Role-Based Access Control (RBAC)

```typescript
// Role definitions
const ROLES = {
  user: {
    permissions: ['read:own', 'write:own'],
  },
  editor: {
    permissions: ['read:own', 'write:own', 'read:all', 'write:all'],
  },
  admin: {
    permissions: ['read:own', 'write:own', 'read:all', 'write:all', 'admin'],
  },
};

// Permission check middleware
function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role || 'anonymous';
    const roleConfig = ROLES[userRole];
    
    if (!roleConfig?.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
}

// Usage
app.get('/api/documents', requirePermission('read:all'), listDocuments);
app.delete('/api/users/:id', requirePermission('admin'), deleteUser);
```

### Attribute-Based Access Control (ABAC)

```typescript
// Policy definition
interface Policy {
  resource: string;
  action: string;
  condition: (user: User, resource: any) => boolean;
}

const policies: Policy[] = [
  {
    resource: 'document',
    action: 'read',
    condition: (user, doc) => 
      doc.isPublic || 
      doc.ownerId === user.id || 
      doc.sharedWith.includes(user.id),
  },
  {
    resource: 'document',
    action: 'write',
    condition: (user, doc) => 
      doc.ownerId === user.id || 
      (doc.editors?.includes(user.id)),
  },
  {
    resource: 'document',
    action: 'delete',
    condition: (user, doc) => 
      doc.ownerId === user.id || 
      user.role === 'admin',
  },
];

// Policy enforcement
function checkAccess(user: User, action: string, resource: string, object: any): boolean {
  const policy = policies.find(p => 
    p.resource === resource && p.action === action
  );
  
  if (!policy) return false;  // Deny by default
  
  return policy.condition(user, object);
}

// Usage
app.get('/api/documents/:id', authenticate, async (req, res) => {
  const doc = await Document.findById(req.params.id);
  
  if (!checkAccess(req.user, 'read', 'document', doc)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  res.json(doc);
});
```

## Data Protection

### Encryption at Rest

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encrypted: string): string {
  const [ivHex, authTagHex, ciphertext] = encrypted.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Field-level encryption
class EncryptedField {
  static encrypt(value: string): string {
    return encrypt(value);
  }
  
  static decrypt(value: string): string {
    return decrypt(value);
  }
}
```

### Data Masking

```typescript
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `**@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `***-***-${digits.slice(-4)}`;
}

function maskCreditCard(cc: string): string {
  const digits = cc.replace(/\D/g, '');
  return `****-****-****-${digits.slice(-4)}`;
}

function maskSSN(ssn: string): string {
  return `***-**-${ssn.slice(-4)}`;
}

// Usage in logging
logger.info('User updated', {
  email: maskEmail(user.email),
  phone: maskPhone(user.phone),
});
```

## Security Headers

```typescript
import helmet from 'helmet';

// Comprehensive security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'strict-dynamic'"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // Consider using nonces
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.example.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));
```

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ client: redisClient }),
});

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts' },
  skipSuccessfulRequests: true,  // Only count failures
  store: new RedisStore({ client: redisClient }),
});

// Per-user rate limit
const userLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 30,
  keyGenerator: (req) => req.user?.id || req.ip,
  store: new RedisStore({ client: redisClient }),
});

app.use('/api', apiLimiter);
app.use('/auth', authLimiter);
app.use('/api', authenticate, userLimiter);
```

## Logging and Monitoring

```typescript
// Security event logger
class SecurityLogger {
  private logger: Logger;
  
  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      transports: [
        new transports.File({ filename: 'security.log' }),
        // Send critical events to SIEM
        new SIEMTransport({ level: 'warn' }),
      ],
    });
  }
  
  authSuccess(userId: string, ip: string, userAgent: string) {
    this.logger.info('AUTH_SUCCESS', {
      event: 'auth_success',
      userId,
      ip,
      userAgent,
    });
  }
  
  authFailure(email: string, ip: string, reason: string) {
    this.logger.warn('AUTH_FAILURE', {
      event: 'auth_failure',
      email: maskEmail(email),
      ip,
      reason,
    });
  }
  
  accessDenied(userId: string, resource: string, action: string) {
    this.logger.warn('ACCESS_DENIED', {
      event: 'access_denied',
      userId,
      resource,
      action,
    });
  }
  
  suspiciousActivity(details: object) {
    this.logger.error('SUSPICIOUS_ACTIVITY', {
      event: 'suspicious_activity',
      ...details,
    });
  }
}
```
