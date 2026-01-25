# Writing Guidelines

Best practices for clear, effective technical writing.

## Core Principles

### 1. Know Your Audience

| Audience | Assume They Know | Don't Assume They Know |
|----------|------------------|------------------------|
| **New developers** | Programming basics | Your codebase, domain |
| **Experienced devs** | General best practices | Your specific implementation |
| **End users** | How to use software | Technical details |
| **Operators** | Infrastructure basics | Your service internals |

### 2. Front-Load Important Information

```markdown
❌ BAD: Buries the lede
After you've installed the dependencies and configured your environment 
variables, you can run the migration script by executing `npm run migrate`, 
which will set up your database tables.

✅ GOOD: Important information first
Run `npm run migrate` to set up database tables.

Prerequisites:
- Install dependencies: `npm install`
- Configure environment: Copy `.env.example` to `.env`
```

### 3. Be Concise

| Verbose | Concise |
|---------|---------|
| In order to | To |
| At this point in time | Now |
| Due to the fact that | Because |
| In the event that | If |
| It is necessary to | Must / Need to |
| Prior to | Before |
| Is able to | Can |
| Make use of | Use |

```markdown
❌ VERBOSE:
In order to make use of the authentication functionality, it is necessary 
for you to first generate an API key prior to making any requests.

✅ CONCISE:
Generate an API key before making requests.
```

### 4. Use Active Voice

```markdown
❌ PASSIVE:
The configuration file should be created by the user.
The request will be processed by the server.
Errors are logged by the system.

✅ ACTIVE:
Create a configuration file.
The server processes the request.
The system logs errors.
```

### 5. Use Simple Words

| Complex | Simple |
|---------|--------|
| Utilize | Use |
| Facilitate | Help / Enable |
| Leverage | Use |
| Implement | Build / Add |
| Terminate | End / Stop |
| Initialize | Start / Set up |
| Functionality | Feature |
| Methodology | Method |

## Structure Guidelines

### Use Headings Effectively

```markdown
# Document Title (H1 - one per document)

## Major Section (H2)

### Subsection (H3)

#### Detail (H4 - use sparingly)
```

### Use Lists Appropriately

**Use bullets for:**
- Unordered items
- Features
- Requirements

**Use numbers for:**
1. Sequential steps
2. Ranked items
3. Procedures

**Avoid:**
- Single-item lists
- Deeply nested lists (>2 levels)
- Mixing bullets and numbers unnecessarily

### Use Tables for Comparisons

```markdown
| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Users | 5 | 50 | Unlimited |
| Storage | 1GB | 10GB | 100GB |
| Support | Community | Email | 24/7 Phone |
```

### Use Code Blocks

````markdown
Inline code for `short references` like variable names.

Code blocks for longer examples:

```javascript
const result = await api.getData();
console.log(result);
```
````

## Formatting Guidelines

### Emphasis

```markdown
Use **bold** for:
- UI elements: Click **Save**
- Important warnings: **Do not delete**
- Key terms on first use

Use *italics* for:
- Introducing terms: An *API* is...
- Titles: See *Getting Started*
- Emphasis in prose: This is *very* important

Use `code` for:
- Commands: Run `npm install`
- File names: Edit `config.json`
- Variable names: Set `API_KEY`
- Code references: The `User` class
```

### Callouts

```markdown
> **Note:** Additional information that's helpful but not critical.

> **Warning:** Information about potential problems.

> **Tip:** Helpful suggestions for better usage.

> **Important:** Critical information that affects functionality.
```

### Links

```markdown
Good: See the [API documentation](./api.md) for details.

Avoid: Click [here](./api.md) for API documentation.
Avoid: See the API documentation at https://example.com/docs/api/v1/reference/endpoints/users.md
```

## Writing Procedures

### Step-by-Step Instructions

```markdown
## Install the Application

1. Download the installer:
   ```bash
   curl -O https://example.com/install.sh
   ```

2. Make it executable:
   ```bash
   chmod +x install.sh
   ```

3. Run the installer:
   ```bash
   ./install.sh
   ```
   
   You should see: `Installation complete!`

4. Verify the installation:
   ```bash
   myapp --version
   ```
```

### Prerequisites

```markdown
## Prerequisites

Before you begin, ensure you have:

- [ ] Node.js 18 or later ([download](https://nodejs.org/))
- [ ] npm 9 or later (included with Node.js)
- [ ] A GitHub account
- [ ] Git installed and configured
```

## Common Patterns

### Defining Terms

```markdown
An *API key* is a unique identifier used to authenticate requests.

**OAuth** (Open Authorization) is a protocol for token-based authentication.
```

### Providing Examples

```markdown
For example, to fetch a user:

```javascript
const user = await api.users.get('usr_123');
```

This returns:

```json
{
  "id": "usr_123",
  "name": "Alice"
}
```
```

### Explaining Options

```markdown
The `timeout` option controls how long to wait:

| Value | Behavior |
|-------|----------|
| `0` | No timeout (wait forever) |
| `> 0` | Wait N milliseconds |
| Not set | Default: 5000ms |

Example:
```javascript
const client = new Client({ timeout: 10000 });
```
```

### Warning About Dangers

```markdown
> **⚠️ Warning:** This action cannot be undone. All data will be permanently deleted.

> **🔒 Security:** Never commit API keys to version control.
```

## Editing Checklist

Before publishing, verify:

### Accuracy
- [ ] Code examples work (test them!)
- [ ] Commands are correct
- [ ] Links are not broken
- [ ] Version numbers are current

### Clarity
- [ ] Jargon is explained or avoided
- [ ] Sentences are under 25 words
- [ ] One idea per paragraph
- [ ] Steps are in correct order

### Completeness
- [ ] All prerequisites listed
- [ ] Error cases covered
- [ ] Next steps provided

### Formatting
- [ ] Consistent heading levels
- [ ] Code is syntax-highlighted
- [ ] Tables are aligned
- [ ] No orphaned headings

### Style
- [ ] Active voice used
- [ ] Concise language
- [ ] Consistent terminology
- [ ] No spelling errors

## Common Mistakes

### Assuming Knowledge

```markdown
❌ BAD:
Configure the webhook endpoint.

✅ GOOD:
Configure the webhook endpoint:
1. Go to Settings > Webhooks
2. Click "Add Webhook"
3. Enter your endpoint URL
4. Select events to receive
5. Click "Save"
```

### Missing Context

```markdown
❌ BAD:
Run `npm run build`.

✅ GOOD:
From the project root directory, run:
```bash
npm run build
```
```

### Unclear Pronouns

```markdown
❌ BAD:
After the user submits the form, it validates the data and then it shows a message.

✅ GOOD:
After the user submits the form, the server validates the data and displays a confirmation message.
```

### Wall of Text

```markdown
❌ BAD:
The authentication system uses JWT tokens that are issued when a user logs in with valid credentials. These tokens contain encoded claims about the user's identity and permissions and must be included in the Authorization header of subsequent requests. Tokens expire after 24 hours at which point the user must log in again or use a refresh token to obtain a new access token.

✅ GOOD:
The authentication system uses JWT tokens.

**How it works:**
1. User logs in with credentials
2. Server issues a JWT token
3. Client includes token in `Authorization` header
4. Tokens expire after 24 hours

**Token contents:**
- User identity
- Permissions
- Expiration time
```
