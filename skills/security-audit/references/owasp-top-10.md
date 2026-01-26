# OWASP Top 10

Detailed analysis of the OWASP Top 10 Web Application Security Risks (2021).

## A01: Broken Access Control

### Description
Users can act outside their intended permissions. This includes accessing other users' data, modifying data without permission, and privilege escalation.

### Common Vulnerabilities

**Insecure Direct Object Reference (IDOR)**
```typescript
// VULNERABLE: No ownership check
app.get('/api/orders/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order);
});

// SECURE: Verify ownership
app.get('/api/orders/:id', async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    customerId: req.user.id
  });
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});
```

**Missing Function-Level Access Control**
```typescript
// VULNERABLE: No role check
app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// SECURE: Role-based access
app.delete('/api/users/:id', requireRole('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
```

**Path Traversal**
```typescript
// VULNERABLE: User controls file path
app.get('/files/:filename', (req, res) => {
  res.sendFile(`/uploads/${req.params.filename}`);
});
// Attack: GET /files/../../../etc/passwd

// SECURE: Validate and sanitize
app.get('/files/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filepath = path.join('/uploads', filename);
  
  if (!filepath.startsWith('/uploads/')) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  res.sendFile(filepath);
});
```

### Prevention
- Deny by default except for public resources
- Implement access control once, reuse everywhere
- Log access control failures, alert on repeated failures
- Disable directory listing
- Use server-side sessions for access control

## A02: Cryptographic Failures

### Description
Failures related to cryptography that lead to sensitive data exposure. Includes weak algorithms, improper key management, and missing encryption.

### Common Vulnerabilities

**Weak Password Hashing**
```typescript
// VULNERABLE: MD5/SHA1 without salt
const hash = crypto.createHash('md5').update(password).digest('hex');

// SECURE: bcrypt with appropriate cost
const hash = await bcrypt.hash(password, 12);
```

**Missing Encryption at Rest**
```typescript
// VULNERABLE: Plain text sensitive data
await db.users.insert({ ssn: '123-45-6789' });

// SECURE: Encrypted sensitive fields
const encryptedSSN = encrypt(ssn, process.env.ENCRYPTION_KEY);
await db.users.insert({ ssn: encryptedSSN });
```

**Weak TLS Configuration**
```typescript
// VULNERABLE: Allows weak protocols
const server = https.createServer({
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem'),
});

// SECURE: Strong TLS configuration
const server = https.createServer({
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem'),
  minVersion: 'TLSv1.2',
  ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256',
});
```

### Prevention
- Classify data by sensitivity
- Encrypt all sensitive data at rest
- Use TLS 1.2+ for data in transit
- Use strong algorithms (AES-256, bcrypt, Argon2)
- Don't store sensitive data unnecessarily
- Rotate keys regularly

## A03: Injection

### Description
Hostile data sent to an interpreter as part of a command or query. Includes SQL, NoSQL, OS, and LDAP injection.

### Common Vulnerabilities

**SQL Injection**
```typescript
// VULNERABLE: String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;

// SECURE: Parameterized query
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);
```

**NoSQL Injection**
```typescript
// VULNERABLE: Accepts operators from input
const user = await User.findOne({
  email: req.body.email,
  password: req.body.password  // Could be { $gt: '' }
});

// SECURE: Type coercion
const user = await User.findOne({
  email: String(req.body.email),
  password: String(req.body.password)
});
```

**Command Injection**
```typescript
// VULNERABLE: Shell interpolation
exec(`ping -c 4 ${hostname}`);
// Attack: hostname = "google.com; rm -rf /"

// SECURE: Argument array, no shell
execFile('ping', ['-c', '4', hostname]);
```

**Template Injection**
```typescript
// VULNERABLE: User input in template
const template = `Hello ${req.query.name}!`;
res.render(template);

// SECURE: Data passed to template
res.render('greeting', { name: req.query.name });
```

