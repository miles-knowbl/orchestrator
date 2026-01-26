# Frontend Performance

Optimizing client-side performance and Core Web Vitals.

## Core Web Vitals

### Metrics

| Metric | Full Name | Measures | Good | Poor |
|--------|-----------|----------|------|------|
| **LCP** | Largest Contentful Paint | Loading | ≤2.5s | >4s |
| **FID** | First Input Delay | Interactivity | ≤100ms | >300ms |
| **CLS** | Cumulative Layout Shift | Visual stability | ≤0.1 | >0.25 |
| **FCP** | First Contentful Paint | Initial render | ≤1.8s | >3s |
| **TTFB** | Time to First Byte | Server response | ≤800ms | >1.8s |
| **TTI** | Time to Interactive | Full interactivity | ≤3.8s | >7.3s |

### Measuring

```typescript
// Using web-vitals library
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric.name, metric.value);
  
  // Send to your analytics
  fetch('/analytics', {
    method: 'POST',
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      navigationType: metric.navigationType,
    }),
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
getFCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## LCP Optimization

### What Affects LCP

- Slow server response
- Render-blocking resources
- Slow resource load times
- Client-side rendering

### Optimizations

```html
<!-- Preload critical resources -->
<link rel="preload" href="/hero-image.jpg" as="image">
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/main.js" as="script">

<!-- Preconnect to required origins -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://api.example.com">

<!-- Inline critical CSS -->
<style>
  /* Critical above-the-fold styles */
  .hero { /* ... */ }
</style>

<!-- Defer non-critical CSS -->
<link rel="preload" href="/non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

```typescript
// Optimize images
// Next.js Image component
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority  // Preload LCP image
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Native lazy loading
<img src="image.jpg" loading="lazy" alt="Below fold">
<img src="hero.jpg" loading="eager" alt="Above fold">  // Don't lazy load LCP
```

## FID/INP Optimization

### What Affects Interactivity

- Long JavaScript tasks (>50ms)
- Large JavaScript bundles
- Main thread blocking

### Optimizations

```typescript
// Break up long tasks
// BAD: Long synchronous operation
function processItems(items) {
  for (const item of items) {
    expensiveOperation(item);  // Blocks for 500ms
  }
}

// GOOD: Yield to main thread
async function processItems(items) {
  for (const item of items) {
    expensiveOperation(item);
    
    // Yield every 50ms
    if (shouldYield()) {
      await yieldToMain();
    }
  }
}

function shouldYield() {
  return performance.now() - lastYield > 50;
}

function yieldToMain() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Using scheduler.yield (when available)
async function processItems(items) {
  for (const item of items) {
    expensiveOperation(item);
    await scheduler.yield();
  }
}
```

```typescript
// Web Workers for heavy computation
// main.js
const worker = new Worker('/worker.js');

worker.postMessage({ data: largeDataSet });
worker.onmessage = (e) => {
  updateUI(e.data.result);
};

// worker.js
self.onmessage = (e) => {
  const result = heavyComputation(e.data);
  self.postMessage({ result });
};
```

## CLS Optimization

### What Causes Layout Shift

- Images without dimensions
- Ads, embeds, iframes without dimensions
- Dynamically injected content
- Web fonts causing FOIT/FOUT

### Optimizations

```html
<!-- Always include dimensions -->
<img src="image.jpg" width="800" height="600" alt="...">

<!-- Or use aspect-ratio -->
<style>
  .image-container {
    aspect-ratio: 16 / 9;
    width: 100%;
  }
</style>

<!-- Reserve space for ads -->
<style>
  .ad-slot {
    min-height: 250px;
  }
</style>

<!-- Font loading strategy -->
<style>
  @font-face {
    font-family: 'MyFont';
    src: url('/font.woff2') format('woff2');
    font-display: swap;  /* or optional */
  }
</style>

<!-- Preload fonts -->
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>
```

```typescript
// Avoid inserting content above existing content
// BAD
function addNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  document.body.prepend(notification);  // Shifts everything down
}

// GOOD
function addNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  // Use fixed positioning or reserved space
  document.getElementById('notification-area').appendChild(notification);
}
```

## Bundle Optimization

### Code Splitting

```typescript
// React lazy loading
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}

// Route-based splitting
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('./pages/Dashboard')),
  },
  {
    path: '/settings',
    component: lazy(() => import('./pages/Settings')),
  },
];
```

### Tree Shaking

