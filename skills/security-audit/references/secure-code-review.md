# Secure Code Review

Security-focused code review checklist and patterns.

## Security Review Mindset

When reviewing code for security:
1. **Think adversarially** — How could this be abused?
2. **Follow the data** — Where does input come from? Where does it go?
3. **Check trust boundaries** — What crosses from untrusted to trusted?
4. **Verify assumptions** — What does the code assume that might be wrong?

## Input Validation

### Checklist

```markdown
- [ ] All user input validated server-side
- [ ] Validation uses allow-lists, not deny-lists
- [ ] Input length limits enforced
- [ ] Input type/format validated
- [ ] Validation errors don't leak information
- [ ] File uploads validated (type, size, name)
```

### Review Patterns

```typescript
// RED FLAG: No validation
app.post('/api/users', (req, res) => {
  db.users.insert(req.body);  // Accepts anything!
});

// RED FLAG: Client-side only validation
// If validation only happens in JavaScript, it can be bypassed

// RED FLAG: Deny-list approach
if (!input.includes('<script>')) {  // Easy to bypass
  // process input
}

// GREEN: Allow-list validation
const schema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s]+$/),
  age: z.number().int().min(0).max(150),
});

const validated = schema.parse(req.body);
```

## Output Encoding

### Checklist

```markdown
- [ ] HTML output encoded for context
- [ ] JavaScript strings properly escaped
- [ ] URL parameters encoded
- [ ] JSON responses properly serialized
- [ ] SQL queries use parameters
- [ ] Shell commands don't use string interpolation
```

### Context-Aware Encoding

```typescript
// HTML Body Context
const safe = escapeHtml(userInput);
// <div>${safe}</div>

// HTML Attribute Context
const safe = escapeHtmlAttr(userInput);
// <input value="${safe}">

// JavaScript Context
const safe = JSON.stringify(userInput);
// <script>const data = ${safe};</script>

// URL Parameter Context
const safe = encodeURIComponent(userInput);
// <a href="/search?q=${safe}">

// CSS Context
const safe = escapeCss(userInput);
// <style>.class { color: ${safe}; }</style>
```

### XSS Prevention

```typescript
// RED FLAG: innerHTML with user data
element.innerHTML = userInput;

// RED FLAG: document.write
document.write(userInput);

// RED FLAG: eval() with user data
eval(userInput);

// RED FLAG: React dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// GREEN: textContent (safe)
element.textContent = userInput;

// GREEN: Parameterized DOM manipulation
const el = document.createElement('div');
el.textContent = userInput;
parent.appendChild(el);

// GREEN: React auto-escaping
<div>{userInput}</div>
```

## Authentication

### Checklist

```markdown
- [ ] Passwords hashed with bcrypt/Argon2 (not MD5/SHA1)
- [ ] Password requirements enforced
- [ ] Brute force protection (rate limiting, lockout)
- [ ] Session tokens cryptographically random
- [ ] Sessions invalidated on logout
- [ ] Session regenerated after login
- [ ] Secure cookie flags set (HttpOnly, Secure, SameSite)
- [ ] Password reset tokens single-use and time-limited
- [ ] MFA option available for sensitive accounts
```

### Review Patterns

```typescript
// RED FLAG: Weak hashing
crypto.createHash('md5').update(password).digest('hex');
crypto.createHash('sha1').update(password).digest('hex');

// RED FLAG: Missing salt
bcrypt.hashSync(password, 1);  // Cost factor too low

// RED FLAG: Predictable tokens
const token = Date.now().toString();
const token = Math.random().toString();

// RED FLAG: Insecure comparison (timing attack)
if (token === storedToken) { }

// GREEN: Proper password hashing
await bcrypt.hash(password, 12);

// GREEN: Secure random tokens
crypto.randomBytes(32).toString('hex');

// GREEN: Timing-safe comparison
crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
```

## Authorization

### Checklist

```markdown
- [ ] Every endpoint has authorization check
- [ ] Authorization checked server-side
- [ ] Direct object references validated against user
- [ ] Role changes logged and audited
- [ ] Principle of least privilege applied
- [ ] Admin functions separately protected
- [ ] Horizontal access control (user A can't access user B's data)
- [ ] Vertical access control (regular user can't access admin functions)
```

### Review Patterns

```typescript
// RED FLAG: Missing authorization
app.get('/api/documents/:id', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  res.json(doc);  // Anyone can access any document!
});

// RED FLAG: Client-side only authorization
// Hiding UI elements but not checking server-side

// RED FLAG: Trusting user input for authorization
app.post('/api/admin', (req, res) => {
  if (req.body.isAdmin) {  // User controls this!
    // admin action
  }
});

// GREEN: Proper authorization
app.get('/api/documents/:id', authenticate, async (req, res) => {
  const doc = await Document.findOne({
    _id: req.params.id,
    $or: [
      { ownerId: req.user.id },
      { sharedWith: req.user.id }
    ]
  });
  
  if (!doc) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  res.json(doc);
});
```

## Data Protection

### Checklist

```markdown
- [ ] Sensitive data identified and classified
- [ ] Encryption at rest for sensitive data
- [ ] TLS for all communications
- [ ] Secrets not in source code
- [ ] Secrets not logged
- [ ] PII minimized (collect only what's needed)
- [ ] Data retention policies implemented
- [ ] Secure deletion when required
```

