# Memory Patterns

Patterns that indicate memory leaks, unbounded growth, or stack overflow risks. These cause slow degradation and eventual crashes—the worst kind of production issue.

## Why This Matters

Memory issues are insidious. They don't fail immediately—they fail after hours or days in production. AI-generated code often creates closures and event handlers without considering cleanup. By the time you notice memory growing, the damage is done.

Your job: Catch memory leaks before they reach production.

## Detection Patterns

### Pattern 1: Event Listener Without Cleanup

**Anti-pattern:**
```javascript
// VULNERABLE - listener never removed
function MyComponent() {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // No cleanup!
  }, []);
}

class Tracker {
  start() {
    document.addEventListener('click', this.onClick);
    // Never removed
  }
}
```

**Detection signal:** `addEventListener` without corresponding `removeEventListener` in cleanup/destructor.

**Why it leaks:** Each component mount adds a new listener. Listeners hold references to component closures, preventing garbage collection.

**Fix:**
```javascript
// SAFE - cleanup in useEffect return
function MyComponent() {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
}

// SAFE - cleanup in class destructor
class Tracker {
  start() {
    document.addEventListener('click', this.onClick);
  }
  stop() {
    document.removeEventListener('click', this.onClick);
  }
}
```

### Pattern 2: Closure Capturing Too Much

**Anti-pattern:**
```javascript
// VULNERABLE - closure captures entire large object
function createHandler(hugeData) {
  return () => {
    console.log(hugeData.items[0].name);  // Only needs one property
  };
  // hugeData stays in memory as long as handler exists
}

// VULNERABLE - closure in long-lived callback
function setup(config) {
  setInterval(() => {
    // This closure keeps 'config' alive forever
    ping(config.endpoint);
  }, 60000);
}
```

**Detection signal:** Functions returned or passed as callbacks that reference outer scope variables, especially large objects or objects containing large objects.

**Fix:**
```javascript
// SAFE - extract only what's needed
function createHandler(hugeData) {
  const name = hugeData.items[0].name;
  return () => {
    console.log(name);  // Only captures the string
  };
}

// SAFE - extract needed values
function setup(config) {
  const endpoint = config.endpoint;
  setInterval(() => {
    ping(endpoint);  // Only captures string
  }, 60000);
}
```

### Pattern 3: Unbounded Cache or Collection

**Anti-pattern:**
```javascript
// VULNERABLE - cache grows forever
const cache = {};
function getData(id) {
  if (!cache[id]) {
    cache[id] = fetchData(id);
  }
  return cache[id];
}

// VULNERABLE - history grows forever
const history = [];
function recordAction(action) {
  history.push(action);
}
```

**Detection signal:** Objects/arrays that only have additions (push, set) without removals or size limits.

**Fix:**
```javascript
// SAFE - bounded cache with LRU eviction
const cache = new Map();
const MAX_CACHE_SIZE = 1000;

function getData(id) {
  if (cache.has(id)) {
    const value = cache.get(id);
    // Move to end (most recently used)
    cache.delete(id);
    cache.set(id, value);
    return value;
  }
  
  const value = fetchData(id);
  cache.set(id, value);
  
  // Evict oldest if over limit
  if (cache.size > MAX_CACHE_SIZE) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
  
  return value;
}

// SAFE - bounded history
const MAX_HISTORY = 100;
function recordAction(action) {
  history.push(action);
  if (history.length > MAX_HISTORY) {
    history.shift();  // Remove oldest
  }
}
```

### Pattern 4: Subscription Without Unsubscribe

**Anti-pattern:**
```javascript
// VULNERABLE - subscription never cancelled
useEffect(() => {
  const subscription = eventBus.subscribe('update', handleUpdate);
  // No unsubscribe!
}, []);

// VULNERABLE - observable subscription leak
function loadData() {
  dataService.getData().subscribe(data => {
    this.data = data;
  });
  // Subscription lives forever
}
```

**Detection signal:** `.subscribe()`, `.on()`, or similar subscription patterns without corresponding cleanup.

**Fix:**
```javascript
// SAFE - unsubscribe in cleanup
useEffect(() => {
  const subscription = eventBus.subscribe('update', handleUpdate);
  return () => subscription.unsubscribe();
}, []);

// SAFE - store and clean up subscription
class DataComponent {
  private subscription: Subscription;
  
  loadData() {
    this.subscription = dataService.getData().subscribe(data => {
      this.data = data;
    });
  }
  
  destroy() {
    this.subscription?.unsubscribe();
  }
}
```

### Pattern 5: Timer Without Cleanup

**Anti-pattern:**
```javascript
// VULNERABLE - interval never cleared
function startPolling() {
  setInterval(() => {
    checkForUpdates();
  }, 5000);
}

// VULNERABLE - component creates interval without cleanup
useEffect(() => {
  setInterval(tick, 1000);
}, []);
```