```typescript
// BAD: Import entire library
import _ from 'lodash';
_.debounce(fn, 100);

// GOOD: Import specific functions
import debounce from 'lodash/debounce';
debounce(fn, 100);

// Or use lodash-es
import { debounce } from 'lodash-es';
```

### Bundle Analysis

```bash
# webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer

# In webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};

# Next.js
ANALYZE=true npm run build

# Vite
npx vite-bundle-visualizer
```

## Image Optimization

### Modern Formats

```html
<!-- Use picture element for format fallback -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="...">
</picture>

<!-- Responsive images -->
<img 
  srcset="image-320.jpg 320w,
          image-640.jpg 640w,
          image-1280.jpg 1280w"
  sizes="(max-width: 320px) 280px,
         (max-width: 640px) 580px,
         1200px"
  src="image-1280.jpg"
  alt="..."
>
```

### Lazy Loading

```typescript
// Native lazy loading
<img src="image.jpg" loading="lazy" alt="...">

// Intersection Observer for more control
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach((img) => {
  observer.observe(img);
});
```

## Caching Strategy

### HTTP Caching

```
# Static assets (immutable)
Cache-Control: public, max-age=31536000, immutable

# HTML (revalidate)
Cache-Control: no-cache

# API responses (short cache)
Cache-Control: private, max-age=60
```

### Service Worker

```typescript
// sw.js
const CACHE_NAME = 'v1';
const STATIC_ASSETS = [
  '/',
  '/styles.css',
  '/app.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache first, then network
      return response || fetch(event.request);
    })
  );
});

// Stale-while-revalidate
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cached) => {
        const fetched = fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
        return cached || fetched;
      });
    })
  );
});
```

## Rendering Patterns

### Server-Side Rendering (SSR)

```typescript
// Next.js
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}

// Benefits: Fast FCP, SEO
// Drawbacks: Slower TTFB, server load
```

### Static Site Generation (SSG)

```typescript
// Next.js
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data }, revalidate: 60 };
}

// Benefits: Fastest TTFB, CDN cacheable
// Drawbacks: Build time, stale data
```

### Client-Side Rendering (CSR)

```typescript
// React
function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  
  if (!data) return <Loading />;
  return <Content data={data} />;
}

// Benefits: Rich interactivity
// Drawbacks: Slow FCP, poor SEO
```

### Streaming SSR

```typescript
// React 18 with streaming
import { renderToPipeableStream } from 'react-dom/server';

app.get('/', (req, res) => {
  const { pipe } = renderToPipeableStream(<App />, {
    bootstrapScripts: ['/app.js'],
    onShellReady() {
      res.setHeader('Content-Type', 'text/html');
      pipe(res);
    },
  });
});
```

## Performance Budget

### Budget Configuration

```json
// budget.json (Lighthouse CI)
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }],
        "resource-summary:script:size": ["error", { "maxNumericValue": 100000 }]
      }
    }
  }
}
```

### Monitoring

```typescript
// Track performance in production
if ('PerformanceObserver' in window) {
  // Long tasks
  const longTaskObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 50) {
        console.warn('Long task detected:', entry);
        // Send to monitoring
      }
    }
  });
  longTaskObserver.observe({ entryTypes: ['longtask'] });
  
  // Layout shifts
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        console.warn('Layout shift:', entry);
      }
    }
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });
}
```

## Performance Checklist

```markdown
## Frontend Performance Checklist

### Critical Rendering Path
- [ ] Inline critical CSS
- [ ] Defer non-critical CSS
- [ ] Async/defer JavaScript
- [ ] Preload key resources
- [ ] Minimize render-blocking resources

### Images
- [ ] Use modern formats (WebP, AVIF)
- [ ] Responsive images with srcset
- [ ] Lazy load below-fold images
- [ ] Specify dimensions
- [ ] Compress appropriately

### JavaScript
- [ ] Code splitting implemented
- [ ] Tree shaking configured
- [ ] Bundle size under budget
- [ ] No long tasks (>50ms)
- [ ] Web Workers for heavy computation

### Fonts
- [ ] Preload critical fonts
- [ ] Use font-display: swap
- [ ] Subset fonts if possible
- [ ] Self-host if beneficial

### Caching
- [ ] Appropriate Cache-Control headers
- [ ] Service Worker for offline
- [ ] CDN for static assets
- [ ] API response caching

### Monitoring
- [ ] Core Web Vitals tracking
- [ ] Performance budget enforced
- [ ] Alerts for regressions
```