### Prevention
- Use parameterized queries everywhere
- Use ORM/ODM with proper escaping
- Validate and sanitize all input
- Use allow-lists for permitted values
- Escape special characters

## A04: Insecure Design

### Description
Missing or ineffective security controls. Flaws in design that cannot be fixed by perfect implementation.

### Common Vulnerabilities

**Missing Rate Limiting**
```typescript
// VULNERABLE: No rate limiting on login
app.post('/login', async (req, res) => {
  // Allows unlimited password attempts
});

// SECURE: Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});

app.post('/login', loginLimiter, async (req, res) => {
  // ...
});
```

**Insufficient Anti-Automation**
```typescript
// VULNERABLE: No CAPTCHA on signup
app.post('/signup', async (req, res) => {
  await createUser(req.body);
});

// SECURE: CAPTCHA for sensitive operations
app.post('/signup', verifyCaptcha, async (req, res) => {
  await createUser(req.body);
});
```

### Prevention
- Use threat modeling during design
- Establish secure development lifecycle
- Use secure design patterns library
- Limit resource consumption per user
- Segregate tenants robustly

## A05: Security Misconfiguration

### Description
Improper configuration of security controls. Includes default credentials, unnecessary features, and verbose errors.

### Common Vulnerabilities

**Verbose Error Messages**
```typescript
// VULNERABLE: Stack traces to users
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack  // Exposes internal details!
  });
});

// SECURE: Generic errors to users
app.use((err, req, res, next) => {
  logger.error(err);  // Log detailed error internally
  res.status(500).json({
    error: 'An unexpected error occurred'
  });
});
```

**Default Credentials**
```typescript
// VULNERABLE: Default admin password
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

// SECURE: Required configuration
if (!process.env.ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD environment variable required');
}
```

**Unnecessary Features Enabled**
```typescript
// VULNERABLE: Debug mode in production
app.use(express.static('public', { dotfiles: 'allow' }));

// SECURE: Disable unnecessary features
app.use(express.static('public', { 
  dotfiles: 'deny',
  index: false
}));
```

### Prevention
- Automated hardening process
- Minimal platform without unnecessary features
- Review and update configurations regularly
- Segmented architecture
- Send security directives to clients

## A06: Vulnerable and Outdated Components

### Description
Using components with known vulnerabilities. Includes libraries, frameworks, and other software modules.

### Detection

```bash
# npm audit
npm audit

# Snyk
snyk test

# Check specific package
npm view lodash versions
npm audit --package-lock-only
```

### Prevention

```json
// package.json - Pin versions
{
  "dependencies": {
    "express": "4.18.2",
    "lodash": "^4.17.21"
  }
}
```

```yaml
# GitHub Dependabot
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
    open-pull-requests-limit: 10
```

### Remediation
- Remove unused dependencies
- Continuously inventory component versions
- Only obtain components from official sources
- Monitor for unmaintained libraries
- Create process for updating components

## A07: Identification and Authentication Failures

### Description
Confirmation of user identity and session management failures.

### Common Vulnerabilities

**Weak Password Policy**
```typescript
// VULNERABLE: No password requirements
const isValid = password.length > 0;

// SECURE: Strong password requirements
const isValid = 
  password.length >= 12 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password) &&
  !commonPasswords.includes(password);
```

**Session Fixation**
```typescript
// VULNERABLE: Session ID not regenerated
app.post('/login', (req, res) => {
  // ... authenticate
  req.session.userId = user.id;
});

// SECURE: Regenerate session on auth
app.post('/login', (req, res) => {
  // ... authenticate
  req.session.regenerate((err) => {
    req.session.userId = user.id;
    res.redirect('/dashboard');
  });
});
```

**Credential Stuffing**
```typescript
// SECURE: Multi-factor + rate limiting + breach detection
app.post('/login', 
  rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }),
  async (req, res) => {
    const user = await authenticate(req.body);
    
    if (await isBreachedPassword(req.body.password)) {
      return res.status(401).json({
        error: 'Password found in breach database'
      });
    }
    
    if (user.mfaEnabled) {
      return res.json({ requiresMfa: true });
    }
    
    // ... complete login
  }
);
```