**Detection signal:** `setInterval` or `setTimeout` (in loops/recursion) without `clearInterval`/`clearTimeout`.

**Fix:**
```javascript
// SAFE - store and clear interval
function startPolling() {
  const intervalId = setInterval(() => {
    checkForUpdates();
  }, 5000);
  
  return () => clearInterval(intervalId);  // Return cleanup function
}

// SAFE - cleanup in useEffect
useEffect(() => {
  const intervalId = setInterval(tick, 1000);
  return () => clearInterval(intervalId);
}, []);
```

### Pattern 6: Circular References

**Anti-pattern:**
```javascript
// VULNERABLE - circular reference
const parent = { name: 'parent' };
const child = { name: 'child', parent: parent };
parent.child = child;  // Circular

// VULNERABLE - self-referential closure
function createNode() {
  const node = {
    process: () => {
      return node.value * 2;  // Closure references node
    }
  };
  return node;
}
```

**Detection signal:** Object A references B, B references A. Or closure references the object it's attached to.

**Why it matters:** Modern GCs handle this, but it can prevent cleanup in some contexts (WeakMap, certain frameworks) and makes debugging harder.

**Fix:**
```javascript
// SAFE - break circular reference when done
function cleanup() {
  parent.child = null;
  child.parent = null;
}

// SAFE - pass value explicitly
function createNode() {
  const node = {
    process: function() {
      return this.value * 2;  // Uses 'this' instead of closure
    }
  };
  return node;
}
```

### Pattern 7: Deep Recursion Without Limit

**Anti-pattern:**
```javascript
// VULNERABLE - can overflow stack
function processTree(node) {
  process(node);
  for (const child of node.children) {
    processTree(child);  // No depth limit
  }
}

// VULNERABLE - recursive with user input
function parse(input, depth = 0) {
  // No maximum depth check
  return input.children.map(c => parse(c, depth + 1));
}
```

**Detection signal:** Recursive functions without explicit depth limit, especially when processing user input or external data.

**Why it's dangerous:** Stack size is limited (typically 10-20K frames). Malicious or malformed input can crash the process.

**Fix:**
```javascript
// SAFE - explicit depth limit
const MAX_DEPTH = 100;

function processTree(node, depth = 0) {
  if (depth > MAX_DEPTH) {
    throw new Error('Maximum tree depth exceeded');
  }
  process(node);
  for (const child of node.children) {
    processTree(child, depth + 1);
  }
}

// SAFE - iterative approach for arbitrary depth
function processTree(root) {
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    process(node);
    stack.push(...node.children);
  }
}
```

### Pattern 8: Held References in Static/Global Scope

**Anti-pattern:**
```javascript
// VULNERABLE - static reference to instance
class Service {
  static instance = null;
  static lastRequest = null;  // Holds reference to potentially large request
  
  handleRequest(req) {
    Service.lastRequest = req;  // Stored forever
    // ...
  }
}
```

**Detection signal:** Static class properties or module-level variables that store instance references.

**Fix:**
```javascript
// SAFE - use WeakRef for optional caching
class Service {
  static lastRequestRef = null;
  
  handleRequest(req) {
    Service.lastRequestRef = new WeakRef(req);  // Can be GC'd
    // ...
  }
  
  getLastRequest() {
    return Service.lastRequestRef?.deref();  // May return undefined
  }
}

// Or just don't store it statically if not needed
```

## Quick Reference Table

| Pattern | Detection Signal | Severity | Fix Strategy |
|---------|------------------|----------|--------------|
| Event listener leak | addEventListener without remove | High | Remove in cleanup/destructor |
| Closure capture | Callback referencing large objects | Medium | Extract needed values |
| Unbounded cache | Collection without size limit | High | Add max size + eviction |
| Subscription leak | .subscribe() without unsubscribe | High | Store and cleanup subscription |
| Timer leak | setInterval without clear | High | Store ID, clear on cleanup |
| Circular reference | Object A ↔ B | Low | Break refs when done |
| Deep recursion | Recursive fn without depth limit | High | Add limit or use iteration |
| Static references | Module/static vars holding instances | Medium | WeakRef or scoped storage |

## Verification Checklist

For every code block, scan for:

1. [ ] addEventListener without matching removeEventListener in cleanup
2. [ ] Closures passed to long-lived callbacks (timers, event handlers) that capture large objects
3. [ ] Objects/arrays with push/set but no removal or size limits
4. [ ] .subscribe(), .on() without corresponding cleanup
5. [ ] setInterval without clearInterval in cleanup path
6. [ ] Mutual object references (A.b = B; B.a = A)
7. [ ] Recursive functions without maximum depth enforcement
8. [ ] Static/module-level variables that store instance references

If any found: **FAIL** with location and fix.