### Review Patterns

```typescript
// RED FLAG: Hardcoded secrets
const API_KEY = 'sk_live_abc123';
const password = 'admin123';

// RED FLAG: Secrets in logs
console.log('Request:', { headers: req.headers });  // May contain auth tokens
logger.info('User login', { password });  // Logging password!

// RED FLAG: Unencrypted sensitive data
await db.users.insert({ ssn: '123-45-6789' });

// RED FLAG: HTTP for sensitive data
fetch('http://api.example.com/login', { body: credentials });

// GREEN: Environment variables for secrets
const API_KEY = process.env.API_KEY;

// GREEN: Encrypted sensitive data
const encrypted = encrypt(ssn, process.env.ENCRYPTION_KEY);
await db.users.insert({ ssn: encrypted });

// GREEN: Masked logging
logger.info('User login', { email: maskEmail(email) });
```

## Error Handling

### Checklist

```markdown
- [ ] Errors don't expose stack traces to users
- [ ] Errors don't expose system information
- [ ] Errors don't expose SQL queries
- [ ] Generic error messages for users
- [ ] Detailed errors logged securely
- [ ] Failed operations don't leave partial state
- [ ] Fail secure (deny by default)
```

### Review Patterns

```typescript
// RED FLAG: Exposing internal errors
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
    query: err.sql
  });
});

// RED FLAG: Different errors reveal information
if (!user) return res.status(404).json({ error: 'User not found' });
if (!passwordMatch) return res.status(401).json({ error: 'Wrong password' });
// Reveals which emails exist!

// GREEN: Generic errors to users
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { err, requestId: req.id });
  res.status(500).json({ error: 'An error occurred', requestId: req.id });
});

// GREEN: Consistent auth errors
if (!user || !passwordMatch) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

## Cryptography

### Checklist

```markdown
- [ ] Using current, strong algorithms
- [ ] Not inventing custom cryptography
- [ ] Keys generated securely
- [ ] Keys stored securely
- [ ] IVs/nonces are random and unique
- [ ] Proper key derivation for passwords
```

### Algorithm Guidance

| Purpose | Recommended | Avoid |
|---------|-------------|-------|
| Password hashing | Argon2, bcrypt, scrypt | MD5, SHA1, SHA256 (without KDF) |
| Symmetric encryption | AES-256-GCM | DES, 3DES, AES-ECB |
| Asymmetric encryption | RSA-2048+, ECDSA P-256+ | RSA-1024 |
| Hashing (non-password) | SHA-256, SHA-3 | MD5, SHA1 |
| Random numbers | crypto.randomBytes | Math.random |

### Review Patterns

```typescript
// RED FLAG: Custom crypto
function encrypt(data, key) {
  return data.split('').map((c, i) => 
    String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');
}

// RED FLAG: ECB mode
crypto.createCipheriv('aes-256-ecb', key, '');

// RED FLAG: Static IV
const iv = Buffer.from('0000000000000000');

// RED FLAG: Math.random for security
const token = Math.random().toString(36);

// GREEN: Standard library with proper usage
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
```

## File Handling

### Checklist

```markdown
- [ ] File type validated (not just extension)
- [ ] File size limits enforced
- [ ] Filename sanitized
- [ ] Files stored outside web root
- [ ] Uploaded files cannot be executed
- [ ] Path traversal prevented
```

### Review Patterns

```typescript
// RED FLAG: Path traversal
const file = `/uploads/${req.params.filename}`;
res.sendFile(file);
// Attack: /files/../../../etc/passwd

// RED FLAG: Trusting file extension
if (file.name.endsWith('.jpg')) {
  // Could be malicious.jpg.php
}

// RED FLAG: Executable uploads
// Storing uploads in /public where they can be accessed and executed

// GREEN: Safe file handling
const filename = path.basename(req.params.filename);  // Remove path
const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '');  // Sanitize
const filepath = path.join(UPLOAD_DIR, safeName);

// Verify it's still in upload directory
if (!filepath.startsWith(UPLOAD_DIR)) {
  return res.status(400).json({ error: 'Invalid path' });
}

// Validate file type by magic bytes, not extension
const fileType = await fileTypeFromBuffer(buffer);
if (!ALLOWED_TYPES.includes(fileType?.mime)) {
  return res.status(400).json({ error: 'Invalid file type' });
}
```

## Dependencies

### Checklist

```markdown
- [ ] Dependencies from trusted sources
- [ ] No known vulnerabilities (npm audit)
- [ ] Dependencies pinned to specific versions
- [ ] Lock file committed
- [ ] Unused dependencies removed
- [ ] Regular dependency updates scheduled
```

### Review Patterns

```json
// RED FLAG: Unpinned dependencies
{
  "dependencies": {
    "lodash": "*",
    "express": "latest"
  }
}

// RED FLAG: Missing lock file
// package-lock.json or yarn.lock not in repo

// GREEN: Pinned dependencies
{
  "dependencies": {
    "lodash": "4.17.21",
    "express": "^4.18.2"
  }
}
```

## Security Headers Review

```typescript
// Check for security headers
app.use(helmet());  // Sets many security headers

// Or manually:
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");
  
  // HTTPS only
  res.setHeader('Strict-Transport-Security', 
    'max-age=31536000; includeSubDomains');
  
  next();
});
```