### Prevention
- Implement multi-factor authentication
- Don't ship with default credentials
- Implement weak password checks
- Limit failed login attempts
- Use server-side session management

## A08: Software and Data Integrity Failures

### Description
Code and infrastructure that doesn't protect against integrity violations. Includes insecure deserialization and CI/CD vulnerabilities.

### Common Vulnerabilities

**Insecure Deserialization**
```typescript
// VULNERABLE: Deserializing untrusted data
const data = JSON.parse(req.body.data);
const user = Object.assign(new User(), data);  // Prototype pollution!

// SECURE: Explicit property assignment
const data = JSON.parse(req.body.data);
const user = new User();
user.name = String(data.name);
user.email = String(data.email);
```

**Missing Integrity Verification**
```typescript
// VULNERABLE: No integrity check on updates
app.post('/update', (req, res) => {
  eval(req.body.code);  // Code execution!
});

// SECURE: Signed updates only
app.post('/update', (req, res) => {
  const { code, signature } = req.body;
  if (!verifySignature(code, signature, publicKey)) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  // Process verified code
});
```

### Prevention
- Use digital signatures for data/code
- Verify npm packages come from expected sources
- Use CI/CD pipeline security
- Don't send serialized objects to untrusted clients

## A09: Security Logging and Monitoring Failures

### Description
Insufficient logging, detection, and response to active attacks.

### What to Log

```typescript
const securityLogger = {
  authSuccess: (userId: string, ip: string) => {
    logger.info('AUTH_SUCCESS', { userId, ip, timestamp: Date.now() });
  },
  
  authFailure: (email: string, ip: string, reason: string) => {
    logger.warn('AUTH_FAILURE', { email, ip, reason, timestamp: Date.now() });
  },
  
  accessDenied: (userId: string, resource: string, action: string) => {
    logger.warn('ACCESS_DENIED', { userId, resource, action, timestamp: Date.now() });
  },
  
  suspiciousActivity: (details: object) => {
    logger.error('SUSPICIOUS_ACTIVITY', { ...details, timestamp: Date.now() });
  },
};
```

### What NOT to Log

```typescript
// NEVER log:
// - Passwords (even hashed)
// - Session tokens
// - API keys
// - Credit card numbers
// - Social security numbers
// - Full authentication tokens

// BAD
logger.info('Login attempt', { email, password });

// GOOD
logger.info('Login attempt', { email: maskEmail(email) });
```

### Prevention
- Log all login, access control, and input validation failures
- Ensure logs can be consumed by log management solutions
- Establish alerting thresholds
- Create incident response plan

## A10: Server-Side Request Forgery (SSRF)

### Description
Application fetches remote resource without validating user-supplied URL.

### Common Vulnerabilities

```typescript
// VULNERABLE: Fetch arbitrary URLs
app.get('/proxy', async (req, res) => {
  const response = await fetch(req.query.url);
  res.send(await response.text());
});
// Attack: GET /proxy?url=http://169.254.169.254/latest/meta-data/

// SECURE: URL validation
const ALLOWED_HOSTS = ['api.trusted.com', 'cdn.trusted.com'];

app.get('/proxy', async (req, res) => {
  const url = new URL(req.query.url);
  
  if (!ALLOWED_HOSTS.includes(url.hostname)) {
    return res.status(400).json({ error: 'Host not allowed' });
  }
  
  if (url.protocol !== 'https:') {
    return res.status(400).json({ error: 'HTTPS required' });
  }
  
  const response = await fetch(url.toString());
  res.send(await response.text());
});
```

### Prevention
- Sanitize and validate all user-supplied URLs
- Use allow-list of permitted URLs/domains
- Disable HTTP redirects
- Don't send raw responses to clients
- Block requests to private IP ranges
